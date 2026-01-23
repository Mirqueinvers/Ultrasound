// src/types/interface/patient.ts

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
  doctor_name?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  study_types?: string[];
}

export interface JournalEntry {
  patient: Patient;
  researches: Research[];
}
