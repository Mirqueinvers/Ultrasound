import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { promises as fs } from "node:fs";
import { startApiServer } from "../src/api";
import { initDb } from "../src/db";
import { registerRegistryIpc } from "./registryIpc";
import {
  setAutoUpdaterWindow,
  initAutoUpdater,
  checkForUpdates,
  downloadUpdate,
  quitAndInstall,
  setUpdateServer,
} from "./autoUpdater";

let mainWindow: BrowserWindow | null = null;

const isDev = !app.isPackaged;

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

  setAutoUpdaterWindow(mainWindow);

  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    await mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    await mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

app.whenReady().then(async () => {
  // Этап 3.3: вход сервисной учёткой регистратуры в центральный API
  // и регистрация IPC-моста (window.registryAPI) до создания окна.
  await initDb();
  registerRegistryIpc();

  await startApiServer();
  await createWindow();

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

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});