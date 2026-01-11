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
  studies?: ResearchStudy[];
}

export interface ResearchStudy {
  id: number;
  research_id: number;
  study_type: string;
  study_data: any;
  created_at: string;
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
  getById: (id: number) => Promise<Research | null>;
  getByPatientId: (patientId: number, limit?: number, offset?: number) => Promise<Research[]>;
  getAll: (limit?: number, offset?: number) => Promise<Research[]>;
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
  search: (query: string, limit?: number) => Promise<Research[]>;
}

declare global {
  interface Window {
    patientAPI: PatientAPI;
    researchAPI: ResearchAPI;
    authAPI: any;
    windowAPI: any;
  }
}

export {};
