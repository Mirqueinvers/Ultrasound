const { app, BrowserWindow } = require("electron");
const path = require("path");
const { spawn } = require("child_process");
const http = require("http");

let mainWindow;
let viteProcess;

async function startApiServer() {
  // Запускаем API-сервер в том же процессе
  try {
    const { startApiServer: runApi } = require("./dist-api/api");
    await runApi();
    console.log("[API] Server started on port 3456");
  } catch (err) {
    console.error("[API] Failed to start:", err.message);
  }
}

function waitForVite(url, retries = 30) {
  return new Promise((resolve, reject) => {
    const attempt = () => {
      http
        .get(url, (res) => {
          if (res.statusCode === 200) {
            resolve();
          } else if (retries > 0) {
            setTimeout(() => {
              retries--;
              attempt();
            }, 500);
          } else {
            reject(new Error("Vite dev server did not start in time"));
          }
        })
        .on("error", () => {
          if (retries > 0) {
            setTimeout(() => {
              retries--;
              attempt();
            }, 500);
          } else {
            reject(new Error("Vite dev server did not start in time"));
          }
        });
    };
    attempt();
  });
}

function startViteDevServer() {
  return new Promise((resolve, reject) => {
    viteProcess = spawn(
      path.join(__dirname, "node_modules", ".bin", "vite.cmd"),
      [],
      {
        cwd: __dirname,
        stdio: "pipe",
        shell: true,
      }
    );

    viteProcess.stdout?.on("data", (data) => {
      console.log(`[Vite] ${data.toString().trim()}`);
    });

    viteProcess.stderr?.on("data", (data) => {
      console.error(`[Vite] ${data.toString().trim()}`);
    });

    viteProcess.on("error", reject);

    waitForVite("http://localhost:5173")
      .then(resolve)
      .catch(reject);
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

  const isDev = process.env.NODE_ENV === "development" || !app.isPackaged;

  if (isDev) {
    try {
      await startViteDevServer();
    } catch (err) {
      console.error("Failed to start Vite dev server:", err.message);
      mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
      return;
    }
    mainWindow.loadURL("http://localhost:5173");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, "dist", "index.html"));
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
