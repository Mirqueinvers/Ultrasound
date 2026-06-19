export interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string;
  date_of_birth: string;
  department?: string;
}

export interface Appointment {
  id: number;
  patient_id: number;
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

export interface AppointmentApiResponse {
  id: number;
  patient_id: number;
  appointment_date: string;
  studies: string[];
  department?: string;
  created_at: string;
  patient?: {
    id: number;
    last_name: string;
    first_name: string;
    middle_name: string;
    date_of_birth: string;
  };
}