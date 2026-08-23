// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  apiClient,
  ApiError,
  clearToken,
  setServerUrl,
} from "../apiClient";
import { OfflineCache } from "../cache/offlineCache";

const mockFetch = vi.fn();

function mockOnline(body: unknown, status = 200): void {
  mockFetch.mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as unknown as Response);
}

function mockNetworkError(message = "fetch failed"): void {
  mockFetch.mockRejectedValue(new TypeError(message));
}

beforeEach(() => {
  mockFetch.mockReset();
  vi.stubGlobal("fetch", mockFetch);
  setServerUrl("http://192.168.1.10:4000");
  clearToken();
  // Свежая in-memory БД кэша для каждого теста.
  OfflineCache.getInstance().dispose();
  OfflineCache.getInstance().init(":memory:");
});

afterEach(() => {
  vi.unstubAllGlobals();
  OfflineCache.getInstance().dispose();
});

describe("apiClient: офлайн-кэш чтения (этап 2.3)", () => {
  it("GET онлайн — записывает результат в кэш", async () => {
    mockOnline({
      id: "p-1",
      last_name: "Иванов",
      first_name: "Иван",
      middle_name: null,
      date_of_birth: "1980-01-15",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    await apiClient.patients.getById("p-1");
    expect(mockFetch).toHaveBeenCalledTimes(1);
    const cache = OfflineCache.getInstance();
    expect(cache.getValue("patient:byId:p-1")).toBeDefined();
  });

  it("GET при обрыве сети — отдаёт закэшированные данные", async () => {
    mockOnline({
      id: "p-1",
      last_name: "Иванов",
      first_name: "Иван",
      middle_name: null,
      date_of_birth: "1980-01-15",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    // Первый запрос — онлайн, результат кэшируется.
    const first = await apiClient.patients.getById("p-1");
    expect(first.id).toBe("p-1");

    // Сервер отвалился: fetch падает, но данные приходят из кэша.
    mockNetworkError();
    const second = await apiClient.patients.getById("p-1");
    expect(second.id).toBe("p-1");
  });

  it("GET при обрыве сети без кэша — бросает ApiError c code OFFLINE", async () => {
    mockNetworkError();
    try {
      await apiClient.patients.getById("never-cached");
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).code).toBe("OFFLINE");
      expect((err as ApiError).message).toContain("Нет связи с сервером");
    }
  });

  it("POST при обрыве сети — бросает ApiError c code OFFLINE", async () => {
    mockNetworkError();
    try {
      await apiClient.patients.create({
        lastName: "Иванов",
        firstName: "Иван",
        middleName: null,
        dateOfBirth: "1980-01-15",
      });
      expect.unreachable();
    } catch (err) {
      expect(err).toBeInstanceOf(ApiError);
      expect((err as ApiError).code).toBe("OFFLINE");
    }
  });

  it("мутация онлайн инвалидирует связанные префиксы кэша", async () => {
    // Сначала заполняем кэш чтением.
    mockOnline({
      id: "p-1",
      last_name: "Иванов",
      first_name: "Иван",
      middle_name: null,
      date_of_birth: "1980-01-15",
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    });
    await apiClient.patients.getById("p-1");

    const cache = OfflineCache.getInstance();
    expect(cache.getValue("patient:byId:p-1")).toBeDefined();

    // Обновление пациента — успешная мутация — кэш по id и списки очищены.
    mockOnline({ success: true, message: "Обновлено" });
    await apiClient.patients.update("p-1", {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: null,
      dateOfBirth: "1980-01-15",
    });

    expect(cache.getValue("patient:byId:p-1")).toBeUndefined();
    expect(cache.countByPrefix("patient:list:")).toBe(0);
    expect(cache.countByPrefix("patient:search:")).toBe(0);
  });

  it("удаление исследования инвалидирует журнал и список исследований", async () => {
    // Заполняем кэш чтением журнала.
    mockOnline([]);
    await apiClient.journal.getByDate("2026-08-23");

    const cache = OfflineCache.getInstance();
    expect(cache.getValue("journal:date:2026-08-23")).toBeDefined();

    // Удаление исследования с сервера.
    mockOnline({ success: true, message: "Удалено" });
    await apiClient.researches.delete("r-1");

    expect(cache.getValue("journal:date:2026-08-23")).toBeUndefined();
    expect(cache.countByPrefix("research:")).toBe(0);
  });
});