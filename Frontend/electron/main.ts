// // ultrasound/frontend/electron/main.ts
import { app, BrowserWindow } from "electron";
import path from "path";
import { setupAuthHandlers } from "./ipc-handlers";
import { setupProtocolHandlers } from "./ipc/protocolHandlers";
import { DatabaseManager } from "./database/database";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const dbManager = DatabaseManager.getInstance();

  const iconPath = path.join(__dirname, "..", "build", "us-icon.png");
  console.log("ICON PATH:", iconPath);

  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    frame: false,
    titleBarStyle: "hidden",
    autoHideMenuBar: true,
    backgroundColor: "#f8fafc",
    show: false,
    icon: iconPath,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  setupAuthHandlers(mainWindow);
  setupProtocolHandlers(dbManager.protocol);

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
