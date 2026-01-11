"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CREATE_USERNAME_INDEX = exports.CREATE_RESEARCHES_INDEXES = exports.CREATE_PATIENTS_INDEXES = exports.CREATE_RESEARCH_STUDIES_TABLE = exports.CREATE_RESEARCHES_TABLE = exports.CREATE_PATIENTS_TABLE = exports.CREATE_USERS_TABLE = void 0;
exports.CREATE_USERS_TABLE = `
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
exports.CREATE_PATIENTS_TABLE = `
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
exports.CREATE_RESEARCHES_TABLE = `
  CREATE TABLE IF NOT EXISTS researches (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id INTEGER NOT NULL,
    research_date TEXT NOT NULL,
    payment_type TEXT NOT NULL CHECK(payment_type IN ('oms', 'paid')),
    doctor_name TEXT,
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
  )
`;
exports.CREATE_RESEARCH_STUDIES_TABLE = `
  CREATE TABLE IF NOT EXISTS research_studies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    research_id INTEGER NOT NULL,
    study_type TEXT NOT NULL,
    study_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (research_id) REFERENCES researches(id) ON DELETE CASCADE
  )
`;
exports.CREATE_PATIENTS_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_patients_full_name 
  ON patients(last_name, first_name, middle_name);
  
  CREATE INDEX IF NOT EXISTS idx_patients_dob 
  ON patients(date_of_birth);
`;
exports.CREATE_RESEARCHES_INDEXES = `
  CREATE INDEX IF NOT EXISTS idx_researches_patient_id 
  ON researches(patient_id);
  
  CREATE INDEX IF NOT EXISTS idx_researches_date 
  ON researches(research_date);
  
  CREATE INDEX IF NOT EXISTS idx_research_studies_research_id 
  ON research_studies(research_id);
  
  CREATE INDEX IF NOT EXISTS idx_research_studies_type 
  ON research_studies(study_type);
`;
exports.CREATE_USERNAME_INDEX = `
  CREATE UNIQUE INDEX IF NOT EXISTS idx_username ON users(username)
`;
