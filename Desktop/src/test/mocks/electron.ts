// src/test/mocks/electron.ts
// Моки всех window.*API на основе типов из electron/contracts.ts.
// Тесты не должны обращаться к реальному IPC/БД/сети — только эти моки.
import { vi, type Mock } from "vitest";
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
  SavedProtocol,
  PatientSearchAPI,
  DatabaseAPI,
  DefaultsAPI,
  RegistryAPI,
  NetworkAPI,
  UpdateAPI,
  ServerConfigAPI,
  AuthUser,
  Patient,
  Research,
} from "../../../electron/contracts";

// ========== Типовые данные ==========

export const makeAuthUser = (overrides: Partial<AuthUser> = {}): AuthUser => ({
  id: "1",
  username: "doctor@example.com",
  name: "Иванов Иван Иванович",
  organization: "ГБУЗ №1",
  ...overrides,
});

export const makePatient = (overrides: Partial<Patient> = {}): Patient => ({
  id: "1",
  last_name: "Иванов",
  first_name: "Иван",
  middle_name: "Иванович",
  date_of_birth: "1980-01-15",
  created_at: "2026-01-01 10:00:00",
  updated_at: "2026-01-01 10:00:00",
  ...overrides,
});

export const makeResearch = (overrides: Partial<Research> = {}): Research => ({
  id: "1",
  patient_id: "1",
  research_date: "2026-01-15",
  payment_type: "oms",
  organization: "ГБУЗ №1",
  doctor_name: "Иванов Иван Иванович",
  notes: "",
  created_at: "2026-01-15 09:00:00",
  updated_at: "2026-01-15 09:00:00",
  ...overrides,
});

// ========== API-моки ==========

type Mocked<T> = { [K in keyof T]: Mock };

const mobileStatus = {
  running: false,
  port: null,
  sessionId: null,
  draftActive: false,
  activeStudyLabel: "",
  organization: null,
  pairingCode: null,
  startedAt: null,
  clients: 0,
  addresses: [] as string[],
  httpUrl: null,
  wsUrl: null,
};

const statsData = {
  totalPatients: 0,
  totalResearches: 0,
  totalStudies: 0,
  researchesInPeriod: 0,
  patientsInPeriod: 0,
  studiesInPeriod: 0,
  paymentStats: { oms: 0, paid: 0 },
  studiesByType: {},
  monthlyResearches: [],
  recentActivity: [],
  doctorsStats: [],
  paidStudiesDetail: [],
};

export const windowMocks = {
  authAPI: {
    register: vi.fn(async () => ({ success: true, message: "Регистрация успешна", userId: "1" })),
    login: vi.fn(async () => ({ success: true, message: "Вход выполнен", user: makeAuthUser() })),
    getUser: vi.fn(async () => makeAuthUser()),
    updateUser: vi.fn(async () => ({ success: true, message: "Профиль обновлён" })),
    changePassword: vi.fn(async () => ({ success: true, message: "Пароль изменён" })),
  } satisfies Mocked<AuthAPI>,
  patientAPI: {
    findOrCreate: vi.fn(async () => ({ success: true, message: "Пациент создан", patient: makePatient() })),
    search: vi.fn(async () => [makePatient()]),
    getAll: vi.fn(async () => [makePatient()]),
    getById: vi.fn(async () => makePatient()),
    update: vi.fn(async () => ({ success: true, message: "Пациент обновлён" })),
    delete: vi.fn(async () => ({ success: true, message: "Пациент удалён" })),
  } satisfies Mocked<PatientAPI>,
  researchAPI: {
    create: vi.fn(async () => ({ success: true, message: "Исследование создано", researchId: "1" })),
    addStudy: vi.fn(async () => ({ success: true, message: "Исследование добавлено", studyId: "1" })),
    getById: vi.fn(async () => makeResearch()),
    getByPatientId: vi.fn(async () => [makeResearch()]),
    getAll: vi.fn(async () => [makeResearch()]),
    update: vi.fn(async () => ({ success: true, message: "Исследование обновлено" })),
    delete: vi.fn(async () => ({ success: true, message: "Исследование удалено" })),
    search: vi.fn(async () => [makeResearch()]),
  } satisfies Mocked<ResearchAPI>,
  journalAPI: {
    getByDate: vi.fn(async () => []),
    getByPeriod: vi.fn(async () => []),
    getDoctorNames: vi.fn(async () => ["Иванов Иван Иванович"]),
  } satisfies Mocked<JournalAPI>,
  windowAPI: {
    focus: vi.fn(),
    minimize: vi.fn(),
    maximize: vi.fn(),
    close: vi.fn(),
  } satisfies Mocked<WindowAPI>,
  mobileHostAPI: {
    getStatus: vi.fn(async () => ({ ...mobileStatus })),
    start: vi.fn(async () => ({ ...mobileStatus, running: true, port: 8765, sessionId: "s1" })),
    stop: vi.fn(async () => ({ ...mobileStatus })),
    restart: vi.fn(async () => ({ ...mobileStatus, running: true, port: 8765, sessionId: "s1" })),
    setProfile: vi.fn(async () => ({ ...mobileStatus })),
    publishSync: vi.fn(async () => ({ ...mobileStatus })),
    onSyncMessage: vi.fn(() => () => {}),
  } satisfies Mocked<MobileHostAPI>,
  medisonAPI: {
    startWatching: vi.fn(async () => ({ success: true })),
    stopWatching: vi.fn(async () => ({ success: true })),
    scanAndRead: vi.fn(async () => ({ success: true, content: "", filePath: "", filename: "" })),
    onXmlFound: vi.fn(() => () => {}),
  } satisfies Mocked<MedisonAPI>,
  importMappingAPI: {
    getMappings: vi.fn(async () => ({ success: true, mappings: [] })),
    upsertMapping: vi.fn(async () => ({ success: true, id: "1" })),
    deleteMapping: vi.fn(async () => ({ success: true })),
    resetDefaultMappings: vi.fn(async () => ({ success: true })),
  } satisfies Mocked<ImportMappingAPI>,
  protocolAPI: {
    getPrinters: vi.fn(async () => ({ success: true, printers: [] })),
    getByResearchId: vi.fn<() => Promise<SavedProtocol | null>>(async () => null),
    printHtml: vi.fn(async () => ({ success: true })),
    savePrintOverrides: vi.fn(async () => ({ success: true, message: "Сохранено" })),
  } satisfies Mocked<ProtocolAPI>,
  fileAPI: {
    saveHtml: vi.fn(async () => ({ success: true, canceled: false, filePath: "C:\\protocol.html" })),
  } satisfies Mocked<FileAPI>,
  patientSearchAPI: {
    search: vi.fn(async () => []),
  } satisfies Mocked<PatientSearchAPI>,
  databaseAPI: {
    getStatistics: vi.fn(async () => ({ success: true, data: statsData })),
  } satisfies Mocked<DatabaseAPI>,
  defaultsAPI: {
    load: vi.fn(async () => ({ success: true, data: {} })),
    save: vi.fn(async () => ({ success: true })),
    reset: vi.fn(async () => ({ success: true })),
  } satisfies Mocked<DefaultsAPI>,
  registryAPI: {
    getAddresses: vi.fn(async () => []),
    saveAddresses: vi.fn(async () => ({ success: true })),
    getCachedAppointments: vi.fn(async () => []),
    saveCachedAppointments: vi.fn(async () => ({ success: true })),
  } satisfies Mocked<RegistryAPI>,
  networkAPI: {
    sendExport: vi.fn(async () => ({ success: true, imported: 1, skipped: 0 })),
  } satisfies Mocked<NetworkAPI>,
  serverConfigAPI: {
    getConfig: vi.fn(async () => ({ serverUrl: "", configured: false })),
    saveConfig: vi.fn(async () => ({ success: true })),
  } satisfies Mocked<ServerConfigAPI>,
  updateAPI: {
    check: vi.fn(async () => {}),
    download: vi.fn(async () => {}),
    install: vi.fn(async () => {}),
    getServers: vi.fn(async () => []),
    saveServers: vi.fn(async () => ({ success: true })),
    getActiveServer: vi.fn(async () => "localhost"),
    setActiveServer: vi.fn(async () => ({ success: true })),
    onUpdateAvailable: vi.fn(() => () => {}),
    onUpdateNotAvailable: vi.fn(() => () => {}),
    onDownloadProgress: vi.fn(() => () => {}),
    onUpdateDownloaded: vi.fn(() => () => {}),
    onUpdateError: vi.fn(() => () => {}),
  } satisfies Mocked<UpdateAPI>,
};

// ========== Установка и сброс ==========

export function installWindowMocks(): void {
  for (const [key, value] of Object.entries(windowMocks)) {
    vi.stubGlobal(key, value);
  }
}

export function resetWindowMocks(): void {
  for (const api of Object.values(windowMocks)) {
    for (const fn of Object.values(api)) {
      fn.mockClear();
    }
  }
  vi.unstubAllGlobals();
}