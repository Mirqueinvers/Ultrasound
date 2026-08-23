/**
 * API-клиент для центрального сервера (PostgreSQL + Prisma).
 *
 * Этап 3.1 плана перехода на PostgreSQL.
 *
 * Назначение: заменить локальную БД Registry (sql.js) вызовами к центральному
 * API-серверу. Все данные (пациенты, записи, врачи) теперь хранятся на сервере
 * в единой базе. Собственный HTTP-сервер Registry удалён на этапе 3.4.
 *
 * Контракт:
 *  - Базовый URL задаётся через setApiUrl() (по умолчанию — http://localhost:4000/api).
 *    Renderer при старте вызывает setApiUrl(config.apiUrl) (значение VITE_API_URL);
 *    серверная часть (db.ts) — свой адрес из переменных окружения.
 *  - Запросы отправляются в camelCase (как текущий UI);
 *  - Ответы приходят от сервера в snake_case (маппинг Prisma @@map),
 *    клиент нормализует их в DTO для UI;
 *  - ID записей — строки (UUID), а не числа.
 *  - Авторизация: JWT-токен передаётся в заголовке `Authorization: Bearer <token>`.
 *    Токен получается через login()/register() и хранится в памяти модуля
 *    (setToken()). Персистентность токена — ответственность вызывающего кода.
 *
 * ВАЖНО: модуль не зависит от `import.meta.env` / config.ts, чтобы его можно
 * было использовать и в main-процессе (это делает src/db.ts).
 */

// ===== Состояние клиента =====

const DEFAULT_API_URL = "http://localhost:4000/api";

let apiBase = DEFAULT_API_URL;
let token: string | null = null;

export function setApiUrl(url: string): void {
  apiBase = (url || DEFAULT_API_URL).replace(/\/+$/, "");
}

export function getApiUrl(): string {
  return apiBase;
}

export function setToken(value: string | null): void {
  token = value;
}

export function getToken(): string | null {
  return token;
}

export function clearToken(): void {
  token = null;
}

// ===== Сырые ответы центрального API =====

interface ApiPatient {
  id: string;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  date_of_birth: string;
}

interface ApiAppointment {
  id: string;
  patient_id: string;
  appointment_date: string;
  studies: string[] | string | Record<string, unknown> | null;
  department: string | null;
  created_at: string;
  patient?: ApiPatient | null;
}

interface ApiDoctor {
  id: string;
  name: string;
  max_patients_per_day: number;
  work_days: number[] | string;
}

// ===== DTO для UI =====

export interface AppointmentDto {
  id: string;
  patientId: string;
  appointmentDate: string;
  studies: string[];
  department: string;
  createdAt: string;
  patient?: {
    id: string;
    lastName: string;
    firstName: string;
    middleName: string;
    dateOfBirth: string;
  };
}

export interface DoctorDto {
  id: string;
  name: string;
  maxPatientsPerDay: number;
  workDays: number[];
}

// ===== Авторизация =====

export interface AuthUserDto {
  id: string;
  username: string;
  name: string;
  organization: string | null;
  createdAt: string;
  lastLogin: string | null;
}

export interface LoginResult {
  success: boolean;
  message: string;
  token: string;
  user: AuthUserDto;
}

export interface RegisterResult {
  success: boolean;
  message: string;
  userId: string;
}

export interface RegisterInput {
  username: string;
  password: string;
  name: string;
  organization?: string | null;
}

// ===== Входные данные =====

export interface CreateAppointmentInput {
  lastName: string;
  firstName: string;
  middleName: string;
  dateOfBirth: string;
  studies: string[];
  appointmentDate: string;
  department: string;
}

export interface UpdateAppointmentInput {
  studies?: string[];
  lastName?: string;
  firstName?: string;
  middleName?: string;
  dateOfBirth?: string;
}

export interface CreateDoctorInput {
  name: string;
  maxPatientsPerDay: number;
  workDays: number[];
}

export type UpdateDoctorInput = CreateDoctorInput;

// ===== Базовый запрос =====

async function request<T>(
  path: string,
  options?: RequestInit,
  allowNotFound = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string> | undefined),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 404 && allowNotFound) {
    // Для DELETE 404 означает, что запись уже не существует — это успех
    return { success: true } as T;
  }

  if (!res.ok) {
    let message = `HTTP ${res.status}`;
    try {
      const body: unknown = await res.json();
      if (body && typeof body === "object") {
        const error = (body as { error?: unknown }).error;
        const msg = (body as { message?: unknown }).message;
        if (typeof error === "string") {
          message = error;
        } else if (typeof msg === "string") {
          message = msg;
        }
      }
    } catch {
      // Тело не JSON — оставляем статус
    }
    throw new Error(message);
  }

  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

// ===== Маппинги =====

function normalizeStudies(studies: ApiAppointment["studies"]): string[] {
  if (Array.isArray(studies)) {
    return studies.filter((s): s is string => typeof s === "string");
  }
  if (typeof studies === "string") {
    try {
      const parsed: unknown = JSON.parse(studies);
      if (Array.isArray(parsed)) {
        return parsed.filter((s): s is string => typeof s === "string");
      }
    } catch {
      // Не JSON
    }
  }
  return [];
}

function mapAppointment(a: ApiAppointment): AppointmentDto {
  return {
    id: a.id,
    patientId: a.patient_id,
    appointmentDate: a.appointment_date,
    studies: normalizeStudies(a.studies),
    department: a.department ?? "",
    createdAt: a.created_at,
    patient: a.patient
      ? {
          id: a.patient.id,
          lastName: a.patient.last_name,
          firstName: a.patient.first_name,
          middleName: a.patient.middle_name ?? "",
          dateOfBirth: a.patient.date_of_birth,
        }
      : undefined,
  };
}

function normalizeWorkDays(workDays: ApiDoctor["work_days"]): number[] {
  if (Array.isArray(workDays)) {
    return workDays.filter((d): d is number => typeof d === "number");
  }
  if (typeof workDays === "string") {
    try {
      const parsed: unknown = JSON.parse(workDays);
      if (Array.isArray(parsed)) {
        return parsed.filter((d): d is number => typeof d === "number");
      }
    } catch {
      // Не JSON
    }
  }
  return [1, 2, 3, 4, 5];
}

function mapDoctor(d: ApiDoctor): DoctorDto {
  return {
    id: d.id,
    name: d.name,
    maxPatientsPerDay: d.max_patients_per_day,
    workDays: normalizeWorkDays(d.work_days),
  };
}

// ===== Авторизация =====

export function login(username: string, password: string): Promise<LoginResult> {
  return request<LoginResult>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function register(data: RegisterInput): Promise<RegisterResult> {
  return request<RegisterResult>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ===== Записи (Appointments) =====

export function fetchAppointmentsByDate(date: string): Promise<AppointmentDto[]> {
  return request<ApiAppointment[]>(
    `/appointments?date=${encodeURIComponent(date)}`
  ).then((items) => items.map(mapAppointment));
}

export function fetchAppointmentsByMonth(
  month: number,
  year: number
): Promise<AppointmentDto[]> {
  return request<ApiAppointment[]>(
    `/appointments?month=${month}&year=${year}`
  ).then((items) => items.map(mapAppointment));
}

export function createAppointment(
  data: CreateAppointmentInput
): Promise<AppointmentDto> {
  return request<ApiAppointment>("/appointments", {
    method: "POST",
    body: JSON.stringify(data),
  }).then(mapAppointment);
}

export function updateAppointment(
  id: string,
  data: UpdateAppointmentInput
): Promise<AppointmentDto> {
  return request<ApiAppointment>(`/appointments/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then(mapAppointment);
}

export function deleteAppointment(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    `/appointments/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    true
  );
}

// ===== Врачи (Doctors) =====

export function fetchDoctors(): Promise<DoctorDto[]> {
  return request<ApiDoctor[]>("/doctors").then((items) =>
    items.map(mapDoctor)
  );
}

export function createDoctor(data: CreateDoctorInput): Promise<DoctorDto> {
  return request<ApiDoctor>("/doctors", {
    method: "POST",
    body: JSON.stringify(data),
  }).then(mapDoctor);
}

export function updateDoctor(
  id: string,
  data: UpdateDoctorInput
): Promise<DoctorDto> {
  return request<ApiDoctor>(`/doctors/${encodeURIComponent(id)}`, {
    method: "PUT",
    body: JSON.stringify(data),
  }).then(mapDoctor);
}

export function deleteDoctor(id: string): Promise<{ success: boolean }> {
  return request<{ success: boolean }>(
    `/doctors/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    true
  );
}

// ===== Здоровье сервера =====

export function fetchHealth(): Promise<{ status: string }> {
  return request<{ status: string }>("/health");
}
