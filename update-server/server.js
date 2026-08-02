const express = require("express");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const app = express();
const PORT = 8080;

// Пути к папкам release
const desktopReleasePath = path.join(__dirname, "..", "Desktop", "release");
const registryReleasePath = path.join(__dirname, "..", "Registry", "release");

// Логирование запросов
app.use((req, res, next) => {
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

// Поиск последнего установщика по паттерну имени
function findLatestInstaller(releasePath, namePattern) {
  let files = [];
  try {
    files = fs.readdirSync(releasePath);
  } catch {
    return null;
  }
  const exeFiles = files
    .filter((f) => f.startsWith(namePattern) && f.endsWith(".exe"))
    .sort()
    .reverse();
  return exeFiles.length > 0 ? exeFiles[0] : null;
}

// Генерация latest.yml для установщика
async function buildLatestYml(releasePath, namePattern) {
  const latestExe = findLatestInstaller(releasePath, namePattern);
  if (!latestExe) {
    return { error: "No updates found", status: 404 };
  }

  const escapedPattern = namePattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const versionMatch = latestExe.match(new RegExp(`${escapedPattern} ([\\d.]+)\\.exe`));
  if (!versionMatch) {
    return { error: "Cannot parse version from filename", status: 500 };
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

  return { yml, status: 200 };
}

// ==================== DESKTOP (Ultrasound Setup) ====================

// Динамическая генерация latest.yml для Desktop
app.get("/updates/latest.yml", async (req, res) => {
  try {
    const result = await buildLatestYml(desktopReleasePath, "Ultrasound Setup");
    if (result.error) {
      return res.status(result.status).send(result.error);
    }
    res.set("Content-Type", "text/yaml");
    res.send(result.yml);
  } catch (err) {
    console.error("[UpdateServer] Error generating desktop latest.yml:", err);
    res.status(500).send("Internal server error");
  }
});

// Раздаём статику из Desktop/release по /updates
app.use("/updates", express.static(desktopReleasePath));

// ==================== REGISTRY (Ultrasound Registry Setup) ====================

// Динамическая генерация latest.yml для Registry
app.get("/registry-updates/latest.yml", async (req, res) => {
  try {
    const result = await buildLatestYml(
      registryReleasePath,
      "Ultrasound Registry Setup"
    );
    if (result.error) {
      return res.status(result.status).send(result.error);
    }
    res.set("Content-Type", "text/yaml");
    res.send(result.yml);
  } catch (err) {
    console.error("[UpdateServer] Error generating registry latest.yml:", err);
    res.status(500).send("Internal server error");
  }
});

// Раздаём статику из Registry/release по /registry-updates
app.use("/registry-updates", express.static(registryReleasePath));

app.listen(PORT, "0.0.0.0", () => {
  console.log(`[UpdateServer] Сервер обновлений запущен`);
  console.log(`[UpdateServer] http://0.0.0.0:${PORT}/updates`);
  console.log(`[UpdateServer]   -> Desktop:  ${desktopReleasePath}`);
  console.log(`[UpdateServer] http://0.0.0.0:${PORT}/registry-updates`);
  console.log(`[UpdateServer]   -> Registry: ${registryReleasePath}`);
});