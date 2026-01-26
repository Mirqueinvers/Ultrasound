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

export interface PatientAPI {
  getById: (id: number) => Promise<any>;
  findOrCreate: (patientData: {
    lastName: string;
    firstName: string;
    middleName: string | null;
    dateOfBirth: string;
  }) => Promise<any>;
}

export interface ResearchAPI {
  getById: (id: number) => Promise<any>;
  create: (researchData: {
    patientId: number;
    researchDate: string;
    paymentType: "oms" | "paid";
    organization?: string | null;
    doctorName?: string;
    notes?: string;
  }) => Promise<any>;
  addStudy: (studyData: {
    researchId: number;
    studyType: string;
    studyData: object;
  }) => Promise<any>;
}

declare global {
  interface Window {
    authAPI: AuthAPI;
    windowAPI: WindowAPI;
    patientAPI: PatientAPI;
    researchAPI: ResearchAPI;
  }
}

export {};
