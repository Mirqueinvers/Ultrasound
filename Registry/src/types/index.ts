export interface Patient {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  date_of_birth: string;
  department?: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  studies: string[];
  created_at: string;
  patient?: Patient;
}

export interface Doctor {
  id: string;
  name: string;
  maxPatientsPerDay: number;
  workDays: number[]; // 1=Пн ... 7=Вс
}

export interface PatientFormData {
  lastName: string;
  firstName: string;
  middleName: string;
  dateOfBirth: string;
  studies: string[];
  doctorId?: string;
}

export interface DoctorFormData {
  name: string;
  maxPatientsPerDay: number;
  workDays: number[];
}