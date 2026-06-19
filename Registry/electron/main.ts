import { app, BrowserWindow } from "electron";
import path from "path";
import { spawn, ChildProcess } from "child_process";
import { startApiServer } from "../src/api";

let mainWindow: BrowserWindow | null = null;
let viteProcess: ChildProcess | null = null;

const isDev = !app.isPackaged;

function startViteDevServer(): Promise<string> {
  return new Promise((resolve, reject) => {
    const viteCmd = path.join(__dirname, "..", "node_modules", ".bin", "vite.cmd");
    viteProcess = spawn(viteCmd, ["--port", "5173"], {
      cwd: path.join(__dirname, ".."),
      stdio: "pipe",
      shell: true,
    });

    let resolved = false;

    viteProcess.stdout?.on("data", (data: Buffer) => {
      const msg = data.toString();
      console.log(`[Vite] ${msg.trim()}`);
      const match = msg.match(/Local:\s+(https?:\/\/[^\s]+)/i);
      if (match && !resolved) {
        const url = match[1].replace(/\/$/, "");
        resolved = true;
        resolve(url);
      }
    });

    viteProcess.stderr?.on("data", (data: Buffer) => {
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

    // Fallback
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve("http://localhost:5173");
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
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isDev) {
    try {
      const viteUrl = await startViteDevServer();
      console.log(`[Electron] Loading Vite dev server at ${viteUrl}`);
      await mainWindow.loadURL(viteUrl);
    } catch (err) {
      console.error("[Electron] Failed to start Vite, loading dist:", err);
      await mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
    }
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  await startApiServer();
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