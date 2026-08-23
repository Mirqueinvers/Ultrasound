// Типы ответов центрального API-сервера (Server/).
// Все id — строка (UUID), поля — snake_case (как отдаёт сервер).
// Репозитории better-sqlite3 (id: number) НЕ трогаем — их перевод на эти типы
// происходит на этапе 2.2 при переписи IPC-обработчиков.

// ===== Пользователи =====
export interface ApiUser {
  id: string;
  username: string;
  name: string;
  organization: string | null;
  created_at: string;
  last_login: string | null;
}

// ===== Пациенты =====
export interface ApiPatient {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  date_of_birth: string;
  created_at: string;
  updated_at: string;
}

// ===== Исследования =====
export interface ApiResearchStudy {
  id: string;
  research_id: string;
  study_type: string;
  study_data: unknown;
  created_at: string;
}

export interface ApiResearchPatientRef {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  date_of_birth: string;
}

export interface ApiResearch {
  id: string;
  patient_id: string;
  research_date: string;
  payment_type: "oms" | "paid";
  organization: string | null;
  doctor_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  studies?: ApiResearchStudy[];
  patient?: ApiResearchPatientRef;
}

// ===== Журнал =====
export interface ApiJournalResearch {
  id: string;
  patient_id: string;
  research_date: string;
  payment_type: "oms" | "paid";
  doctor_name: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  study_types: string[];
}

export interface ApiJournalEntry {
  patient: ApiPatient;
  researches: ApiJournalResearch[];
}

// ===== Протокол =====
export interface ApiSavedProtocol {
  researchId: string;
  studies: Record<string, unknown>;
  printOverrides: Record<string, string>;
}

// ===== Маппинги Medison =====
export interface ApiMedisonMapping {
  id: string;
  user_id: string;
  measurement_id: string;
  target_study_type: string;
  target_field: string;
  transform: string;
  is_enabled: number;
  created_at: string;
  updated_at: string;
}

// ===== Записи регистратуры (Appointments) =====
export interface ApiAppointmentPatient {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  date_of_birth: string;
}

export interface ApiAppointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  studies: string[];
  department: string;
  created_at: string;
  patient?: ApiAppointmentPatient;
}

// ===== Врачи регистратуры (Doctors) =====
export interface ApiDoctor {
  id: string;
  name: string;
  max_patients_per_day: number;
  work_days: string; // JSON-строка массива [1..7]
}

// ===== Статистика =====
export interface ApiStatisticsData {
  totalPatients: number;
  totalResearches: number;
  totalStudies: number;
  researchesInPeriod: number;
  patientsInPeriod: number;
  studiesInPeriod: number;
  paymentStats: { oms: number; paid: number };
  studiesByType: Record<string, number>;
  monthlyResearches: { month: string; count: number }[];
  recentActivity: { date: string; patientName: string; studyType: string }[];
  doctorsStats: { doctorName: string; patientCount: number; researchCount: number }[];
  paidStudiesDetail: { studyType: string; count: number }[];
}

// ===== Типовые обёртки ответов =====
export interface ApiSuccessResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface ApiLoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: ApiUser;
}