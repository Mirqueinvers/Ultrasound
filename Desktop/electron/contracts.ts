// Единый источник IPC-контрактов для Desktop.
// Все интерфейсы API и доменные типы живут только здесь.
// preload.ts, src/types/global.d.ts и сервисы импортируют из этого файла.

// ========== ДОМЕННЫЕ ТИПЫ ==========

export interface AuthUser {
  id: number;
  username: string;
  name: string;
  organization?: string | null;
}

export interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  middle_name?: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

export interface Research {
  id: number;
  patient_id: number;
  research_date: string;
  payment_type: "oms" | "paid";
  organization?: string | null;
  doctor_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ResearchStudy {
  id: number;
  research_id: number;
  study_type: string;
  study_data: unknown;
  created_at: string;
}

export interface JournalEntry {
  patient: Patient;
  researches: Research[];
}

export interface SavedProtocol {
  researchId: number;
  studies: { [studyType: string]: unknown };
  printOverrides: Record<string, string>;
}

export interface PrinterInfo {
  name: string;
  isDefault: boolean;
  status?: number;
  options?: Record<string, unknown>;
}

export interface MobileHostStatus {
  running: boolean;
  port: number | null;
  sessionId: string | null;
  draftActive: boolean;
  activeStudyLabel: string;
  organization: string | null;
  pairingCode: string | null;
  startedAt: string | null;
  clients: number;
  addresses: string[];
  httpUrl: string | null;
  wsUrl: string | null;
}

export interface MedisonMappingRow {
  id: number;
  user_id: number;
  measurement_id: string;
  target_study_type: string;
  target_field: string;
  transform: string;
  is_enabled: number;
  created_at: string;
  updated_at: string;
}

export interface RegistryAddress {
  name: string;
  ip: string;
}

export interface CachedRegistryAppointment {
  sourceIp: string;
  sourceName: string;
  appointment: {
    id: number;
    patient_id: number;
    appointment_date: string;
    studies: string[];
    department?: string;
    created_at: string;
    patient?: {
      id: number;
      last_name: string;
      first_name: string;
      middle_name: string;
      date_of_birth: string;
    };
  };
  cachedAt: string;
}

export interface PatientSearchEntry {
  patient: Patient;
  researches: (Research & { study_types?: string[] })[];
}

export interface UpdateServer {
  name: string;
  ip: string;
}

// ========== AUTH API ==========

export interface AuthAPI {
  register: (data: {
    username: string;
    password: string;
    name: string;
    organization?: string;
  }) => Promise<{
    success: boolean;
    message: string;
    userId?: number;
  }>;
  login: (data: {
    username: string;
    password: string;
  }) => Promise<{
    success: boolean;
    message: string;
    user?: AuthUser | null;
  }>;
  getUser: (userId: number) => Promise<AuthUser | null>;
  updateUser: (data: {
    id: number;
    name: string;
    username: string;
    organization?: string;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
  changePassword: (data: {
    userId: number;
    currentPassword: string;
    newPassword: string;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
}

// ========== PATIENT / RESEARCH / JOURNAL API ==========

export interface PatientAPI {
  findOrCreate: (data: {
    lastName: string;
    firstName: string;
    middleName: string | null;
    dateOfBirth: string;
  }) => Promise<{
    success: boolean;
    message: string;
    patient?: Patient;
  }>;
  search: (query: string, limit?: number) => Promise<Patient[]>;
  getAll: (limit?: number, offset?: number) => Promise<Patient[]>;
  getById: (id: number) => Promise<Patient | undefined>;
  update: (data: {
    id: number;
    lastName: string;
    firstName: string;
    middleName: string | null;
    dateOfBirth: string;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
  delete: (id: number) => Promise<{
    success: boolean;
    message: string;
  }>;
}

export interface ResearchAPI {
  create: (data: {
    patientId: number;
    researchDate: string;
    paymentType: "oms" | "paid";
    organization?: string | null;
    doctorName?: string;
    notes?: string;
  }) => Promise<{
    success: boolean;
    message: string;
    researchId?: number;
  }>;
  addStudy: (data: {
    researchId: number;
    studyType: string;
    studyData: object;
  }) => Promise<{
    success: boolean;
    message: string;
    studyId?: number;
  }>;
  getById: (id: number) => Promise<Research | null>;
  getByPatientId: (
    patientId: number,
    limit?: number,
    offset?: number,
  ) => Promise<Research[]>;
  getAll: (limit?: number, offset?: number) => Promise<Research[]>;
  update: (data: {
    id: number;
    researchDate?: string;
    paymentType?: "oms" | "paid";
    organization?: string | null;
    doctorName?: string;
    notes?: string;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
  delete: (id: number) => Promise<{
    success: boolean;
    message: string;
  }>;
  search: (query: string, limit?: number) => Promise<Research[]>;
}

export interface JournalAPI {
  getByDate: (date: string) => Promise<JournalEntry[]>;
  getByPeriod: (startDate: string, endDate: string) => Promise<JournalEntry[]>;
  getDoctorNames: () => Promise<string[]>;
}

export interface WindowAPI {
  focus: () => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

// ========== MOBILE HOST API ==========

export interface MobileHostAPI {
  getStatus: () => Promise<MobileHostStatus>;
  start: () => Promise<MobileHostStatus>;
  stop: () => Promise<MobileHostStatus>;
  restart: () => Promise<MobileHostStatus>;
  setProfile: (profile: { organization?: string | null }) => Promise<MobileHostStatus>;
  publishSync: (message: unknown) => Promise<MobileHostStatus>;
  onSyncMessage: (handler: (message: unknown) => void) => () => void;
}

// ========== MEDISON API ==========

export interface MedisonAPI {
  startWatching: () => Promise<{ success: boolean }>;
  stopWatching: () => Promise<{ success: boolean }>;
  scanAndRead: () => Promise<{ success: boolean; content?: string; filePath?: string; filename?: string; message?: string }>;
  onXmlFound: (handler: (data: { filePath: string; filename: string; content: string }) => void) => () => void;
}

export interface ImportMappingAPI {
  getMappings: (userId: number) => Promise<{ success: boolean; mappings?: MedisonMappingRow[]; message?: string }>;
  upsertMapping: (data: {
    userId: number;
    measurementId: string;
    targetStudyType: string;
    targetField: string;
    transform: string;
    isEnabled: boolean;
  }) => Promise<{ success: boolean; id?: number; message?: string }>;
  deleteMapping: (id: number) => Promise<{ success: boolean; message?: string }>;
  resetDefaultMappings: (userId: number) => Promise<{ success: boolean; message?: string }>;
}

// ========== PROTOCOL API ==========

export interface ProtocolAPI {
  getPrinters: () => Promise<{
    success: boolean;
    printers: PrinterInfo[];
    message?: string;
  }>;
  getByResearchId: (id: number) => Promise<SavedProtocol | null>;
  printHtml: (data: {
    content: string;
    title?: string;
    printerName?: string;
  }) => Promise<{
    success: boolean;
    message?: string;
  }>;
  savePrintOverrides: (data: {
    researchId: number;
    overrides: Record<string, string>;
  }) => Promise<{
    success: boolean;
    message: string;
  }>;
}

export interface FileAPI {
  saveHtml: (data: {
    content: string;
    defaultPath?: string;
  }) => Promise<{
    success: boolean;
    canceled?: boolean;
    filePath?: string;
    message?: string;
  }>;
}

export interface DefaultsAPI {
  load: () => Promise<{ success: boolean; data?: Record<string, unknown>; message?: string }>;
  save: (updates: Record<string, unknown>) => Promise<{ success: boolean; message?: string }>;
  reset: () => Promise<{ success: boolean; message?: string }>;
}

// ========== REGISTRY API ==========

export interface RegistryAPI {
  getAddresses: () => Promise<RegistryAddress[]>;
  saveAddresses: (addresses: RegistryAddress[]) => Promise<{ success: boolean; message?: string }>;
  getCachedAppointments: () => Promise<CachedRegistryAppointment[]>;
  saveCachedAppointments: (appointments: CachedRegistryAppointment[]) => Promise<{ success: boolean; message?: string }>;
}

export interface NetworkAPI {
  sendExport: (data: {
    targetIp: string;
    html: string;
    fileName?: string;
  }) => Promise<{
    success: boolean;
    imported?: number;
    skipped?: number;
    message?: string;
  }>;
}

// ========== PATIENT SEARCH API (для SearchSection) ==========

export interface PatientSearchAPI {
  search: (query: string) => Promise<PatientSearchEntry[]>;
}

// ========== DATABASE API ==========

export interface DatabaseAPI {
  getStatistics: (startDate?: string, endDate?: string, doctorName?: string) => Promise<{
    success: boolean;
    message?: string;
    data?: {
      totalPatients: number;
      totalResearches: number;
      totalStudies: number;
      researchesInPeriod: number;
      patientsInPeriod: number;
      studiesInPeriod: number;
      paymentStats: {
        oms: number;
        paid: number;
      };
      studiesByType: { [key: string]: number };
      monthlyResearches: { month: string; count: number }[];
      recentActivity: {
        date: string;
        patientName: string;
        studyType: string;
      }[];
      doctorsStats: {
        doctorName: string;
        patientCount: number;
        researchCount: number;
      }[];
      paidStudiesDetail: {
        studyType: string;
        count: number;
      }[];
    };
  }>;
}

// ========== UPDATE API ==========

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