// HTTP-клиент для центрального API-сервера (Server/).
// Живёт в main-процессе Electron, оперирует реальными эндпоинтами Server/src/routes.
// Конфигурация (URL сервера) и JWT-токен хранятся в памяти модуля;
// персистентность (userData/server-config.json) — в отдельном apiConfig.ts.
//
// ВАЖНО: этот модуль НЕ зависит от `electron`, чтобы был тестируем в vitest (node-окружение).
import type {
  ApiAppointment,
  ApiDoctor,
  ApiJournalEntry,
  ApiLoginResponse,
  ApiMedisonMapping,
  ApiPatient,
  ApiResearch,
  ApiSavedProtocol,
  ApiStatisticsData,
  ApiSuccessResponse,
  ApiUser,
} from "./apiTypes";

// ===== Ошибка API =====
export class ApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// ===== Состояние клиента =====
let serverUrl = "";
let token: string | null = null;

export function setServerUrl(url: string): void {
  serverUrl = url.replace(/\/+$/, "");
}

export function getServerUrl(): string {
  return serverUrl;
}

export function isConfigured(): boolean {
  return serverUrl.trim().length > 0;
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

// ===== Базовый запрос =====
interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  query?: Record<string, string | number | undefined>;
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  if (!isConfigured()) {
    throw new ApiError("Адрес сервера не настроен");
  }

  const { method = "GET", query, body, auth = true } = options;

  const queryString = query
    ? Object.entries(query)
        .filter(([, v]) => v !== undefined && v !== null && v !== "")
        .map(
          ([k, v]) =>
            `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`,
        )
        .join("&")
    : "";
  const url = `${serverUrl}/api${path}${queryString ? `?${queryString}` : ""}`;

  const headers: Record<string, string> = {};
  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (auth && token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    const cause = err instanceof Error ? err.message : String(err);
    throw new ApiError(`Нет связи с сервером по адресу ${serverUrl} (${cause})`);
  }

  if (!response.ok) {
    let message = `Ошибка сервера: ${response.status}`;
    try {
      const parsed = (await response.json()) as {
        error?: string;
        message?: string;
      };
      if (parsed.error) message = parsed.error;
      else if (parsed.message) message = parsed.message;
    } catch {
      // тело не JSON — оставляем статусное сообщение
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  try {
    return (await response.json()) as T;
  } catch {
    return undefined as T;
  }
}

// ===== Auth =====
export const authApi = {
  register: (data: {
    username: string;
    password: string;
    name: string;
    organization?: string;
  }) => request<ApiSuccessResponse<{ userId: string }>>("/auth/register", {
    method: "POST",
    body: data,
    auth: false,
  }),

  login: (data: { username: string; password: string }) =>
    request<ApiLoginResponse>("/auth/login", {
      method: "POST",
      body: data,
      auth: false,
    }),

  getMe: () => request<ApiUser>("/auth/me"),

  updateProfile: (data: {
    name: string;
    username: string;
    organization?: string | null;
  }) =>
    request<ApiSuccessResponse<{ user: ApiUser }>>("/auth/profile", {
      method: "PATCH",
      body: data,
    }),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
  }) =>
    request<ApiSuccessResponse>("/auth/password", {
      method: "PATCH",
      body: data,
    }),
};

// ===== Patients =====
export const patientsApi = {
  getAll: (limit?: number, offset?: number) =>
    request<{ patients: ApiPatient[]; total: number }>("/patients", {
      query: { limit, offset },
    }),

  search: (query: string, limit?: number) =>
    request<{ patients: ApiPatient[]; total: number }>("/patients/search", {
      query: { q: query, limit },
    }),

  getById: (id: string) => request<ApiPatient>(`/patients/${id}`),

  create: (data: {
    lastName: string;
    firstName: string;
    middleName?: string | null;
    dateOfBirth: string;
  }) =>
    request<ApiPatient>("/patients", {
      method: "POST",
      body: data,
    }),

  findOrCreate: (data: {
    lastName: string;
    firstName: string;
    middleName?: string | null;
    dateOfBirth: string;
  }) =>
    request<ApiSuccessResponse<{ patient: ApiPatient }>>(
      "/patients/find-or-create",
      {
        method: "POST",
        body: data,
      },
    ),

  update: (
    id: string,
    data: {
      lastName?: string;
      firstName?: string;
      middleName?: string | null;
      dateOfBirth?: string;
    },
  ) =>
    request<ApiPatient>(`/patients/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: string) =>
    request<ApiSuccessResponse>(`/patients/${id}`, {
      method: "DELETE",
    }),
};

// ===== Researches =====
export const researchesApi = {
  getAll: (limit?: number, offset?: number) =>
    request<{ researches: ApiResearch[]; total: number }>("/researches", {
      query: { limit, offset },
    }),

  search: (query: string, limit?: number) =>
    request<{ researches: ApiResearch[]; total: number }>(
      "/researches/search",
      { query: { q: query, limit } },
    ),

  getByPatientId: (patientId: string, limit?: number, offset?: number) =>
    request<{ researches: ApiResearch[]; total: number }>("/researches", {
      query: { patientId, limit, offset },
    }),

  getById: (id: string) => request<ApiResearch>(`/researches/${id}`),

  create: (data: {
    patientId: string;
    researchDate: string;
    paymentType: "oms" | "paid";
    organization?: string | null;
    doctorName?: string | null;
    notes?: string | null;
  }) =>
    request<ApiSuccessResponse<{ researchId: string }>>("/researches", {
      method: "POST",
      body: data,
    }),

  addStudy: (
    researchId: string,
    data: { studyType: string; studyData: object },
  ) =>
    request<ApiSuccessResponse<{ studyId: string }>>(
      `/researches/${researchId}/studies`,
      { method: "POST", body: data },
    ),

  update: (
    id: string,
    data: Partial<{
      researchDate: string;
      paymentType: "oms" | "paid";
      organization: string | null;
      doctorName: string | null;
      notes: string | null;
    }>,
  ) =>
    request<ApiSuccessResponse>(`/researches/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: string) =>
    request<ApiSuccessResponse>(`/researches/${id}`, {
      method: "DELETE",
    }),
};

// ===== Journal =====
export const journalApi = {
  getByDate: (date: string) =>
    request<ApiJournalEntry[]>("/journal", { query: { date } }),

  getByPeriod: (from: string, to: string) =>
    request<ApiJournalEntry[]>("/journal", { query: { from, to } }),

  getDoctors: () => request<string[]>("/journal/doctors"),
};

// ===== Protocol =====
export const protocolApi = {
  getByResearchId: (id: string) =>
    request<ApiSavedProtocol>(`/researches/${id}/protocol`),

  savePrintOverrides: (researchId: string, printOverrides: Record<string, string>) =>
    request<ApiSuccessResponse>(
      `/researches/${researchId}/protocol/overrides`,
      { method: "PUT", body: { printOverrides } },
    ),
};

// ===== Statistics =====
export const statisticsApi = {
  getStatistics: (from?: string, to?: string, doctor?: string) =>
    request<ApiSuccessResponse<ApiStatisticsData>>("/statistics", {
      query: { from, to, doctor },
    }),
};

// ===== Medison mappings =====
export const medisonApi = {
  getMappings: (userId: string) =>
    request<ApiMedisonMapping[]>("/medison-mappings", {
      query: { userId },
    }),

  upsertMapping: (data: {
    userId: string;
    measurementId: string;
    targetStudyType: string;
    targetField: string;
    transform?: string;
    isEnabled?: boolean;
  }) =>
    request<ApiSuccessResponse<{ id: string }>>("/medison-mappings", {
      method: "POST",
      body: data,
    }),

  deleteMapping: (id: string) =>
    request<ApiSuccessResponse>(`/medison-mappings/${id}`, {
      method: "DELETE",
    }),

  resetDefaults: (userId: string) =>
    request<ApiSuccessResponse<{ inserted: number }>>("/medison-mappings/reset", {
      method: "POST",
      body: { userId },
    }),
};

// ===== Appointments (Registry) =====
export const appointmentsApi = {
  getByDate: (date: string) =>
    request<ApiAppointment[]>("/appointments", { query: { date } }),

  getByMonth: (month: number, year: number) =>
    request<ApiAppointment[]>("/appointments", { query: { month, year } }),

  create: (data: {
    lastName: string;
    firstName: string;
    middleName?: string | null;
    dateOfBirth: string;
    appointmentDate: string;
    studies?: string[];
    department?: string | null;
  }) =>
    request<ApiAppointment>("/appointments", {
      method: "POST",
      body: data,
    }),

  update: (
    id: string,
    data: Partial<{
      studies: string[];
      lastName: string;
      firstName: string;
      middleName: string | null;
      dateOfBirth: string;
      department: string | null;
    }>,
  ) =>
    request<ApiAppointment>(`/appointments/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: string) =>
    request<ApiSuccessResponse>(`/appointments/${id}`, {
      method: "DELETE",
    }),
};

// ===== Doctors (Registry) =====
export const doctorsApi = {
  getAll: () => request<ApiDoctor[]>("/doctors"),

  create: (data: {
    name: string;
    maxPatientsPerDay?: number;
    workDays?: number[];
  }) =>
    request<ApiDoctor>("/doctors", {
      method: "POST",
      body: data,
    }),

  update: (
    id: string,
    data: {
      name: string;
      maxPatientsPerDay?: number;
      workDays?: number[];
    },
  ) =>
    request<ApiDoctor>(`/doctors/${id}`, {
      method: "PUT",
      body: data,
    }),

  delete: (id: string) =>
    request<ApiSuccessResponse>(`/doctors/${id}`, {
      method: "DELETE",
    }),
};

// ===== Единая точка входа =====
export const apiClient = {
  setServerUrl,
  getServerUrl,
  isConfigured,
  setToken,
  getToken,
  clearToken,
  auth: authApi,
  patients: patientsApi,
  researches: researchesApi,
  journal: journalApi,
  protocol: protocolApi,
  statistics: statisticsApi,
  medison: medisonApi,
  appointments: appointmentsApi,
  doctors: doctorsApi,
};