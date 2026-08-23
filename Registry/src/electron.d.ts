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

export interface ElectronAPI {
  platform: string;
  isElectron: boolean;
}

// ===== Registry API (Этап 3.3) =====
// Данные регистратуры через IPC к центральному API (PostgreSQL + Prisma).
// Формат ответов совпадает с src/db.ts (snake_case, ID — строки UUID).

export interface RegistryPatient {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  date_of_birth: string;
  department?: string;
}

export interface RegistryAppointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  studies: string[];
  department?: string;
  created_at: string;
  patient?: RegistryPatient;
}

export interface RegistryDoctor {
  id: string;
  name: string;
  max_patients_per_day: number;
  work_days: string;
}

export interface RegistryAPI {
  getAppointmentsByMonth: (
    month: number,
    year: number
  ) => Promise<RegistryAppointment[]>;
  getAppointmentsByDate: (
    date: string
  ) => Promise<RegistryAppointment[]>;
  createAppointment: (
    patientData: Omit<RegistryPatient, "id">,
    appointmentDate: string,
    studies: string[]
  ) => Promise<RegistryAppointment>;
  updateAppointment: (
    id: string,
    studies: string[],
    patientData?: Partial<Omit<RegistryPatient, "id" | "department">>
  ) => Promise<RegistryAppointment | null>;
  deleteAppointment: (id: string) => Promise<boolean>;
  getDoctors: () => Promise<RegistryDoctor[]>;
  createDoctor: (
    name: string,
    maxPatientsPerDay: number,
    workDays: number[]
  ) => Promise<RegistryDoctor>;
  updateDoctor: (
    id: string,
    name: string,
    maxPatientsPerDay: number,
    workDays: number[]
  ) => Promise<RegistryDoctor | null>;
  deleteDoctor: (id: string) => Promise<boolean>;
  // Конфигурация центрального сервера (Этап: настройки Registry)
  getServerConfig: () => Promise<{
    centralApiUrl: string;
    connected: boolean;
  }>;
  saveServerConfig: (url: string) => Promise<{
    success: boolean;
    message: string;
    connected: boolean;
  }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    updateAPI?: UpdateAPI;
    registryAPI?: RegistryAPI;
  }
}