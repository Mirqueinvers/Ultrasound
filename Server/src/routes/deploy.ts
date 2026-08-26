import { Router, raw } from "express";
import type { NextFunction, Request, Response } from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { config } from "../config.js";

/**
 * Веб-деплой сервера по локальной сети.
 *
 * POST /api/deploy          — загрузить zip-пакет обновления (заголовок x-deploy-token)
 * GET  /api/deploy/status   — статус развёртывания + хвост logs/deploy.log
 * GET  /deploy              — простая веб-страница для загрузки пакета
 *
 * Сам процесс обновления выполняется ОТДЕЛЬНЫМ процессом через планировщик
 * (schtasks, пользователь SYSTEM) — он переживает остановку службы и не зависит
 * от жизненного цикла API-процесса.
 */
const router = Router();

// Файл лежит в src/routes/ (или dist/routes/), корень сервера — на два уровня выше
const SERVER_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
);
const DEPLOY_DIR = path.join(SERVER_ROOT, "deploy");
const INCOMING_DIR = path.join(DEPLOY_DIR, "incoming");
const STATE_FILE = path.join(DEPLOY_DIR, "state.json");
const LATEST_ZIP_FILE = path.join(INCOMING_DIR, "latest.txt");
const RUNNER_SCRIPT = path.join(DEPLOY_DIR, "deploy-runner.cmd");
const LOG_FILE = path.join(SERVER_ROOT, "logs", "deploy.log");

const MAX_BODY = 50 * 1024 * 1024; // 50 МБ
const DEPLOY_LOCK_TTL_MS = 30 * 60 * 1000; // 30 минут — защита от «зависшего» статуса

interface DeployState {
  status: "idle" | "deploying" | "ok" | "failed";
  startedAt?: string;
  finishedAt?: string;
  zip?: string;
  message?: string;
}

/** Сравнение токенов без утечки по времени (через sha256 — длина не важна). */
function safeCompare(a: string, b: string): boolean {
  const ha = crypto.createHash("sha256").update(a).digest();
  const hb = crypto.createHash("sha256").update(b).digest();
  return crypto.timingSafeEqual(ha, hb);
}

function readState(): DeployState {
  try {
    const parsed: unknown = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    if (parsed && typeof parsed === "object" && "status" in parsed) {
      return parsed as DeployState;
    }
  } catch {
    // нет файла или повреждён — считаем, что деплой не запущен
  }
  return { status: "idle" };
}

function writeState(state: DeployState): void {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
}

function readLogTail(lines = 80): string {
  try {
    const content = fs.readFileSync(LOG_FILE, "utf8");
    return content.split(/\r?\n/).slice(-lines).join("\n");
  } catch {
    return "";
  }
}

function isDeployLocked(state: DeployState): boolean {
  if (state.status !== "deploying") return false;
  if (state.startedAt) {
    const age = Date.now() - new Date(state.startedAt).getTime();
    if (Number.isFinite(age) && age > DEPLOY_LOCK_TTL_MS) return false; // stale-лок
  }
  return true;
}

function requireToken(req: Request, res: Response, next: NextFunction): void {
  const token = req.get("x-deploy-token") || "";
  const expected = config.deployToken;
  if (!expected) {
    res.status(503).json({ error: "DEPLOY_TOKEN не задан в .env на сервере" });
    return;
  }
  if (!safeCompare(token, expected)) {
    res.status(401).json({ error: "Неверный DEPLOY_TOKEN" });
    return;
  }
  next();
}

/**
 * Создаёт и сразу запускает задачу планировщика, которая выполнит
 * deploy/deploy-runner.cmd от имени SYSTEM. Путь к пакету берётся из
 * deploy/incoming/latest.txt (без аргументов в /TR — проще с кавычками).
 * Задача удаляется сразу после запуска: выполняющийся процесс не прерывается.
 */
function scheduleDeploy(): Promise<void> {
  return new Promise((resolve, reject) => {
    const taskName = `UltrasoundDeploy_${Date.now()}`;
    // Время запуска — на 2 минуты в будущее (иначе schtasks ругается, что время в прошлом)
    const startAt = new Date(Date.now() + 2 * 60 * 1000);
    const hh = String(startAt.getHours()).padStart(2, "0");
    const mm = String(startAt.getMinutes()).padStart(2, "0");
    const inner = `cmd /c ""${RUNNER_SCRIPT}""`;
    const createCmd =
      `schtasks /Create /TN "${taskName}" /TR "${inner}" ` +
      `/SC ONCE /ST ${hh}:${mm} /RU SYSTEM /RL HIGHEST /F`;

    exec(createCmd, { windowsHide: true }, (err, _stdout, stderr) => {
      if (err) {
        reject(new Error(`schtasks /Create: ${stderr || err.message}`));
        return;
      }
      exec(`schtasks /Run /TN "${taskName}"`, { windowsHide: true }, (runErr) => {
        exec(`schtasks /Delete /TN "${taskName}" /F`, { windowsHide: true }, () => {
          if (runErr) {
            reject(new Error(`schtasks /Run: ${runErr.message}`));
            return;
          }
          resolve();
        });
      });
    });
  });
}


// POST /api/deploy — приём zip-пакета обновления
router.post(
  "/api/deploy",
  requireToken,
  raw({ type: "application/octet-stream", limit: MAX_BODY }),
  (req: Request, res: Response) => {
    const state = readState();
    if (isDeployLocked(state)) {
      res.status(409).json({
        error: "Развёртывание уже выполняется",
        state: { ...state, logTail: readLogTail() },
      });
      return;
    }

    const body: unknown = req.body;
    if (!Buffer.isBuffer(body) || body.length === 0) {
      res.status(400).json({
        error:
          "Ожидается zip-файл в теле запроса (Content-Type: application/octet-stream)",
      });
      return;
    }
    // Сигнатура ZIP: PK\x03\x04
    if (body.length < 4 || body[0] !== 0x50 || body[1] !== 0x4b) {
      res.status(400).json({ error: "Переданный файл не является ZIP-архивом" });
      return;
    }

    try {
      fs.mkdirSync(INCOMING_DIR, { recursive: true });
      const ts = new Date().toISOString().replace(/[:.]/g, "-");
      const zipPath = path.join(INCOMING_DIR, `deploy-${ts}.zip`);
      fs.writeFileSync(zipPath, body);
      fs.writeFileSync(LATEST_ZIP_FILE, zipPath, "utf8");

      writeState({
        status: "deploying",
        startedAt: new Date().toISOString(),
        zip: path.basename(zipPath),
      });

      if (!fs.existsSync(RUNNER_SCRIPT)) {
        writeState({
          status: "failed",
          finishedAt: new Date().toISOString(),
          message: "deploy-runner.cmd не найден в папке deploy/",
        });
        res
          .status(500)
          .json({ error: "deploy-runner.cmd не найден на сервере" });
        return;
      }

      scheduleDeploy()
        .then(() => {
          res.status(202).json({
            status: "deploying",
            message: "Развёртывание запущено",
            zip: path.basename(zipPath),
          });
        })
        .catch((err: Error) => {
          writeState({
            status: "failed",
            finishedAt: new Date().toISOString(),
            message: err.message,
          });
          res
            .status(500)
            .json({ error: `Не удалось запустить задачу обновления: ${err.message}` });
        });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      writeState({
        status: "failed",
        finishedAt: new Date().toISOString(),
        message,
      });
      res.status(500).json({ error: message });
    }
  }
);

// GET /api/deploy/status — статус + хвост лога
router.get("/api/deploy/status", requireToken, (_req: Request, res: Response) => {
  const state = readState();
  res.json({ ...state, logTail: readLogTail() });
});

// GET /deploy — веб-страница для загрузки пакета
router.get("/deploy", (_req: Request, res: Response) => {
  res.type("html").send(`<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Обновление Ultrasound API</title>
<style>
  body { font-family: 'Segoe UI', system-ui, sans-serif; max-width: 760px; margin: 24px auto; padding: 0 16px; color: #1f2937; }
  h1 { font-size: 22px; }
  .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin: 16px 0; background: #f9fafb; }
  label { display: block; margin: 10px 0 4px; font-weight: 600; font-size: 14px; }
  input[type=text], input[type=password], input[type=file] { width: 100%; padding: 8px; border: 1px solid #d1d5db; border-radius: 6px; box-sizing: border-box; font-size: 14px; }
  button { margin-top: 14px; padding: 10px 18px; font-size: 15px; border: 0; border-radius: 6px; background: #2563eb; color: #fff; cursor: pointer; }
  button:disabled { background: #9ca3af; cursor: not-allowed; }
  pre { background: #111827; color: #d1fae5; padding: 12px; border-radius: 8px; overflow: auto; max-height: 420px; font-size: 12px; line-height: 1.5; white-space: pre-wrap; word-break: break-word; }
  .status { font-size: 14px; margin-top: 8px; }
  .ok { color: #047857; font-weight: 600; }
  .bad { color: #b91c1c; font-weight: 600; }
  .busy { color: #b45309; font-weight: 600; }
  code { background: #f3f4f6; padding: 1px 5px; border-radius: 4px; }
</style>
</head>
<body>
<h1>🩺 Обновление Ultrasound API</h1>
<p>Загрузите архив <code>deploy-package.zip</code> (папки <code>src/</code>, <code>prisma/</code> и файлы конфигурации). Сервер остановится на время обновления и запустится автоматически.</p>
<div class="card">
  <label for="token">DEPLOY_TOKEN</label>
  <input type="password" id="token" autocomplete="off" placeholder="Токен из .env сервера">
  <label for="file">Пакет обновления (.zip)</label>
  <input type="file" id="file" accept=".zip">
  <button id="btn" onclick="startDeploy()">Развернуть</button>
  <div class="status" id="status"></div>
</div>
<div class="card">
  <label>Лог обновления (обновляется автоматически)</label>
  <pre id="log">—</pre>
</div>

<script>
  function $(id) { return document.getElementById(id); }
  function token() { return $("token").value.trim(); }
  var timer = null;

  function setStatus(text, cls) {
    var el = $("status");
    el.textContent = text;
    el.className = "status " + (cls || "");
  }

  function pollOnce() {
    fetch("/api/deploy/status", { headers: { "x-deploy-token": token() } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (data.logTail) $("log").textContent = data.logTail;
      })
      .catch(function () {});
  }

  function startPolling() {
    clearInterval(timer);
    timer = setInterval(function () {
      fetch("/api/deploy/status", { headers: { "x-deploy-token": token() } })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data.logTail) $("log").textContent = data.logTail;
          if (data.status === "ok") {
            setStatus("✅ Обновление успешно завершено", "ok");
            clearInterval(timer);
            $("btn").disabled = false;
          } else if (data.status === "failed") {
            setStatus("❌ Обновление завершилось с ошибкой", "bad");
            clearInterval(timer);
            $("btn").disabled = false;
          } else {
            setStatus("⏳ Развёртывание выполняется…", "busy");
          }
        })
        .catch(function () {
          // сервер может быть недоступен во время перезапуска
        });
    }, 2000);
  }

  function startDeploy() {
    var file = $("file").files[0];
    var t = token();
    if (!t) { setStatus("Укажите DEPLOY_TOKEN", "bad"); return; }
    if (!file) { setStatus("Выберите zip-файл", "bad"); return; }
    $("btn").disabled = true;
    setStatus("Отправка пакета…", "busy");
    fetch("/api/deploy", {
      method: "POST",
      headers: { "x-deploy-token": t, "Content-Type": "application/octet-stream" },
      body: file
    })
      .then(function (res) {
        return res.json().catch(function () { return {}; }).then(function (data) {
          if (!res.ok) throw new Error(data.error || ("HTTP " + res.status));
          return data;
        });
      })
      .then(function (data) {
        setStatus("Развёртывание запущено: " + (data.zip || ""), "ok");
        startPolling();
      })
      .catch(function (e) {
        setStatus("Ошибка: " + e.message, "bad");
        $("btn").disabled = false;
      });
  }

  window.addEventListener("load", pollOnce);
</script>
</body>
</html>`);
});

export default router;

