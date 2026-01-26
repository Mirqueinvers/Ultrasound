// ultrasound/frontend/electron/preload.ts
import { contextBridge, ipcRenderer } from "electron";

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
    user?: any;
  }>;
  getUser: (userId: number) => Promise<any>;
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

// ========== DOMAIN TYPES ==========

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
  organization?: string | null;  // <-- добавили
  doctor_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}


export interface ResearchStudy {
  id: number;
  research_id: number;
  study_type: string;
  study_data: any;
  created_at: string;
}

export interface JournalEntry {
  patient: Patient;
  researches: Research[];
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
  search: (query: string, limit?: number) => Promise<any>;
  getAll: (limit?: number, offset?: number) => Promise<any>;
  getById: (id: number) => Promise<any>;
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
}

export interface ResearchAPI {
  create: (data: {
    patientId: number;
    researchDate: string;
    paymentType: "oms" | "paid";
    organization?: string | null;  // <-- добавили
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
  getById: (id: number) => Promise<any>;
  getByPatientId: (
    patientId: number,
    limit?: number,
    offset?: number,
  ) => Promise<any>;
  getAll: (limit?: number, offset?: number) => Promise<any>;
  update: (data: {
    id: number;
    researchDate?: string;
    paymentType?: "oms" | "paid";
    organization?: string | null;  // <-- и здесь, если нужно редактирование
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
  search: (query: string, limit?: number) => Promise<any>;
}


export interface JournalAPI {
  getByDate: (date: string) => Promise<JournalEntry[]>;
}

export interface WindowAPI {
  focus: () => void;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

// ========== PROTOCOL API ==========

export interface SavedProtocol {
  researchId: number;
  studies: { [studyType: string]: any };
}

export interface ProtocolAPI {
  getByResearchId: (id: number) => Promise<SavedProtocol | null>;
}

// ========== PATIENT SEARCH API (для SearchSection) ==========

export interface PatientSearchEntry {
  patient: Patient;
  researches: (Research & { study_types?: string[] })[];
}

export interface PatientSearchAPI {
  search: (query: string) => Promise<PatientSearchEntry[]>;
}

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
};

const windowAPI: WindowAPI = {
  focus: () => ipcRenderer.send("window:focus"),
  minimize: () => ipcRenderer.send("window:minimize"),
  maximize: () => ipcRenderer.send("window:maximize"),
  close: () => ipcRenderer.send("window:close"),
};

const protocolAPI: ProtocolAPI = {
  getByResearchId: (id) => ipcRenderer.invoke("protocol:getByResearchId", id),
};

// ========== Реализация patientSearchAPI ==========

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

    const byPatient = new Map<number, PatientSearchEntry>();

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
        study_types: (r.studies || []).map((s: any) => s.study_type),
      });
    }

    return Array.from(byPatient.values());
  },
};

// ========== Экспорт в window ==========

contextBridge.exposeInMainWorld("authAPI", authAPI);
contextBridge.exposeInMainWorld("patientAPI", patientAPI);
contextBridge.exposeInMainWorld("researchAPI", researchAPI);
contextBridge.exposeInMainWorld("journalAPI", journalAPI);
contextBridge.exposeInMainWorld("windowAPI", windowAPI);
contextBridge.exposeInMainWorld("protocolAPI", protocolAPI);
contextBridge.exposeInMainWorld("patientSearchAPI", patientSearchAPI);

declare global {
  interface Window {
    authAPI: AuthAPI;
    patientAPI: PatientAPI;
    researchAPI: ResearchAPI;
    journalAPI: JournalAPI;
    windowAPI: WindowAPI;
    protocolAPI: ProtocolAPI;
    patientSearchAPI: PatientSearchAPI;
  }
}
