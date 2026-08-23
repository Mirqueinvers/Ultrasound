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

// ========== REGISTRY API ==========
// Этап 3.3: данные регистратуры (записи, врачи) — через IPC к центральному API.
// Типы контракта — в src/electron.d.ts (RegistryAPI).

const registryAPI = {
  getAppointmentsByMonth: (month: number, year: number) =>
    ipcRenderer.invoke("registry:getAppointmentsByMonth", month, year),
  getAppointmentsByDate: (date: string) =>
    ipcRenderer.invoke("registry:getAppointmentsByDate", date),
  createAppointment: (
    patientData: unknown,
    appointmentDate: string,
    studies: string[]
  ) =>
    ipcRenderer.invoke(
      "registry:createAppointment",
      patientData,
      appointmentDate,
      studies
    ),
  updateAppointment: (id: string, studies: string[], patientData?: unknown) =>
    ipcRenderer.invoke("registry:updateAppointment", id, studies, patientData),
  deleteAppointment: (id: string) =>
    ipcRenderer.invoke("registry:deleteAppointment", id),
  getDoctors: () => ipcRenderer.invoke("registry:getDoctors"),
  createDoctor: (name: string, maxPatientsPerDay: number, workDays: number[]) =>
    ipcRenderer.invoke("registry:createDoctor", name, maxPatientsPerDay, workDays),
  updateDoctor: (
    id: string,
    name: string,
    maxPatientsPerDay: number,
    workDays: number[]
  ) =>
    ipcRenderer.invoke(
      "registry:updateDoctor",
      id,
      name,
      maxPatientsPerDay,
      workDays
    ),
  deleteDoctor: (id: string) =>
    ipcRenderer.invoke("registry:deleteDoctor", id),
  // Конфигурация центрального сервера (Этап: настройки Registry)
  getServerConfig: () => ipcRenderer.invoke("registry:getServerConfig"),
  saveServerConfig: (url: string) =>
    ipcRenderer.invoke("registry:saveServerConfig", url),
};

contextBridge.exposeInMainWorld("registryAPI", registryAPI);