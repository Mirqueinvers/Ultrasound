import { contextBridge, ipcRenderer } from 'electron';

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
  payment_type: 'oms' | 'paid';
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
    paymentType: 'oms' | 'paid';
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
  getByPatientId: (patientId: number, limit?: number, offset?: number) => Promise<any>;
  getAll: (limit?: number, offset?: number) => Promise<any>;
  update: (data: {
    id: number;
    researchDate?: string;
    paymentType?: 'oms' | 'paid';
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
}

const authAPI: AuthAPI = {
  register: (data) => ipcRenderer.invoke('auth:register', data),
  login: (data) => ipcRenderer.invoke('auth:login', data),
  getUser: (userId) => ipcRenderer.invoke('auth:getUser', userId),
  updateUser: (data) => ipcRenderer.invoke('auth:updateUser', data),
  changePassword: (data) => ipcRenderer.invoke('auth:changePassword', data),
};

const patientAPI: PatientAPI = {
  findOrCreate: (data) => ipcRenderer.invoke('patient:findOrCreate', data),
  search: (query, limit) => ipcRenderer.invoke('patient:search', query, limit),
  getAll: (limit, offset) => ipcRenderer.invoke('patient:getAll', limit, offset),
  getById: (id) => ipcRenderer.invoke('patient:getById', id),
  update: (data) => ipcRenderer.invoke('patient:update', data),
};

const researchAPI: ResearchAPI = {
  create: (data) => ipcRenderer.invoke('research:create', data),
  addStudy: (data) => ipcRenderer.invoke('research:addStudy', data),
  getById: (id) => ipcRenderer.invoke('research:getById', id),
  getByPatientId: (patientId, limit, offset) =>
    ipcRenderer.invoke('research:getByPatientId', patientId, limit, offset),
  getAll: (limit, offset) => ipcRenderer.invoke('research:getAll', limit, offset),
  update: (data) => ipcRenderer.invoke('research:update', data),
  delete: (id) => ipcRenderer.invoke('research:delete', id),
  search: (query, limit) => ipcRenderer.invoke('research:search', query, limit),
};

const journalAPI: JournalAPI = {
  getByDate: (date) => ipcRenderer.invoke('journal:getByDate', date),
};

const windowAPI: WindowAPI = {
  focus: () => ipcRenderer.send('window:focus'),
};

contextBridge.exposeInMainWorld('authAPI', authAPI);
contextBridge.exposeInMainWorld('patientAPI', patientAPI);
contextBridge.exposeInMainWorld('researchAPI', researchAPI);
contextBridge.exposeInMainWorld('journalAPI', journalAPI);
contextBridge.exposeInMainWorld('windowAPI', windowAPI);
