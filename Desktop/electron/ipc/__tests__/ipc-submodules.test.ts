// @vitest-environment node
// Этап 2.7: тесты подмодулей IPC-слоя (этап 2.2):
//   - medisonMappingIpc.ts — маппинги Medison;
//   - protocolHandlers.ts — протоколы исследований;
//   - mobileHostHandlers.ts — сервис Mobile (пульт).
// Все обращения к apiClient и mobile-host замоканы.
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { setupMedisonMappingHandlers } from "../medisonMappingIpc";
import { setupProtocolHandlers } from "../protocolHandlers";
import { setupMobileHostHandlers } from "../mobileHostHandlers";

const m = vi.hoisted(() => {
  const handlerRegistry = new Map<string, (...args: any[]) => unknown>();

  const ipcMainMock = {
    handle: (channel: string, fn: (...args: any[]) => unknown) => {
      handlerRegistry.set(channel, fn);
      return ipcMainMock;
    },
  };

  const apiClientMock = {
    medison: {
      getMappings: vi.fn(),
      upsertMapping: vi.fn(),
      deleteMapping: vi.fn(),
      resetDefaults: vi.fn(),
    },
    protocol: {
      getByResearchId: vi.fn(),
      savePrintOverrides: vi.fn(),
    },
  };

  const mobileHostMock = {
    getStatus: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    restart: vi.fn(),
    setProfile: vi.fn(),
    publishSyncMessage: vi.fn(),
  };

  class ApiError extends Error {
    status?: number;
    code?: string;
    constructor(message: string, status?: number, code?: string) {
      super(message);
      this.name = "ApiError";
      this.status = status;
      this.code = code;
    }
  }

  return {
    handlerRegistry,
    ipcMainMock,
    apiClientMock,
    mobileHostMock,
    ApiError,
  };
});

vi.mock("electron", () => ({ ipcMain: m.ipcMainMock }));
vi.mock("../../apiClient", () => ({
  apiClient: m.apiClientMock,
  ApiError: m.ApiError,
}));
vi.mock("../../mobile-host", () => ({
  getMobileHostService: () => m.mobileHostMock,
}));

// ===== Хелперы =====
function invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
  const handler = m.handlerRegistry.get(channel);
  if (!handler) throw new Error(`Обработчик не зарегистрирован: ${channel}`);
  return handler({}, ...args) as Promise<T>;
}

beforeEach(() => {
  m.handlerRegistry.clear();
  for (const group of [m.apiClientMock.medison, m.apiClientMock.protocol]) {
    for (const fn of Object.values(group)) {
      (fn as unknown as { mockReset: () => void }).mockReset();
    }
  }
  for (const fn of Object.values(m.mobileHostMock)) {
    (fn as unknown as { mockReset: () => void }).mockReset();
  }
  setupMedisonMappingHandlers();
  setupProtocolHandlers();
  setupMobileHostHandlers();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("medison-mapping-хендлеры", () => {
  const mapping = {
    id: "m-1",
    user_id: "u-1",
    measurement_id: "1",
    target_study_type: "obp",
    target_field: "liver",
    transform: "direct",
    is_enabled: 1,
  };

  it("medison-mapping:getAll — успех и ошибка", async () => {
    m.apiClientMock.medison.getMappings.mockResolvedValue([mapping]);
    const res = await invoke("medison-mapping:getAll", "u-1");
    expect(m.apiClientMock.medison.getMappings).toHaveBeenCalledWith("u-1");
    expect(res).toEqual({ success: true, mappings: [mapping] });

    m.apiClientMock.medison.getMappings.mockRejectedValue(new Error("network"));
    expect(await invoke("medison-mapping:getAll", "u-1")).toEqual({
      success: false,
      message: "Ошибка получения маппингов",
    });
  });

  it("medison-mapping:upsert — успех и ApiError", async () => {
    m.apiClientMock.medison.upsertMapping.mockResolvedValue({
      data: { id: "m-2" },
    });
    const payload = {
      userId: "u-1",
      measurementId: "2",
      targetStudyType: "thyroid",
      targetField: "leftLobe",
      transform: "direct",
      isEnabled: true,
    };
    const res = await invoke("medison-mapping:upsert", payload);
    expect(m.apiClientMock.medison.upsertMapping).toHaveBeenCalledWith(payload);
    expect(res).toEqual({ success: true, id: "m-2" });

    m.apiClientMock.medison.upsertMapping.mockRejectedValue(
      new m.ApiError("Маппинг уже существует"),
    );
    expect(await invoke("medison-mapping:upsert", payload)).toEqual({
      success: false,
      message: "Маппинг уже существует",
    });
  });

  it("medison-mapping:delete — успех и ошибка", async () => {
    m.apiClientMock.medison.deleteMapping.mockResolvedValue({
      success: true,
    });
    const res = await invoke("medison-mapping:delete", "m-1");
    expect(m.apiClientMock.medison.deleteMapping).toHaveBeenCalledWith("m-1");
    expect(res).toEqual({ success: true });

    m.apiClientMock.medison.deleteMapping.mockRejectedValue(
      new m.ApiError("Не найдено"),
    );
    expect(await invoke("medison-mapping:delete", "m-999")).toEqual({
      success: false,
      message: "Не найдено",
    });
  });

  it("medison-mapping:resetDefaults — успех и ошибка", async () => {
    m.apiClientMock.medison.resetDefaults.mockResolvedValue({
      success: true,
    });
    const res = await invoke("medison-mapping:resetDefaults", "u-1");
    expect(m.apiClientMock.medison.resetDefaults).toHaveBeenCalledWith("u-1");
    expect(res).toEqual({ success: true });

    m.apiClientMock.medison.resetDefaults.mockRejectedValue(
      new m.ApiError("Сервер недоступен"),
    );
    expect(await invoke("medison-mapping:resetDefaults", "u-1")).toEqual({
      success: false,
      message: "Сервер недоступен",
    });
  });
});

describe("protocol-хендлеры (ipc/protocolHandlers.ts)", () => {
  it("protocol:getByResearchId — успех и ошибка: null", async () => {
    const saved = {
      researchId: "r-1",
      studies: { obp: {} },
      printOverrides: {},
    };
    m.apiClientMock.protocol.getByResearchId.mockResolvedValue(saved);
    const res = await invoke("protocol:getByResearchId", "r-1");
    expect(m.apiClientMock.protocol.getByResearchId).toHaveBeenCalledWith(
      "r-1",
    );
    expect(res).toEqual(saved);

    m.apiClientMock.protocol.getByResearchId.mockRejectedValue(
      new Error("network"),
    );
    expect(await invoke("protocol:getByResearchId", "r-1")).toBeNull();
  });

  it("protocol:savePrintOverrides — успех, дефолтный overrides {} и ошибка", async () => {
    m.apiClientMock.protocol.savePrintOverrides.mockResolvedValue({
      message: "Сохранено",
    });
    // data.overrides не передан → обработчик подставляет {}.
    const res = await invoke("protocol:savePrintOverrides", {
      researchId: "r-1",
    });
    expect(m.apiClientMock.protocol.savePrintOverrides).toHaveBeenCalledWith(
      "r-1",
      {},
    );
    expect(res).toEqual({ success: true, message: "Сохранено" });

    m.apiClientMock.protocol.savePrintOverrides.mockRejectedValue(
      new m.ApiError("Не найдено"),
    );
    expect(
      await invoke("protocol:savePrintOverrides", {
        researchId: "r-999",
        overrides: {},
      }),
    ).toEqual({ success: false, message: "Не найдено" });
  });
});

describe("mobile-host-хендлеры", () => {
  it("mobile-host:getStatus возвращает статус сервиса", async () => {
    m.mobileHostMock.getStatus.mockReturnValue({
      running: true,
      port: 38244,
      sessionId: null,
    });
    expect(await invoke("mobile-host:getStatus")).toEqual({
      running: true,
      port: 38244,
      sessionId: null,
    });
  });

  it("mobile-host:start и restart делегируют в сервис", async () => {
    m.mobileHostMock.start.mockResolvedValue("started");
    expect(await invoke("mobile-host:start")).toBe("started");
    expect(m.mobileHostMock.start).toHaveBeenCalledTimes(1);

    m.mobileHostMock.restart.mockResolvedValue("restarted");
    expect(await invoke("mobile-host:restart")).toBe("restarted");
    expect(m.mobileHostMock.restart).toHaveBeenCalledTimes(1);
  });

  it("mobile-host:stop останавливает и возвращает статус", async () => {
    m.mobileHostMock.stop.mockReturnValue(undefined);
    m.mobileHostMock.getStatus.mockReturnValue({
      running: false,
      port: null,
    });
    const res = await invoke("mobile-host:stop");
    expect(m.mobileHostMock.stop).toHaveBeenCalledTimes(1);
    expect(res).toEqual({ running: false, port: null });
  });

  it("mobile-host:setProfile передаёт профиль в сервис", async () => {
    const profile = { port: 9000, organization: "Клиника" };
    m.mobileHostMock.setProfile.mockReturnValue(undefined);
    await invoke("mobile-host:setProfile", profile);
    expect(m.mobileHostMock.setProfile).toHaveBeenCalledWith(profile);
  });

  it("mobile-host:publishSync публикует сообщение и возвращает статус", async () => {
    const message = { type: "sync", payload: { patientId: "p-1" } };
    m.mobileHostMock.publishSyncMessage.mockReturnValue(undefined);
    m.mobileHostMock.getStatus.mockReturnValue({ running: true, port: 38244 });
    const res = await invoke("mobile-host:publishSync", message);
    expect(m.mobileHostMock.publishSyncMessage).toHaveBeenCalledWith(message);
    expect(res).toEqual({ running: true, port: 38244 });
  });
});
