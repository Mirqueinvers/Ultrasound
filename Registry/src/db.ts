/**
 * Слой доступа к данным Registry.
 *
 * Этап 3.2 плана перехода на PostgreSQL: локальная БД sql.js (registry.db)
 * заменена вызовами к центральному API-серверу (Server/).
 *
 * Все функции асинхронные. Формат данных сохранён как в старом Registry
 * (snake_case) — его отдаёт центральный API. ID теперь — строки (UUID).
 *
 * Авторизация: при initDb() выполняется вход сервисной учёткой регистратуры.
 * Учётные данные задаются переменными окружения:
 *   CENTRAL_API_URL   — адрес центрального API (по умолчанию http://localhost:4000/api);
 *   REGISTRY_USERNAME — логин (по умолчанию registry);
 *   REGISTRY_PASSWORD — пароль (по умолчанию registry123).
 * Если аккаунт ещё не создан (БД сервера стартовала пустой), при первом
 * старте он регистрируется автоматически.
 *
 * Данные старых registry.db НЕ переносятся — регистратура стартует с пустой базы.
 */

import * as api from "./services/apiClient";
import type {
  AppointmentDto,
  DoctorDto,
  UpdateAppointmentInput,
} from "./services/apiClient";

// ===== Конфигурация сервисной учётки регистратуры =====

const CENTRAL_API_URL =
  process.env.CENTRAL_API_URL || "http://localhost:4000/api";
const REGISTRY_USERNAME = process.env.REGISTRY_USERNAME || "registry";
const REGISTRY_PASSWORD = process.env.REGISTRY_PASSWORD || "registry123";

// ===== Типы (формат сохранён как в старом Registry) =====

export interface Doctor {
  id: string;
  name: string;
  max_patients_per_day: number;
  work_days: string;
}

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
  department?: string;
  created_at: string;
  patient?: Patient;
}

// ===== Маппинг DTO apiClient -> формат Registry =====

function mapAppointmentDto(a: AppointmentDto): Appointment {
  return {
    id: a.id,
    patient_id: a.patientId,
    appointment_date: a.appointmentDate,
    studies: a.studies,
    department: a.department,
    created_at: a.createdAt,
    patient: a.patient
      ? {
          id: a.patient.id,
          last_name: a.patient.lastName,
          first_name: a.patient.firstName,
          middle_name: a.patient.middleName,
          date_of_birth: a.patient.dateOfBirth,
        }
      : undefined,
  };
}

function mapDoctorDto(d: DoctorDto): Doctor {
  return {
    id: d.id,
    name: d.name,
    max_patients_per_day: d.maxPatientsPerDay,
    work_days: JSON.stringify(d.workDays),
  };
}

// ===== Инициализация: адрес сервера + авторизация =====

/** Нормализация введённого пользователем адреса сервера.
 *  Принимает: "10.201.50.187", "10.201.50.187:4000", "http://...:4000/api".
 *  Возвращает полный URL вида "http://<host>:4000/api" или "" при пустом вводе.
 */
export function normalizeServerUrl(input: string): string {
  let s = input.trim();
  if (!s) return "";
  s = s.replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(s)) s = `http://${s}`;

  // Если после протокола указан только host без порта — подставляем 4000.
  const match = s.match(/^(https?:\/\/)([^/]+)(\/.*)?$/i);
  if (match) {
    const host = match[2];
    const rest = match[3] || "";
    if (!/:\d+$/.test(host)) {
      s = `${match[1]}${host}:4000${rest}`;
    }
  }

  if (!/\/api$/i.test(s)) s = `${s}/api`;
  return s;
}

async function doLogin(
  url: string
): Promise<{ ok: boolean; message?: string }> {
  api.setApiUrl(url);
  api.setToken(null);
  try {
    const result = await api.login(REGISTRY_USERNAME, REGISTRY_PASSWORD);
    api.setToken(result.token);
    return { ok: true };
  } catch (err) {
    console.warn(
      `doLogin: вход "${REGISTRY_USERNAME}" на ${url} не удался, пробуем создать учётную запись`,
      err
    );
    try {
      await api.register({
        username: REGISTRY_USERNAME,
        password: REGISTRY_PASSWORD,
        name: "Регистратура",
      });
      const result = await api.login(REGISTRY_USERNAME, REGISTRY_PASSWORD);
      api.setToken(result.token);
      return { ok: true, message: `Учётная запись "${REGISTRY_USERNAME}" создана` };
    } catch (err2) {
      const detail = err2 instanceof Error ? err2.message : String(err2);
      return {
        ok: false,
        message: `Не удалось авторизоваться на ${url}. Проверьте адрес сервера и учётные данные. ${detail}`,
      };
    }
  }
}

export async function initDb(serverUrl?: string): Promise<void> {
  const url =
    serverUrl && serverUrl.trim() !== "" ? normalizeServerUrl(serverUrl) : CENTRAL_API_URL;
  const result = await doLogin(url);
  if (!result.ok) {
    console.error(`initDb: ${result.message}`);
  } else if (result.message) {
    console.log(`initDb: ${result.message}`);
  }
}

/** Сменить адрес центрального сервера и переподключиться (вызывается из настроек). */
export async function reconnect(
  serverUrl: string
): Promise<{ ok: boolean; message?: string }> {
  const url = normalizeServerUrl(serverUrl);
  return doLogin(url);
}

/** Проверка связи с сервером через GET /health. */
export async function checkServerConnection(url: string): Promise<boolean> {
  try {
    api.setApiUrl(normalizeServerUrl(url));
    await api.fetchHealth();
    return true;
  } catch {
    return false;
  }
}

// ===== Записи (Appointments) =====

export async function getAppointmentsByMonth(
  month: number,
  year: number
): Promise<Appointment[]> {
  const items = await api.fetchAppointmentsByMonth(month, year);
  return items.map(mapAppointmentDto);
}

export async function getAppointmentsByDate(
  date: string
): Promise<Appointment[]> {
  const items = await api.fetchAppointmentsByDate(date);
  return items.map(mapAppointmentDto);
}

export async function createAppointment(
  patientData: Omit<Patient, "id">,
  appointmentDate: string,
  studies: string[]
): Promise<Appointment> {
  const created = await api.createAppointment({
    lastName: patientData.last_name,
    firstName: patientData.first_name,
    middleName: patientData.middle_name || "",
    dateOfBirth: patientData.date_of_birth,
    studies,
    appointmentDate,
    department: patientData.department || "",
  });
  return mapAppointmentDto(created);
}

export async function updateAppointment(
  id: string,
  studies: string[],
  patientData?: {
    last_name?: string;
    first_name?: string;
    middle_name?: string;
    date_of_birth?: string;
  }
): Promise<Appointment | null> {
  const input: UpdateAppointmentInput = { studies };
  if (patientData) {
    if (patientData.last_name !== undefined) input.lastName = patientData.last_name;
    if (patientData.first_name !== undefined) input.firstName = patientData.first_name;
    if (patientData.middle_name !== undefined) input.middleName = patientData.middle_name;
    if (patientData.date_of_birth !== undefined) input.dateOfBirth = patientData.date_of_birth;
  }

  const updated = await api.updateAppointment(id, input);
  return updated ? mapAppointmentDto(updated) : null;
}

export async function deleteAppointment(id: string): Promise<boolean> {
  const result = await api.deleteAppointment(id);
  return Boolean(result?.success);
}

// ===== Врачи (Doctors) =====

export async function getDoctors(): Promise<Doctor[]> {
  const doctors = await api.fetchDoctors();
  return doctors.map(mapDoctorDto);
}

export async function createDoctor(
  name: string,
  maxPatientsPerDay: number,
  workDays: number[]
): Promise<Doctor> {
  const doctor = await api.createDoctor({
    name,
    maxPatientsPerDay,
    workDays,
  });
  return mapDoctorDto(doctor);
}

export async function updateDoctor(
  id: string,
  name: string,
  maxPatientsPerDay: number,
  workDays: number[]
): Promise<Doctor | null> {
  const doctor = await api.updateDoctor(id, {
    name,
    maxPatientsPerDay,
    workDays,
  });
  return doctor ? mapDoctorDto(doctor) : null;
}

export async function deleteDoctor(id: string): Promise<boolean> {
  const result = await api.deleteDoctor(id);
  return Boolean(result?.success);
}
