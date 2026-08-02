// // ultrasound/frontend/electron/main.ts
import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { promises as fs } from "node:fs";
import { setupAuthHandlers } from "./ipc-handlers";
import { setupProtocolHandlers } from "./ipc/protocolHandlers";
import { setupMobileHostHandlers } from "./ipc/mobileHostHandlers";
import { setupMedisonHandlers } from "./ipc/medisonIpc";
import { setupMedisonMappingHandlers } from "./ipc/medisonMappingIpc";
import { DatabaseManager } from "./database/database";
import { getMobileHostService } from "./mobile-host";
import {
  setAutoUpdaterWindow,
  initAutoUpdater,
  checkForUpdates,
  downloadUpdate,
  quitAndInstall,
  setUpdateServer,
} from "./autoUpdater";

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

  setAutoUpdaterWindow(mainWindow);

  setupAuthHandlers(mainWindow);
  setupProtocolHandlers(dbManager.protocol);
  setupMobileHostHandlers();
  setupMedisonHandlers((payload) => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("medison:xmlFound", payload);
    }
  });
  setupMedisonMappingHandlers();
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

  // ==================== UPDATE SERVERS HANDLERS ====================

  const updateServersFilePath = path.join(
    app.getPath("userData"),
    "update-servers.json"
  );

  // Нормализация списка серверов: поддерживает и старый формат (массив строк/объектов),
  // и новый формат { servers: [...], activeIp: "..." }
  function normalizeServers(parsed: unknown): { name: string; ip: string }[] {
    const rawList: unknown[] = Array.isArray(parsed)
      ? (parsed as unknown[])
      : parsed &&
        typeof parsed === "object" &&
        Array.isArray((parsed as { servers?: unknown }).servers)
        ? ((parsed as { servers: unknown[] }).servers)
        : [];
    return rawList.map((entry: unknown) => {
      if (typeof entry === "string") {
        return { name: entry, ip: entry };
      }
      if (
        entry &&
        typeof entry === "object" &&
        typeof (entry as { ip?: unknown }).ip === "string"
      ) {
        const item = entry as { name?: unknown; ip: string };
        return {
          name:
            typeof item.name === "string" && item.name.trim() !== ""
              ? item.name
              : item.ip,
          ip: item.ip,
        };
      }
      return null;
    }).filter((entry: { name: string; ip: string } | null) => entry !== null);
  }

  ipcMain.handle("update:getServers", async () => {
    try {
      const data = await fs.readFile(updateServersFilePath, "utf8");
      return normalizeServers(JSON.parse(data));
    } catch {
      return [];
    }
  });

  ipcMain.handle(
    "update:saveServers",
    async (_, servers: { name: string; ip: string }[]) => {
      try {
        const existing = await fs.readFile(updateServersFilePath, "utf8").then(
          (d) => JSON.parse(d) as { servers?: unknown; activeIp?: string },
          () => ({}) as { servers?: unknown; activeIp?: string }
        );
        const merged = {
          servers,
          activeIp:
            typeof existing.activeIp === "string" ? existing.activeIp : "",
        };
        await fs.writeFile(
          updateServersFilePath,
          JSON.stringify(merged, null, 2),
          "utf8"
        );
        return { success: true };
      } catch (error) {
        console.error("Update servers save error:", error);
        return { success: false, message: "Не удалось сохранить серверы обновлений" };
      }
    }
  );

  ipcMain.handle("update:getActiveServer", async () => {
    try {
      const data = await fs.readFile(updateServersFilePath, "utf8");
      const parsed = JSON.parse(data);
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof (parsed as { activeIp?: unknown }).activeIp === "string"
      ) {
        return (parsed as { activeIp: string }).activeIp;
      }
      return "";
    } catch {
      return "";
    }
  });

  ipcMain.handle(
    "update:setActiveServer",
    async (_, ip: string) => {
      try {
        const existing = await fs.readFile(updateServersFilePath, "utf8").then(
          (d) => JSON.parse(d) as { servers?: unknown; activeIp?: string },
          () => ({}) as { servers?: unknown; activeIp?: string }
        );
        const merged = {
          servers: normalizeServers(existing.servers),
          activeIp: ip,
        };
        await fs.writeFile(
          updateServersFilePath,
          JSON.stringify(merged, null, 2),
          "utf8"
        );
        return { success: true };
      } catch (error) {
        console.error("Update active server save error:", error);
        return { success: false, message: "Не удалось сохранить активный сервер" };
      }
    }
  );

  // ==================== UPDATE IPC HANDLERS ====================

  ipcMain.handle("update:check", async () => {
    try {
      const data = await fs.readFile(updateServersFilePath, "utf8");
      const parsed = JSON.parse(data);
      if (
        parsed &&
        typeof parsed === "object" &&
        typeof (parsed as { activeIp?: unknown }).activeIp === "string" &&
        (parsed as { activeIp: string }).activeIp.trim() !== ""
      ) {
        setUpdateServer((parsed as { activeIp: string }).activeIp.trim());
      }
    } catch {
      // Нет сохранённого сервера — используем дефолтный из конфига
    }
    checkForUpdates();
  });

  ipcMain.handle("update:download", () => {
    downloadUpdate();
  });

  ipcMain.handle("update:install", () => {
    quitAndInstall();
  });

  // Init auto-updater
  initAutoUpdater();
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

