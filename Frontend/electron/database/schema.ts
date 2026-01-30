// Frontend/electron/database/schema.ts
export const CREATE_USERS_TABLE = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    organization TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
  )
`;


export const CREATE_PATIENTS_TABLE = `
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    last_name TEXT NOT NULL,
    first_name TEXT NOT NULL,
    middle_name TEXT,
    date_of_birth TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`;


export const CREATE_RESEARCHES_TABLE = `
  CREATE TABLE IF NOT EXISTS researches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    research_date TEXT NOT NULL,
    payment_type TEXT NOT NULL CHECK(payment_type IN ('oms', 'paid')),
    organization TEXT,
    doctor_name TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  )
`;


export const CREATE_RESEARCH_STUDIES_TABLE = `
  CREATE TABLE IF NOT EXISTS research_studies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    research_id INTEGER NOT NULL,
    study_type TEXT NOT NULL,
    study_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (research_id) REFERENCES researches(id) ON DELETE CASCADE
  )
`;


export const CREATE_PATIENTS_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_patients_full_name 
  ON patients(last_name, first_name, middle_name);
  
  CREATE INDEX IF NOT EXISTS idx_patients_dob 
  ON patients(date_of_birth);
`;


export const CREATE_RESEARCHES_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_researches_patient_id 
  ON researches(patient_id);
  
  CREATE INDEX IF NOT EXISTS idx_researches_date 
  ON researches(research_date);
  
  CREATE INDEX IF NOT EXISTS idx_research_studies_research_id 
  ON research_studies(research_id);
  
  CREATE INDEX IF NOT EXISTS idx_research_studies_type 
  ON research_studies(study_type);
`;


export interface User {
  id: number;
  username: string;
  password: string;
  name: string;
  organization?: string;
  created_at: string;
  last_login?: string;
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
  organization?: string;
  doctor_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  study_types?: string[];
}


export interface ResearchStudy {
  id: number;
  research_id: number;
  study_type: string;
  study_data: string; // JSON string
  created_at: string;
}


export const CREATE_USERNAME_INDEX = `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_username ON users(username)
`;
