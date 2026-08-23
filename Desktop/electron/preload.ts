// // ultrasound/frontend/electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";

// Все IPC-контракты (интерфейсы API и доменные типы) — в ./contracts.
// Этот файл содержит только реализации и реэкспорт типов наружу,
// чтобы существующие импорты из "../../electron/preload" продолжали работать.
import type {
  AuthAPI,
  PatientAPI,
  ResearchAPI,
  JournalAPI,
  WindowAPI,
  MobileHostAPI,
  MedisonAPI,
  ImportMappingAPI,
  ProtocolAPI,
  FileAPI,
  PatientSearchAPI,
  DatabaseAPI,
  DefaultsAPI,
  RegistryAPI,
  NetworkAPI,
  UpdateAPI,
  ConnectionAPI,
  ServerConfigAPI,
  ConnectionStatus,
  Research,
  PatientSearchEntry,
} from "./contracts";

export type * from "./contracts";

// ========== Реализации API ==========

const authAPI: AuthAPI = {
  register: (data) => ipcRenderer.invoke("auth:register", data),
  login: (data) => ipcRenderer.invoke("auth:login", data),
  getUser: (userId) => ipcRenderer.invoke("auth:getUser", userId),
  updateUser: (data) => ipcRenderer.invoke("auth:updateUser", data),
  changePassword: (data) => ipcRenderer.invoke("auth:changePassword", data),
};

const patientAPI: PatientAPI = {
  findOrCreate: (data) => ipcRenderer.invoke("patient:findOrCreate", data),
  search: (query, limit) => ipcRenderer.invoke("patient:search", query, limit),
  getAll: (limit, offset) => ipcRenderer.invoke("patient:getAll", limit, offset),
  getById: (id) => ipcRenderer.invoke("patient:getById", id),
  update: (data) => ipcRenderer.invoke("patient:update", data),
  delete: (id) => ipcRenderer.invoke("patient:delete", id), // ← ДОБАВИЛИ
};

const researchAPI: ResearchAPI = {
  create: (data) => ipcRenderer.invoke("research:create", data),
  addStudy: (data) => ipcRenderer.invoke("research:addStudy", data),
  getById: (id) => ipcRenderer.invoke("research:getById", id),
  getByPatientId: (patientId, limit, offset) =>
    ipcRenderer.invoke("research:getByPatientId", patientId, limit, offset),
  getAll: (limit, offset) => ipcRenderer.invoke("research:getAll", limit, offset),
  update: (data) => ipcRenderer.invoke("research:update", data),
  delete: (id) => ipcRenderer.invoke("research:delete", id),
  search: (query, limit) => ipcRenderer.invoke("research:search", query, limit),
};

const journalAPI: JournalAPI = {
  getByDate: (date) => ipcRenderer.invoke("journal:getByDate", date),
  getByPeriod: (startDate, endDate) =>
    ipcRenderer.invoke("journal:getByPeriod", startDate, endDate),
  getDoctorNames: () => ipcRenderer.invoke("journal:getDoctorNames"),
};

const windowAPI: WindowAPI = {
  focus: () => ipcRenderer.send("window:focus"),
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
};

const mobileHostAPI: MobileHostAPI = {
  getStatus: () => ipcRenderer.invoke("mobile-host:getStatus"),
  start: () => ipcRenderer.invoke("mobile-host:start"),
  stop: () => ipcRenderer.invoke("mobile-host:stop"),
  restart: () => ipcRenderer.invoke("mobile-host:restart"),
  setProfile: (profile) => ipcRenderer.invoke("mobile-host:setProfile", profile),
  publishSync: (message) => ipcRenderer.invoke("mobile-host:publishSync", message),
  onSyncMessage: (handler) => {
    const listener = (_event: unknown, message: unknown) => {
      handler(message);
    };

    ipcRenderer.on("mobile-host:sync-message", listener);

    return () => {
      ipcRenderer.removeListener("mobile-host:sync-message", listener);
    };
  },
};

const protocolAPI: ProtocolAPI = {
  getPrinters: () => ipcRenderer.invoke("protocol:getPrinters"),
  getByResearchId: (id) => ipcRenderer.invoke("protocol:getByResearchId", id),
  printHtml: (data) => ipcRenderer.invoke("protocol:printHtml", data),
  savePrintOverrides: (data) => ipcRenderer.invoke("protocol:savePrintOverrides", data),
};

const fileAPI: FileAPI = {
  saveHtml: (data) => ipcRenderer.invoke("file:saveHtml", data),
};

const patientSearchAPI: PatientSearchAPI = {
  async search(query: string) {
    const researches = (await ipcRenderer.invoke(
      "research:search",
      query,
      100,
    )) as Array<
      Research & {
        last_name: string;
        first_name: string;
        middle_name: string | null;
        date_of_birth: string;
        studies?: { study_type: string }[];
      }
    >;

    const byPatient = new Map<string, PatientSearchEntry>();

    for (const r of researches) {
      if (!byPatient.has(r.patient_id)) {
        byPatient.set(r.patient_id, {
          patient: {
            id: r.patient_id,
            last_name: r.last_name,
            first_name: r.first_name,
            middle_name: r.middle_name ?? undefined,
            date_of_birth: r.date_of_birth,
            created_at: r.created_at,
            updated_at: r.updated_at,
          },
          researches: [],
        });
      }

      const entry = byPatient.get(r.patient_id)!;

      entry.researches.push({
        id: r.id,
        patient_id: r.patient_id,
        research_date: r.research_date,
        payment_type: r.payment_type,
        doctor_name: r.doctor_name,
        notes: r.notes,
        created_at: r.created_at,
        updated_at: r.updated_at,
        study_types: (r.studies || []).map((s: { study_type: string }) => s.study_type),
      });
    }

    return Array.from(byPatient.values());
  },
};

const medisonAPI: MedisonAPI = {
  startWatching: () => ipcRenderer.invoke("medison:startWatching"),
  stopWatching: () => ipcRenderer.invoke("medison:stopWatching"),
  scanAndRead: () => ipcRenderer.invoke("medison:scanAndRead"),
  onXmlFound: (handler) => {
    const listener = (_event: unknown, data: { filePath: string; filename: string; content: string }) => {
      handler(data);
    };
    ipcRenderer.on("medison:xmlFound", listener);
    return () => {
      ipcRenderer.removeListener("medison:xmlFound", listener);
    };
  },
};

const importMappingAPI: ImportMappingAPI = {
  getMappings: (userId) => ipcRenderer.invoke("medison-mapping:getAll", userId),
  upsertMapping: (data) => ipcRenderer.invoke("medison-mapping:upsert", data),
  deleteMapping: (id) => ipcRenderer.invoke("medison-mapping:delete", id),
  resetDefaultMappings: (userId) => ipcRenderer.invoke("medison-mapping:resetDefaults", userId),
};

const databaseAPI: DatabaseAPI = {
  getStatistics: (startDate?: string, endDate?: string, doctorName?: string) => 
    ipcRenderer.invoke("database:getStatistics", startDate, endDate, doctorName),
};

const defaultsAPI: DefaultsAPI = {
  load: () => ipcRenderer.invoke("defaults:load"),
  save: (updates) => ipcRenderer.invoke("defaults:save", updates),
  reset: () => ipcRenderer.invoke("defaults:reset"),
};

const registryAPI: RegistryAPI = {
  getAddresses: () => ipcRenderer.invoke("registry:getAddresses"),
  saveAddresses: (addresses) => ipcRenderer.invoke("registry:saveAddresses", addresses),
  getCachedAppointments: () => ipcRenderer.invoke("registry:getCachedAppointments"),
  saveCachedAppointments: (appointments) =>
    ipcRenderer.invoke("registry:saveCachedAppointments", appointments),
};

const connectionAPI: ConnectionAPI = {
  getStatus: () => ipcRenderer.invoke("connection:getStatus"),
  getOfflineCacheSummary: () => ipcRenderer.invoke("offlineCache:getSummary"),
  onStatusChange: (handler) => {
    const listener = (_event: unknown, status: ConnectionStatus) => {
      handler(status);
    };
    ipcRenderer.on("connection:status-changed", listener);
    return () => {
      ipcRenderer.removeListener("connection:status-changed", listener);
    };
  },
};

const serverConfigAPI: ServerConfigAPI = {
  getConfig: () => ipcRenderer.invoke("server:getConfig"),
  saveConfig: (config) => ipcRenderer.invoke("server:saveConfig", config),
};

const networkAPI: NetworkAPI = {
  sendExport: (data) => ipcRenderer.invoke("network:sendExport", data),
};

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

// ========== Экспорт в window ==========

contextBridge.exposeInMainWorld("authAPI", authAPI);
contextBridge.exposeInMainWorld("patientAPI", patientAPI);
contextBridge.exposeInMainWorld("researchAPI", researchAPI);
contextBridge.exposeInMainWorld("journalAPI", journalAPI);
contextBridge.exposeInMainWorld("windowAPI", windowAPI);
contextBridge.exposeInMainWorld("mobileHostAPI", mobileHostAPI);
contextBridge.exposeInMainWorld("protocolAPI", protocolAPI);
contextBridge.exposeInMainWorld("fileAPI", fileAPI);
contextBridge.exposeInMainWorld("patientSearchAPI", patientSearchAPI);
contextBridge.exposeInMainWorld("medisonAPI", medisonAPI);
contextBridge.exposeInMainWorld("importMappingAPI", importMappingAPI);
contextBridge.exposeInMainWorld("databaseAPI", databaseAPI);
contextBridge.exposeInMainWorld("defaultsAPI", defaultsAPI);
contextBridge.exposeInMainWorld("registryAPI", registryAPI);
contextBridge.exposeInMainWorld("serverConfigAPI", serverConfigAPI);
contextBridge.exposeInMainWorld("networkAPI", networkAPI);
contextBridge.exposeInMainWorld("connectionAPI", connectionAPI);
contextBridge.exposeInMainWorld("updateAPI", updateAPI);
