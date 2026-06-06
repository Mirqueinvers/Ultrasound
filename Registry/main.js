const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

let mainWindow;
let viteProcess;
let viteUrl = null;

async function startApiServer() {
  try {
    const { startApiServer: runApi } = require("./dist-api/api");
    await runApi();
    console.log("[API] Server started on port 3456");
  } catch (err) {
    console.error("[API] Failed to start:", err.message);
  }
}

function startViteDevServer() {
  return new Promise((resolve, reject) => {
    const viteCmd = path.join(__dirname, "node_modules", ".bin", "vite.cmd");
    viteProcess = spawn(viteCmd, ["--port", "5175"], {
      cwd: __dirname,
      stdio: "pipe",
      shell: true,
    });

    let resolved = false;

    viteProcess.stdout?.on("data", (data) => {
      const msg = data.toString();
      console.log(`[Vite] ${msg.trim()}`);
      // Парсим URL: "Local:   http://localhost:5175/"
      const match = msg.match(/Local:\s+(https?:\/\/[^\s]+)/i);
      if (match && !resolved) {
        viteUrl = match[1].replace(/\/$/, "");
        resolved = true;
        resolve();
      }
    });

    viteProcess.stderr?.on("data", (data) => {
      console.error(`[Vite] ${data.toString().trim()}`);
    });

    viteProcess.on("error", (err) => {
      if (!resolved) {
        resolved = true;
        reject(err);
      }
    });

    viteProcess.on("exit", (code) => {
      if (!resolved) {
        resolved = true;
        reject(new Error(`Vite exited with code ${code}`));
      }
    });

    // Fallback: если не спарсили URL за 10 секунд, пробуем localhost:5175
    setTimeout(() => {
      if (!resolved) {
        viteUrl = "http://localhost:5175";
        resolved = true;
        resolve();
      }
    }, 10000);
  });
}

async function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const isDev = !app.isPackaged;

  if (isDev) {
    try {
      await startViteDevServer();
      console.log(`[Electron] Loading Vite dev server at ${viteUrl}`);
      await mainWindow.loadURL(viteUrl);
    } catch (err) {
      console.error("[Electron] Failed to start Vite, loading dist:", err.message);
      await mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
    }
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  startApiServer();
  await createWindow();
});

app.on("window-all-closed", () => {
  if (viteProcess) viteProcess.kill();
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

app.on("before-quit", () => {
  if (viteProcess) viteProcess.kill();
});
