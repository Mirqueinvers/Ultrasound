// src/types/window.d.ts
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

export interface WindowAPI {
  focus: () => void;
}

// Добавьте эти интерфейсы:
export interface PatientAPI {
  getById: (id: number) => Promise<any>;
  findOrCreate: (patientData: {
    // Уточните типы по данным из useSaveResearch.ts (строка 83)
    name?: string;
    birthDate?: string;
    // добавьте другие поля
  }) => Promise<any>;
}

export interface ResearchAPI {
  getById: (id: number) => Promise<any>;
  create: (researchData: any) => Promise<any>;
  addStudy: (studyData: {
    researchId: number;
    // уточните поля по строке 122
  }) => Promise<any>;
}

declare global {
  interface Window {
    authAPI: AuthAPI;
    windowAPI: WindowAPI;
    patientAPI: PatientAPI;   // Добавьте
    researchAPI: ResearchAPI; // Добавьте
  }
}

export {};
