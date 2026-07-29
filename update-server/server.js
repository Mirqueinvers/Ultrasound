const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = 8080;

// Путь к папке release в Desktop
const releasePath = path.join(__dirname, "..", "Desktop", "release");

// Логирование запросов
app.use("/updates", (req, res, next) => {
  console.log(`[UpdateServer] ${req.method} ${req.url}`);
  next();
});

// Вычисление sha512 файла
function computeSha512(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha512");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("base64")));
    stream.on("error", reject);
  });
}

// Поиск последнего установщика
function findLatestExe() {
  const files = fs.readdirSync(releasePath);
  const exeFiles = files
    .filter((f) => f.startsWith("Ultrasound Setup ") && f.endsWith(".exe"))
    .sort()
    .reverse();
  return exeFiles.length > 0 ? exeFiles[0] : null;
}

// Динамическая генерация latest.yml
app.get("/updates/latest.yml", async (req, res) => {
  try {
    const latestExe = findLatestExe();
    if (!latestExe) {
      return res.status(404).send("No updates found");
    }

    const versionMatch = latestExe.match(/Ultrasound Setup ([\d.]+)\.exe/);
    if (!versionMatch) {
      return res.status(500).send("Cannot parse version from filename");
    }
    const version = versionMatch[1];

    const exePath = path.join(releasePath, latestExe);
    const stats = fs.statSync(exePath);
    const sha512 = await computeSha512(exePath);

    const blockmapFile = latestExe.replace(".exe", ".exe.blockmap");
    const hasBlockmap = fs.existsSync(path.join(releasePath, blockmapFile));

    const yml = [
      `version: ${version}`,
      `path: ${latestExe}`,
      `sha512: ${sha512}`,
      `releaseDate: ${stats.mtime.toISOString()}`,
      `files:`,
      `  - url: ${latestExe}`,
      `    sha512: ${sha512}`,
      `    size: ${stats.size}`,
      ...(hasBlockmap
        ? [
            `    blockMapSize: ${fs.statSync(path.join(releasePath, blockmapFile)).size}`,
          ]
        : []),
      "",
    ].join("\n");

    res.set("Content-Type", "text/yaml");
    res.send(yml);
  } catch (err) {
    console.error("[UpdateServer] Error generating latest.yml:", err);
    res.status(500).send("Internal server error");
  }
});

// Раздаём статику из release по /updates (exe, blockmap и т.д.)
app.use("/updates", express.static(releasePath));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[UpdateServer] Сервер обновлений запущен`);
  console.log(`[UpdateServer] http://0.0.0.0:${PORT}/updates`);
  console.log(`[UpdateServer] Раздаётся папка: ${releasePath}`);
});