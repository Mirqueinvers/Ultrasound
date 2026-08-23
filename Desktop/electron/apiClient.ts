// HTTP-клиент для центрального API-сервера (Server/).
// Живёт в main-процессе Electron, оперирует реальными эндпоинтами Server/src/routes.
// Конфигурация (URL сервера) и JWT-токен хранятся в памяти модуля;
// персистентность (userData/server-config.json) — в отдельном apiConfig.ts.
//
// Этап 2.3: офлайн-кэш чтения (MVP по п. 4.3 плана).
//  - GET-запросы кэшируются (cache-through): онлайн — обновляем кэш и отдаём свежее;
//    сеть недоступна — отдаём из кэша.
//  - Записи (POST/PUT/PATCH/DELETE) офлайн запрещены: выбрасываем ApiError c code "OFFLINE".
//  - После успешной мутации инвалидируем связанные префиксы кэша.
//
// ВАЖНО: этот модуль НЕ зависит от `electron`, чтобы был тестируем в vitest (node-окружение).
import { OfflineCache } from "./cache/offlineCache";
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

// ===== TTL для кэша чтения =====
export const CACHE_TTL = {
  /** 5 минут — журнал, списки, поиск. */
  SHORT: 5 * 60 * 1000,
  /** 15 минут — статистика (тяжёлый запрос). */
  MEDIUM: 15 * 60 * 1000,
  /** Вечная запись — объект по id (обновляется при онлайн-чтении). */
  ETERNAL: undefined,
} as const;

// ===== Ошибка API =====
export class ApiError extends Error {
  status?: number;
  code?: "OFFLINE" | "NOT_CONFIGURED" | "HTTP";

  constructor(
    message: string,
    status?: number,
    code?: "OFFLINE" | "NOT_CONFIGURED" | "HTTP",
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
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
  /** Ключ кэша для GET-запросов (cache-through). */
  cacheKey?: string;
  /** TTL записи кэша в мс. undefined/не задано = вечная запись. */
  cacheTtlMs?: number;
  /** Префиксы кэша для инвалидации после мутации. */
  invalidatePrefixes?: string[];
}

async function request<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  if (!isConfigured()) {
    throw new ApiError(
      "Адрес сервера не настроен",
      undefined,
      "NOT_CONFIGURED",
    );
  }

  const { method = "GET", query, body, auth = true } = options;
  const isRead = method === "GET";
  const cache = OfflineCache.getInstance();

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
    // ===== Сеть недоступна: для GET пробуем кэш, иначе — ошибка OFFLINE =====
    if (isRead && options.cacheKey) {
      const hit = cache.getValue<T>(options.cacheKey);
      if (hit) {
        return hit.value;
      }
    }
    const cause = err instanceof Error ? err.message : String(err);
    throw new ApiError(
      `Нет связи с сервером по адресу ${serverUrl} (${cause})`,
      undefined,
      "OFFLINE",
    );
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
    throw new ApiError(message, response.status, "HTTP");
  }

  if (response.status === 204) {
    if (!isRead && options.invalidatePrefixes) {
      for (const prefix of options.invalidatePrefixes) {
        cache.deleteKeysByPrefix(prefix);
      }
    }
    return undefined as T;
  }

  let result: T;
  try {
    result = (await response.json()) as T;
  } catch {
    result = undefined as T;
  }

  if (isRead && options.cacheKey) {
    cache.setValue(options.cacheKey, result, options.cacheTtlMs);
  } else if (!isRead && options.invalidatePrefixes) {
    for (const prefix of options.invalidatePrefixes) {
      cache.deleteKeysByPrefix(prefix);
    }
  }

  return result;
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

  getMe: () =>
    request<ApiUser>("/auth/me", {
      cacheKey: "auth:me",
      cacheTtlMs: CACHE_TTL.ETERNAL,
    }),

  updateProfile: (data: {
    name: string;
    username: string;
    organization?: string | null;
  }) =>
    request<ApiSuccessResponse<{ user: ApiUser }>>("/auth/profile", {
      method: "PATCH",
      body: data,
      invalidatePrefixes: ["auth:me"],
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
      cacheKey: `patient:list:${limit ?? ""}:${offset ?? ""}`,
      cacheTtlMs: CACHE_TTL.SHORT,
    }),

  search: (query: string, limit?: number) =>
    request<{ patients: ApiPatient[]; total: number }>("/patients/search", {
      query: { q: query, limit },
      cacheKey: `patient:search:${query}:${limit ?? ""}`,
      cacheTtlMs: CACHE_TTL.SHORT,
    }),

  getById: (id: string) =>
    request<ApiPatient>(`/patients/${id}`, {
      cacheKey: `patient:byId:${id}`,
      cacheTtlMs: CACHE_TTL.ETERNAL,
    }),

  create: (data: {
    lastName: string;
    firstName: string;
    middleName?: string | null;
    dateOfBirth: string;
  }) =>
    request<ApiPatient>("/patients", {
      method: "POST",
      body: data,
      invalidatePrefixes: ["patient:list:", "patient:search:"],
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
        invalidatePrefixes: ["patient:list:", "patient:search:"],
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
      invalidatePrefixes: [
        `patient:byId:${id}`,
        "patient:list:",
        "patient:search:",
      ],
    }),

  delete: (id: string) =>
    request<ApiSuccessResponse>(`/patients/${id}`, {
      method: "DELETE",
      invalidatePrefixes: [
        `patient:byId:${id}`,
        "patient:list:",
        "patient:search:",
        "research:byPatient:",
        "journal:",
      ],
    }),
};

// ===== Researches =====
export const researchesApi = {
  getAll: (limit?: number, offset?: number) =>
    request<{ researches: ApiResearch[]; total: number }>("/researches", {
      query: { limit, offset },
      cacheKey: `research:list:${limit ?? ""}:${offset ?? ""}`,
      cacheTtlMs: CACHE_TTL.SHORT,
    }),

  search: (query: string, limit?: number) =>
    request<{ researches: ApiResearch[]; total: number }>(
      "/researches/search",
      {
        query: { q: query, limit },
        cacheKey: `research:search:${query}:${limit ?? ""}`,
        cacheTtlMs: CACHE_TTL.SHORT,
      },
    ),

  getByPatientId: (patientId: string, limit?: number, offset?: number) =>
    request<{ researches: ApiResearch[]; total: number }>("/researches", {
      query: { patientId, limit, offset },
      cacheKey: `research:byPatient:${patientId}:${limit ?? ""}:${offset ?? ""}`,
      cacheTtlMs: CACHE_TTL.SHORT,
    }),

  getById: (id: string) =>
    request<ApiResearch>(`/researches/${id}`, {
      cacheKey: `research:byId:${id}`,
      cacheTtlMs: CACHE_TTL.ETERNAL,
    }),

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
      invalidatePrefixes: ["research:list:", "research:search:", "journal:"],
    }),

  addStudy: (
    researchId: string,
    data: { studyType: string; studyData: object },
  ) =>
    request<ApiSuccessResponse<{ studyId: string }>>(
      `/researches/${researchId}/studies`,
      {
        method: "POST",
        body: data,
        invalidatePrefixes: [
          `research:byId:${researchId}`,
          "research:byPatient:",
          "journal:",
        ],
      },
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
      invalidatePrefixes: [
        `research:byId:${id}`,
        "research:list:",
        "research:search:",
        "journal:",
      ],
    }),

  delete: (id: string) =>
    request<ApiSuccessResponse>(`/researches/${id}`, {
      method: "DELETE",
      invalidatePrefixes: [
        `research:byId:${id}`,
        "research:byPatient:",
        "research:list:",
        "research:search:",
        "journal:",
      ],
    }),
};

// ===== Journal =====
export const journalApi = {
  getByDate: (date: string) =>
    request<ApiJournalEntry[]>("/journal", {
      query: { date },
      cacheKey: `journal:date:${date}`,
      cacheTtlMs: CACHE_TTL.SHORT,
    }),

  getByPeriod: (from: string, to: string) =>
    request<ApiJournalEntry[]>("/journal", {
      query: { from, to },
      cacheKey: `journal:period:${from}:${to}`,
      cacheTtlMs: CACHE_TTL.SHORT,
    }),

  getDoctors: () =>
    request<string[]>("/journal/doctors", {
      cacheKey: "journal:doctors",
      cacheTtlMs: CACHE_TTL.SHORT,
    }),
};

// ===== Protocol =====
export const protocolApi = {
  getByResearchId: (id: string) =>
    request<ApiSavedProtocol>(`/researches/${id}/protocol`, {
      cacheKey: `protocol:${id}`,
      cacheTtlMs: CACHE_TTL.ETERNAL,
    }),

  savePrintOverrides: (
    researchId: string,
    printOverrides: Record<string, string>,
  ) =>
    request<ApiSuccessResponse>(
      `/researches/${researchId}/protocol/overrides`,
      {
        method: "PUT",
        body: { printOverrides },
        invalidatePrefixes: [`protocol:${researchId}`],
      },
    ),
};

// ===== Statistics =====
export const statisticsApi = {
  getStatistics: (from?: string, to?: string, doctor?: string) =>
    request<ApiSuccessResponse<ApiStatisticsData>>("/statistics", {
      query: { from, to, doctor },
      cacheKey: `statistics:${from ?? ""}:${to ?? ""}:${doctor ?? ""}`,
      cacheTtlMs: CACHE_TTL.MEDIUM,
    }),
};

// ===== Medison mappings =====
export const medisonApi = {
  getMappings: (userId: string) =>
    request<ApiMedisonMapping[]>("/medison-mappings", {
      query: { userId },
      cacheKey: `medison:${userId}`,
      cacheTtlMs: CACHE_TTL.ETERNAL,
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
      invalidatePrefixes: [`medison:${data.userId}`],
    }),

  deleteMapping: (id: string) =>
    request<ApiSuccessResponse>(`/medison-mappings/${id}`, {
      method: "DELETE",
      invalidatePrefixes: ["medison:"],
    }),

  resetDefaults: (userId: string) =>
    request<ApiSuccessResponse<{ inserted: number }>>(
      "/medison-mappings/reset",
      {
        method: "POST",
        body: { userId },
        invalidatePrefixes: [`medison:${userId}`],
      },
    ),
};

// ===== Appointments (Registry) =====
export const appointmentsApi = {
  getByDate: (date: string) =>
    request<ApiAppointment[]>("/appointments", {
      query: { date },
      cacheKey: `appointment:date:${date}`,
      cacheTtlMs: CACHE_TTL.SHORT,
    }),

  getByMonth: (month: number, year: number) =>
    request<ApiAppointment[]>("/appointments", {
      query: { month, year },
      cacheKey: `appointment:month:${month}:${year}`,
      cacheTtlMs: CACHE_TTL.SHORT,
    }),

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
      invalidatePrefixes: ["appointment:"],
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
      invalidatePrefixes: ["appointment:"],
    }),

  delete: (id: string) =>
    request<ApiSuccessResponse>(`/appointments/${id}`, {
      method: "DELETE",
      invalidatePrefixes: ["appointment:"],
    }),
};

// ===== Doctors (Registry) =====
export const doctorsApi = {
  getAll: () =>
    request<ApiDoctor[]>("/doctors", {
      cacheKey: "doctor:list",
      cacheTtlMs: CACHE_TTL.SHORT,
    }),

  create: (data: {
    name: string;
    maxPatientsPerDay?: number;
    workDays?: number[];
  }) =>
    request<ApiDoctor>("/doctors", {
      method: "POST",
      body: data,
      invalidatePrefixes: ["doctor:list"],
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
      invalidatePrefixes: ["doctor:list"],
    }),

  delete: (id: string) =>
    request<ApiSuccessResponse>(`/doctors/${id}`, {
      method: "DELETE",
      invalidatePrefixes: ["doctor:list"],
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