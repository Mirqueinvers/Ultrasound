// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiClient,
  ApiError,
  clearToken,
  setServerUrl,
  setToken,
} from "../apiClient";

// ===== Мок глобального fetch =====
const mockFetch = vi.fn();

interface MockResponseInit {
  ok?: boolean;
  status?: number;
  body?: unknown;
}

function mockResponse({ ok = true, status = 200, body }: MockResponseInit): Response {
  return {
    ok,
    status,
    json: async () => body,
  } as unknown as Response;
}

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
  setServerUrl("http://192.168.1.10:4000");
  clearToken();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiClient: базовая логика", () => {
  it("бросает ApiError, если адрес сервера не настроен", async () => {
    setServerUrl("");
    await expect(apiClient.patients.getAll()).rejects.toThrow("Адрес сервера не настроен");
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("формирует URL с query-параметрами", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ body: { patients: [], total: 0 } }),
    );
    await apiClient.patients.getAll(10, 20);
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("http://192.168.1.10:4000/api/patients?limit=10&offset=20");
    expect(init.method).toBe("GET");
  });

  it("не добавляет Authorization без токена", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ body: { patients: [], total: 0 } }),
    );
    await apiClient.patients.getAll();
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers).not.toHaveProperty("Authorization");
  });

  it("добавляет Bearer-токен в заголовки", async () => {
    setToken("jwt-token-123");
    mockFetch.mockResolvedValue(
      mockResponse({ body: { patients: [], total: 0 } }),
    );
    await apiClient.patients.getAll();
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer jwt-token-123");
  });

  it("отправляет JSON-тело и Content-Type при POST", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({
        status: 201,
        body: {
          id: "p-1",
          last_name: "Иванов",
          first_name: "Иван",
          middle_name: "Иванович",
          date_of_birth: "1980-01-15",
          created_at: "2026-01-01T00:00:00.000Z",
          updated_at: "2026-01-01T00:00:00.000Z",
        },
      }),
    );
    await apiClient.patients.create({
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      dateOfBirth: "1980-01-15",
    });
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("http://192.168.1.10:4000/api/patients");
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toEqual({
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      dateOfBirth: "1980-01-15",
    });
  });
});

describe("apiClient: обработка ошибок", () => {
  it("преобразует ошибку сети в ApiError с понятным сообщением", async () => {
    mockFetch.mockRejectedValue(new TypeError("fetch failed"));
    const promise = apiClient.patients.getAll();
    await expect(promise).rejects.toThrow(ApiError);
    await expect(promise).rejects.toThrow("Нет связи с сервером");
  });

  it("преобразует HTTP 400 в ApiError с сообщением из тела ответа", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 400,
        body: { error: "Неверный логин или пароль" },
      }),
    );
    await expect(apiClient.auth.login({ username: "u", password: "wrong" })).rejects.toThrow(
      "Неверный логин или пароль",
    );
  });

  it("сохраняет статус в ApiError", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({
        ok: false,
        status: 404,
        body: { error: "Пациент не найден" },
      }),
    );
    try {
      await apiClient.patients.getById("missing");
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).status).toBe(404);
    }
  });
});

describe("apiClient: авторизация", () => {
  it("login не отправляет Authorization и возвращает токен и пользователя", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({
        body: {
          success: true,
          message: "Вход выполнен успешно",
          token: "new-token",
          user: {
            id: "u-1",
            username: "doctor",
            name: "Иванов И.И.",
            organization: "ГБУЗ №1",
            created_at: "2026-01-01T00:00:00.000Z",
            last_login: "2026-08-23T00:00:00.000Z",
          },
        },
      }),
    );
    const result = await apiClient.auth.login({
      username: "doctor",
      password: "secret",
    });
    expect(result.token).toBe("new-token");

    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("http://192.168.1.10:4000/api/auth/login");
    expect(init.headers).not.toHaveProperty("Authorization");
    expect(JSON.parse(init.body)).toEqual({ username: "doctor", password: "secret" });
  });

  it("/auth/me использует сохранённый токен", async () => {
    setToken("stored-jwt");
    mockFetch.mockResolvedValue(
      mockResponse({
        body: {
          id: "u-1",
          username: "doctor",
          name: "Иванов И.И.",
          organization: null,
          created_at: "2026-01-01T00:00:00.000Z",
          last_login: null,
        },
      }),
    );
    await apiClient.auth.getMe();
    const [, init] = mockFetch.mock.calls[0];
    expect(init.headers.Authorization).toBe("Bearer stored-jwt");
  });
});

describe("apiClient: URL-формирование по модулям", () => {
  it("journal.getByDate формирует правильный эндпоинт", async () => {
    mockFetch.mockResolvedValue(mockResponse({ body: [] }));
    await apiClient.journal.getByDate("2026-08-23");
    expect(mockFetch.mock.calls[0][0]).toBe(
      "http://192.168.1.10:4000/api/journal?date=2026-08-23",
    );
  });

  it("researches.getByPatientId добавляет patientId в query", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ body: { researches: [], total: 0 } }),
    );
    await apiClient.researches.getByPatientId("patient-uuid", 5);
    expect(mockFetch.mock.calls[0][0]).toBe(
      "http://192.168.1.10:4000/api/researches?patientId=patient-uuid&limit=5",
    );
  });

  it("protocol.savePrintOverrides шлёт PUT с телом { printOverrides }", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ body: { success: true, message: "Сохранено" } }),
    );
    await apiClient.protocol.savePrintOverrides("r-1", { block_a: "текст" });
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe(
      "http://192.168.1.10:4000/api/researches/r-1/protocol/overrides",
    );
    expect(init.method).toBe("PUT");
    expect(JSON.parse(init.body)).toEqual({ printOverrides: { block_a: "текст" } });
  });

  it("статистика передаёт from/to/doctor", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({ body: { success: true, data: {} } }),
    );
    await apiClient.statistics.getStatistics("2026-01-01", "2026-08-23", "Иванов");
    expect(mockFetch.mock.calls[0][0]).toBe(
      "http://192.168.1.10:4000/api/statistics?from=2026-01-01&to=2026-08-23&doctor=%D0%98%D0%B2%D0%B0%D0%BD%D0%BE%D0%B2",
    );
  });

  it("медисон-маппинги: getMappings использует userId", async () => {
    mockFetch.mockResolvedValue(mockResponse({ body: [] }));
    await apiClient.medison.getMappings("u-1");
    expect(mockFetch.mock.calls[0][0]).toBe(
      "http://192.168.1.10:4000/api/medison-mappings?userId=u-1",
    );
  });

  it("appointments.getByMonth использует month/year", async () => {
    mockFetch.mockResolvedValue(mockResponse({ body: [] }));
    await apiClient.appointments.getByMonth(7, 2026);
    expect(mockFetch.mock.calls[0][0]).toBe(
      "http://192.168.1.10:4000/api/appointments?month=7&year=2026",
    );
  });

  it("doctors.create отправляет POST с телом", async () => {
    mockFetch.mockResolvedValue(
      mockResponse({
        status: 201,
        body: {
          id: "d-1",
          name: "Петров",
          max_patients_per_day: 15,
          work_days: "[1,2,3,4,5]",
        },
      }),
    );
    await apiClient.doctors.create({ name: "Петров" });
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe("http://192.168.1.10:4000/api/doctors");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ name: "Петров" });
  });
});