import { contextBridge, ipcRenderer } from "electron";

// ========== UPDATE API ==========

export interface UpdateServer {
  name: string;
  ip: string;
}

export interface UpdateAPI {
  check: () => Promise<void>;
  download: () => Promise<void>;
  install: () => Promise<void>;
  getServers: () => Promise<UpdateServer[]>;
  saveServers: (servers: UpdateServer[]) => Promise<{ success: boolean; message?: string }>;
  getActiveServer: () => Promise<string>;
  setActiveServer: (ip: string) => Promise<{ success: boolean; message?: string }>;
  onUpdateAvailable: (handler: (info: { version: string }) => void) => () => void;
  onUpdateNotAvailable: (handler: (info: { version: string }) => void) => () => void;
  onDownloadProgress: (handler: (progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => void) => () => void;
  onUpdateDownloaded: (handler: (info: { version: string }) => void) => () => void;
  onUpdateError: (handler: (error: { message: string }) => void) => () => void;
}

const updateAPI: UpdateAPI = {
  check: () => ipcRenderer.invoke("update:check"),
  download: () => ipcRenderer.invoke("update:download"),
  install: () => ipcRenderer.invoke("update:install"),
  getServers: () => ipcRenderer.invoke("update:getServers"),
  saveServers: (servers) => ipcRenderer.invoke("update:saveServers", servers),
  getActiveServer: () => ipcRenderer.invoke("update:getActiveServer"),
  setActiveServer: (ip) => ipcRenderer.invoke("update:setActiveServer", ip),
  onUpdateAvailable: (handler) => {
    const listener = (_event: unknown, info: { version: string }) => handler(info);
    ipcRenderer.on("update:available", listener);
    return () => ipcRenderer.removeListener("update:available", listener);
  },
  onUpdateNotAvailable: (handler) => {
    const listener = (_event: unknown, info: { version: string }) => handler(info);
    ipcRenderer.on("update:not-available", listener);
    return () => ipcRenderer.removeListener("update:not-available", listener);
  },
  onDownloadProgress: (handler) => {
    const listener = (_event: unknown, progress: { percent: number; bytesPerSecond: number; transferred: number; total: number }) => handler(progress);
    ipcRenderer.on("update:download-progress", listener);
    return () => ipcRenderer.removeListener("update:download-progress", listener);
  },
  onUpdateDownloaded: (handler) => {
    const listener = (_event: unknown, info: { version: string }) => handler(info);
    ipcRenderer.on("update:downloaded", listener);
    return () => ipcRenderer.removeListener("update:downloaded", listener);
  },
  onUpdateError: (handler) => {
    const listener = (_event: unknown, error: { message: string }) => handler(error);
    ipcRenderer.on("update:error", listener);
    return () => ipcRenderer.removeListener("update:error", listener);
  },
};

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object.
contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  isElectron: true,
});

contextBridge.exposeInMainWorld("updateAPI", updateAPI);