import { autoUpdater } from "electron-updater";
import { BrowserWindow } from "electron";

let mainWindow: BrowserWindow | null = null;

export function setAutoUpdaterWindow(win: BrowserWindow | null) {
  mainWindow = win;
}

export function initAutoUpdater() {
  autoUpdater.autoDownload = false;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("checking-for-update", () => {
    console.log("[AutoUpdater] Checking for update...");
  });

  autoUpdater.on("update-available", (info) => {
    console.log("[AutoUpdater] Update available:", info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update:available", {
        version: info.version,
      });
    }
  });

  autoUpdater.on("update-not-available", (info) => {
    console.log("[AutoUpdater] Update not available");
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update:not-available", {
        version: info.version,
      });
    }
  });

  autoUpdater.on("download-progress", (progress) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update:download-progress", {
        percent: progress.percent,
        bytesPerSecond: progress.bytesPerSecond,
        transferred: progress.transferred,
        total: progress.total,
      });
    }
  });

  autoUpdater.on("update-downloaded", (info) => {
    console.log("[AutoUpdater] Update downloaded:", info.version);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update:downloaded", {
        version: info.version,
      });
    }
  });

  autoUpdater.on("error", (error) => {
    console.error("[AutoUpdater] Error:", error.message);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update:error", {
        message: error.message,
      });
    }
  });
}

export function checkForUpdates() {
  autoUpdater.checkForUpdates().catch((err) => {
    console.error("[AutoUpdater] Check error:", err);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update:error", {
        message: err.message,
      });
    }
  });
}

export function downloadUpdate() {
  autoUpdater.downloadUpdate().catch((err) => {
    console.error("[AutoUpdater] Download error:", err);
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update:error", {
        message: err.message,
      });
    }
  });
}

export function quitAndInstall() {
  autoUpdater.quitAndInstall();
}