// c:/Projects/Ultrasound/Frontend/src/types/interface/patient.ts

export interface Patient {
  id: string;
  last_name: string;
  first_name: string;
  middle_name?: string;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

export interface Research {
  id: string;
  patient_id: string;
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

export interface PatientCardProps {
  patient: Patient;
  researches: Research[];
  isExpanded: boolean;
  onToggle: () => void;
  onOpenProtocol: (researchId: string) => void;
  formatPatientName: (p: Patient) => string;
  formatDateRu: (value: string) => string;
}
