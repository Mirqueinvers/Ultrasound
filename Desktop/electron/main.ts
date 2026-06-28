// // ultrasound/frontend/electron/main.ts
import { app, BrowserWindow } from "electron";
import path from "path";
import { setupAuthHandlers } from "./ipc-handlers";
import { setupProtocolHandlers } from "./ipc/protocolHandlers";
import { setupMobileHostHandlers } from "./ipc/mobileHostHandlers";
import { setupMedisonHandlers } from "./ipc/medisonIpc";
import { DatabaseManager } from "./database/database";
import { getMobileHostService } from "./mobile-host";

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  const dbManager = DatabaseManager.getInstance();
  const appRootPath = path.join(__dirname, "..", "..");

  const iconPath = path.join(appRootPath, "build", "us-icon.png");
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
  setupMobileHostHandlers();
  setupMedisonHandlers((payload) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("medison:xmlFound", payload);
    }
  });
  getMobileHostService().setRendererWindow(mainWindow);

  if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL(`http://localhost:${process.env.VITE_PORT ?? "5174"}`);
  } else {
    mainWindow.loadFile(path.join(appRootPath, "dist", "index.html"));
  }

  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });

mainWindow.on("closed", () => {
    getMobileHostService().setRendererWindow(null);
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    await getMobileHostService().start();
  } catch (error) {
    console.error("Failed to start mobile host service:", error);
  }

  createWindow();
});

app.on("before-quit", () => {
  getMobileHostService().setRendererWindow(null);
  getMobileHostService().stop();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

