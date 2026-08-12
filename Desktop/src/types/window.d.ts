export interface AuthUser {
  id: number;
  username: string;
  name: string;
  organization?: string | null;
}

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

export interface WindowAPI {
  focus: () => void;
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

export interface MobileHostAPI {
  getStatus: () => Promise<MobileHostStatus>;
  start: () => Promise<MobileHostStatus>;
  stop: () => Promise<MobileHostStatus>;
  restart: () => Promise<MobileHostStatus>;
  setProfile: (profile: { organization?: string | null }) => Promise<MobileHostStatus>;
  publishSync: (message: unknown) => Promise<MobileHostStatus>;
  onSyncMessage: (handler: (message: unknown) => void) => () => void;
}

import type { Patient, Research } from "./electron";

export interface PatientAPI {
  getById: (id: number) => Promise<Patient | undefined>;
  findOrCreate: (patientData: {
    lastName: string;
    firstName: string;
    middleName: string | null;
    dateOfBirth: string;
  }) => Promise<{
    success: boolean;
    message: string;
    patient?: Patient;
  }>;
}

export interface ResearchAPI {
  getById: (id: number) => Promise<Research | null>;
  create: (researchData: {
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
  addStudy: (studyData: {
    researchId: number;
    studyType: string;
    studyData: object;
  }) => Promise<{
    success: boolean;
    message: string;
    studyId?: number;
  }>;
}

export interface DatabaseAPI {
  getStatistics: (startDate?: string, endDate?: string) => Promise<{
    success: boolean;
    data?: unknown;
    message?: string;
  }>;
}

declare global {
  interface Window {
    authAPI: AuthAPI;
    windowAPI: WindowAPI;
    mobileHostAPI: MobileHostAPI;
    patientAPI: PatientAPI;
    researchAPI: ResearchAPI;
    databaseAPI: DatabaseAPI;
  }
}

export {};
