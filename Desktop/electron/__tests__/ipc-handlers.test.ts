// @vitest-environment node
// Этап 2.7: тесты переписанного IPC-слоя (этап 2.2).
// Обработчики ipc-handlers.ts делегируют запросы центральному API-серверу (Server/).
// В тестах мокаем electron + apiClient + apiConfig и проверяем:
//   - регистрацию каналов;
//   - делегирование в apiClient с правильными аргументами;
//   - трансформацию ответов и обработку ошибок (ApiError → { success: false, message }).
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { promises as fs } from "node:fs";
import os from "node:os";
import path from "node:path";
import { setupAuthHandlers } from "../ipc-handlers";

// ===== Общий стейт моков: доступен фабрикам vi.mock и телам тестов =====
const m = vi.hoisted(() => {
  const handlerRegistry = new Map<string, (...args: any[]) => unknown>();
  const onRegistry = new Map<string, (...args: any[]) => void>();

  const ipcMainMock = {
    handle: (channel: string, fn: (...args: any[]) => unknown) => {
      handlerRegistry.set(channel, fn);
      return ipcMainMock;
    },
    on: (channel: string, fn: (...args: any[]) => void) => {
      onRegistry.set(channel, fn);
      return ipcMainMock;
    },
  };

  const dialogMock = {
    showSaveDialog: vi.fn(),
  };

  const userDataPath = { current: "" };
  const tempPath = { current: "" };
  const printBehavior = { success: true, reason: undefined as string | undefined };

  class MockBrowserWindow {
    static instances: MockBrowserWindow[] = [];
    webContents: any;
    isDestroyed = vi.fn(() => false);
    setTitle = vi.fn();
    close = vi.fn();
    loadFile = vi.fn(async () => undefined);
    constructor() {
      this.webContents = {
        executeJavaScript: vi.fn(async () => true),
        getPrintersAsync: vi.fn(async () => [{ name: "Принтер 1" }]),
        print: vi.fn(
          (_opts: unknown, cb: (ok: boolean, reason?: string) => void) => {
            cb(printBehavior.success, printBehavior.reason);
          },
        ),
      };
      MockBrowserWindow.instances.push(this);
    }
  }

  const apiClientMock = {
    setToken: vi.fn(),
    auth: {
      register: vi.fn(),
      login: vi.fn(),
      getMe: vi.fn(),
      updateProfile: vi.fn(),
      changePassword: vi.fn(),
    },
    patients: {
      findOrCreate: vi.fn(),
      search: vi.fn(),
      getAll: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    researches: {
      create: vi.fn(),
      addStudy: vi.fn(),
      getById: vi.fn(),
      getByPatientId: vi.fn(),
      getAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    },
    journal: {
      getByDate: vi.fn(),
      getByPeriod: vi.fn(),
      getDoctors: vi.fn(),
    },
    protocol: {
      getByResearchId: vi.fn(),
      savePrintOverrides: vi.fn(),
    },
    statistics: {
      getStatistics: vi.fn(),
    },
    appointments: {
      getByDate: vi.fn(),
    },
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

  const saveAuthToken = vi.fn();
  const saveServerConfig = vi.fn();

  return {
    handlerRegistry,
    onRegistry,
    ipcMainMock,
    dialogMock,
    userDataPath,
    tempPath,
    printBehavior,
    MockBrowserWindow,
    apiClientMock,
    ApiError,
    saveAuthToken,
    saveServerConfig,
  };
});

// Настоящий модуль electron недоступен вне Electron — полностью мокаем его.
vi.mock("electron", async () => {
  const osMod = await import("node:os");
  const pathMod = await import("node:path");
  return {
    app: {
      getPath: (name: string): string => {
        if (name === "temp") return m.tempPath.current || osMod.tmpdir();
        return (
          m.userDataPath.current ||
          pathMod.join(osMod.tmpdir(), "ultrasound-test-userdata")
        );
      },
    },
    ipcMain: m.ipcMainMock,
    BrowserWindow: m.MockBrowserWindow,
    dialog: m.dialogMock,
  };
});

vi.mock("../apiClient", () => ({
  apiClient: m.apiClientMock,
  ApiError: m.ApiError,
}));

vi.mock("../apiConfig", () => ({
  saveAuthToken: m.saveAuthToken,
  saveServerConfig: m.saveServerConfig,
}));

// ===== Хелперы =====
type Handler = (...args: any[]) => unknown;

function invoke<T = unknown>(channel: string, ...args: unknown[]): Promise<T> {
  const handler = m.handlerRegistry.get(channel) as Handler | undefined;
  if (!handler) throw new Error(`Обработчик не зарегистрирован: ${channel}`);
  return handler({}, ...args) as Promise<T>;
}

function invokeOn(channel: string): void {
  const handler = m.onRegistry.get(channel);
  if (!handler) throw new Error(`Слушатель не зарегистрирован: ${channel}`);
  handler();
}

// ===== Фейковое главное окно =====
function createMainWindow() {
  return {
    isDestroyed: vi.fn(() => false),
    isMaximized: vi.fn(() => false),
    focus: vi.fn(),
    show: vi.fn(),
    minimize: vi.fn(),
    maximize: vi.fn(),
    unmaximize: vi.fn(),
    close: vi.fn(),
    webContents: {
      getPrintersAsync: vi.fn(async () => [
        { name: "Принтер HP", isDefault: false, status: 0, options: {} },
      ]),
    },
  };
}

// ===== Фикстуры =====
const patientFixture = {
  id: "p-1",
  last_name: "Иванов",
  first_name: "Иван",
  middle_name: "Иванович",
  date_of_birth: "1980-01-15",
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
};

const studyFixture = {
  id: "s-1",
  research_id: "r-1",
  study_type: "obp",
  study_data: { liver: { freeFluid: "не определяется" } },
  created_at: "2026-01-01T00:00:00.000Z",
};

const researchFixture = {
  id: "r-1",
  patient_id: "p-1",
  research_date: "2026-08-23",
  payment_type: "oms",
  organization: null,
  doctor_name: "Петров",
  notes: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:00.000Z",
  studies: [studyFixture],
};

function resetApiClientMocks(): void {
  const groups = [
    m.apiClientMock.auth,
    m.apiClientMock.patients,
    m.apiClientMock.researches,
    m.apiClientMock.journal,
    m.apiClientMock.protocol,
    m.apiClientMock.statistics,
    m.apiClientMock.appointments,
  ];
  for (const group of groups) {
    for (const fn of Object.values(group)) {
      (fn as unknown as { mockReset: () => void }).mockReset();
    }
  }
  m.apiClientMock.setToken.mockReset();
}

let mainWindow: ReturnType<typeof createMainWindow>;

beforeEach(async () => {
  m.handlerRegistry.clear();
  m.onRegistry.clear();
  m.MockBrowserWindow.instances.length = 0;
  m.dialogMock.showSaveDialog.mockReset();
  m.saveAuthToken.mockReset();
  m.saveServerConfig.mockReset();
  m.printBehavior.success = true;
  m.printBehavior.reason = undefined;
  resetApiClientMocks();

  m.userDataPath.current = await fs.mkdtemp(
    path.join(os.tmpdir(), "ultrasound-test-"),
  );
  m.tempPath.current = os.tmpdir();
  mainWindow = createMainWindow();
  setupAuthHandlers(mainWindow as never);
});

afterEach(async () => {
  vi.unstubAllGlobals();
  if (m.userDataPath.current) {
    await fs
      .rm(m.userDataPath.current, { recursive: true, force: true })
      .catch(() => undefined);
  }
});

describe("auth-хендлеры", () => {
  it("auth:register — успех, возвращает message и userId", async () => {
    m.apiClientMock.auth.register.mockResolvedValue({
      message: "Регистрация успешна",
      data: { userId: "u-1" },
    });
    const res = await invoke("auth:register", {
      username: "doc",
      password: "secret",
      name: "Иванов И.И.",
      organization: "Клиника",
    });
    expect(m.apiClientMock.auth.register).toHaveBeenCalledWith({
      username: "doc",
      password: "secret",
      name: "Иванов И.И.",
      organization: "Клиника",
    });
    expect(res).toEqual({
      success: true,
      message: "Регистрация успешна",
      userId: "u-1",
    });
  });

  it("auth:register — ApiError возвращает success: false с текстом ошибки", async () => {
    m.apiClientMock.auth.register.mockRejectedValue(
      new m.ApiError("Логин занят"),
    );
    const res = await invoke("auth:register", {
      username: "doc",
      password: "secret",
      name: "Иванов",
    });
    expect(res).toEqual({ success: false, message: "Логин занят" });
  });

  it("auth:login — успех: сохраняет токен и логин последнего пользователя", async () => {
    m.apiClientMock.auth.login.mockResolvedValue({
      token: "jwt-token",
      message: "Вход выполнен успешно",
      user: {
        id: "u-1",
        username: "doc",
        name: "Иванов И.И.",
        organization: "Клиника",
      },
    });
    const res = await invoke("auth:login", {
      username: "doc",
      password: "secret",
    });
    expect(m.apiClientMock.auth.login).toHaveBeenCalledWith({
      username: "doc",
      password: "secret",
    });
    expect(m.apiClientMock.setToken).toHaveBeenCalledWith("jwt-token");
    expect(m.saveAuthToken).toHaveBeenCalledWith("jwt-token");
    expect(m.saveServerConfig).toHaveBeenCalledWith({
      lastLoginUsername: "doc",
    });
    expect(res).toEqual({
      success: true,
      message: "Вход выполнен успешно",
      user: {
        id: "u-1",
        username: "doc",
        name: "Иванов И.И.",
        organization: "Клиника",
      },
    });
  });

  it("auth:login — ошибка возвращает success: false", async () => {
    m.apiClientMock.auth.login.mockRejectedValue(
      new m.ApiError("Неверный пароль"),
    );
    const res = await invoke("auth:login", {
      username: "doc",
      password: "bad",
    });
    expect(res).toEqual({ success: false, message: "Неверный пароль" });
  });

  it("auth:getUser — возвращает пользователя при совпадении id", async () => {
    m.apiClientMock.auth.getMe.mockResolvedValue({
      id: "u-1",
      username: "doc",
      name: "Иванов И.И.",
      organization: null,
    });
    const res = await invoke("auth:getUser", "u-1");
    expect(res).toEqual({
      id: "u-1",
      username: "doc",
      name: "Иванов И.И.",
      organization: null,
    });
  });

  it("auth:getUser — null при несовпадении id и при ошибке", async () => {
    m.apiClientMock.auth.getMe.mockResolvedValue({
      id: "u-1",
      username: "doc",
      name: "x",
    });
    expect(await invoke("auth:getUser", "u-other")).toBeNull();
    m.apiClientMock.auth.getMe.mockRejectedValue(new Error("boom"));
    expect(await invoke("auth:getUser", "u-1")).toBeNull();
  });

  it("auth:updateUser — отклоняет, если пользователь не найден", async () => {
    m.apiClientMock.auth.getMe.mockResolvedValue({
      id: "u-1",
      username: "doc",
      name: "x",
    });
    const res = await invoke("auth:updateUser", {
      id: "u-other",
      name: "Новое",
      username: "doc",
    });
    expect(res).toEqual({ success: false, message: "Пользователь не найден" });
    expect(m.apiClientMock.auth.updateProfile).not.toHaveBeenCalled();
  });

  it("auth:updateUser — успех при совпадении id", async () => {
    m.apiClientMock.auth.getMe.mockResolvedValue({
      id: "u-1",
      username: "doc",
      name: "Старое",
    });
    m.apiClientMock.auth.updateProfile.mockResolvedValue({
      message: "Профиль обновлён",
    });
    const res = await invoke("auth:updateUser", {
      id: "u-1",
      name: "Новое",
      username: "doc",
      organization: "Клиника 2",
    });
    expect(m.apiClientMock.auth.updateProfile).toHaveBeenCalledWith({
      name: "Новое",
      username: "doc",
      organization: "Клиника 2",
    });
    expect(res).toEqual({ success: true, message: "Профиль обновлён" });
  });

  it("auth:changePassword — успех и случай «пользователь не найден»", async () => {
    m.apiClientMock.auth.getMe.mockResolvedValue({
      id: "u-1",
      username: "doc",
      name: "x",
    });
    m.apiClientMock.auth.changePassword.mockResolvedValue({
      message: "Пароль изменён",
    });
    const ok = await invoke("auth:changePassword", {
      userId: "u-1",
      currentPassword: "old",
      newPassword: "new",
    });
    expect(m.apiClientMock.auth.changePassword).toHaveBeenCalledWith({
      currentPassword: "old",
      newPassword: "new",
    });
    expect(ok).toEqual({ success: true, message: "Пароль изменён" });

    const denied = await invoke("auth:changePassword", {
      userId: "u-other",
      currentPassword: "old",
      newPassword: "new",
    });
    expect(denied).toEqual({
      success: false,
      message: "Пользователь не найден",
    });
  });
});

describe("patient-хендлеры", () => {
  it("patient:findOrCreate — успех, маппит пациента", async () => {
    m.apiClientMock.patients.findOrCreate.mockResolvedValue({
      message: "Пациент создан",
      data: { patient: patientFixture },
    });
    const res = await invoke("patient:findOrCreate", {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      dateOfBirth: "1980-01-15",
    });
    expect(m.apiClientMock.patients.findOrCreate).toHaveBeenCalledWith({
      lastName: "Иванов",
      firstName: "Иван",
      middleName: "Иванович",
      dateOfBirth: "1980-01-15",
    });
    expect(res).toEqual({
      success: true,
      message: "Пациент создан",
      patient: { ...patientFixture, middle_name: "Иванович" },
    });
  });

  it("patient:findOrCreate — ApiError возвращает success: false", async () => {
    m.apiClientMock.patients.findOrCreate.mockRejectedValue(
      new m.ApiError("Ошибка валидации"),
    );
    const res = await invoke("patient:findOrCreate", {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: null,
      dateOfBirth: "1980-01-15",
    });
    expect(res).toEqual({ success: false, message: "Ошибка валидации" });
  });

  it("patient:search — успех: список отмапплен, ошибка: []", async () => {
    m.apiClientMock.patients.search.mockResolvedValue({
      patients: [patientFixture],
      total: 1,
    });
    const res = await invoke("patient:search", "Иван", 10);
    expect(m.apiClientMock.patients.search).toHaveBeenCalledWith("Иван", 10);
    expect(res).toEqual([{ ...patientFixture, middle_name: "Иванович" }]);

    m.apiClientMock.patients.search.mockRejectedValue(new Error("network"));
    expect(await invoke("patient:search", "x")).toEqual([]);
  });

  it("patient:getAll — успех и ошибка: []", async () => {
    m.apiClientMock.patients.getAll.mockResolvedValue({
      patients: [patientFixture],
      total: 1,
    });
    const res = await invoke("patient:getAll", 20, 0);
    expect(m.apiClientMock.patients.getAll).toHaveBeenCalledWith(20, 0);
    expect(res).toEqual([{ ...patientFixture, middle_name: "Иванович" }]);

    m.apiClientMock.patients.getAll.mockRejectedValue(new Error("network"));
    expect(await invoke("patient:getAll")).toEqual([]);
  });

  it("patient:getById — успех и ошибка: undefined", async () => {
    m.apiClientMock.patients.getById.mockResolvedValue(patientFixture);
    const res = await invoke("patient:getById", "p-1");
    expect(m.apiClientMock.patients.getById).toHaveBeenCalledWith("p-1");
    expect(res).toEqual({ ...patientFixture, middle_name: "Иванович" });

    m.apiClientMock.patients.getById.mockRejectedValue(new Error("network"));
    expect(await invoke("patient:getById", "p-missing")).toBeUndefined();
  });

  it("patient:update — успех и ошибка", async () => {
    m.apiClientMock.patients.update.mockResolvedValue({
      success: true,
      message: "Обновлено",
    });
    const res = await invoke("patient:update", {
      id: "p-1",
      lastName: "Иванов",
      firstName: "Иван",
      middleName: null,
      dateOfBirth: "1980-01-15",
    });
    expect(m.apiClientMock.patients.update).toHaveBeenCalledWith("p-1", {
      lastName: "Иванов",
      firstName: "Иван",
      middleName: null,
      dateOfBirth: "1980-01-15",
    });
    expect(res).toEqual({ success: true, message: "Данные пациента обновлены" });

    m.apiClientMock.patients.update.mockRejectedValue(
      new m.ApiError("Пациент не найден"),
    );
    const bad = await invoke("patient:update", {
      id: "p-999",
      lastName: "X",
      firstName: "Y",
      middleName: null,
      dateOfBirth: "2000-01-01",
    });
    expect(bad).toEqual({ success: false, message: "Пациент не найден" });
  });

  it("patient:delete — успех и ошибка", async () => {
    m.apiClientMock.patients.delete.mockResolvedValue({
      message: "Удалено",
    });
    const res = await invoke("patient:delete", "p-1");
    expect(m.apiClientMock.patients.delete).toHaveBeenCalledWith("p-1");
    expect(res).toEqual({ success: true, message: "Удалено" });

    m.apiClientMock.patients.delete.mockRejectedValue(
      new m.ApiError("Нет прав"),
    );
    expect(await invoke("patient:delete", "p-1")).toEqual({
      success: false,
      message: "Нет прав",
    });
  });
});

describe("research-хендлеры", () => {
  it("research:create — успех и ошибка", async () => {
    m.apiClientMock.researches.create.mockResolvedValue({
      message: "Исследование создано",
      data: { researchId: "r-1" },
    });
    const res = await invoke("research:create", {
      patientId: "p-1",
      researchDate: "2026-08-23",
      paymentType: "oms",
      doctorName: "Петров",
      notes: null,
    });
    expect(m.apiClientMock.researches.create).toHaveBeenCalledWith({
      patientId: "p-1",
      researchDate: "2026-08-23",
      paymentType: "oms",
      organization: null,
      doctorName: "Петров",
      notes: null,
    });
    expect(res).toEqual({
      success: true,
      message: "Исследование создано",
      researchId: "r-1",
    });

    m.apiClientMock.researches.create.mockRejectedValue(
      new m.ApiError("Пациент не найден"),
    );
    const bad = await invoke("research:create", {
      patientId: "p-999",
      researchDate: "2026-08-23",
      paymentType: "paid",
    });
    expect(bad).toEqual({ success: false, message: "Пациент не найден" });
  });

  it("research:addStudy — успех и ошибка", async () => {
    m.apiClientMock.researches.addStudy.mockResolvedValue({
      message: "Исследование добавлено",
      data: { studyId: "s-1" },
    });
    const res = await invoke("research:addStudy", {
      researchId: "r-1",
      studyType: "obp",
      studyData: { liver: {} },
    });
    expect(m.apiClientMock.researches.addStudy).toHaveBeenCalledWith("r-1", {
      studyType: "obp",
      studyData: { liver: {} },
    });
    expect(res).toEqual({
      success: true,
      message: "Исследование добавлено",
      studyId: "s-1",
    });

    m.apiClientMock.researches.addStudy.mockRejectedValue(
      new m.ApiError("Исследование не найдено"),
    );
    expect(
      await invoke("research:addStudy", {
        researchId: "r-999",
        studyType: "obp",
        studyData: {},
      }),
    ).toEqual({ success: false, message: "Исследование не найдено" });
  });

  it("research:getById — маппит исследования, ошибка: null", async () => {
    m.apiClientMock.researches.getById.mockResolvedValue(researchFixture);
    const res = await invoke("research:getById", "r-1");
    expect(m.apiClientMock.researches.getById).toHaveBeenCalledWith("r-1");
    expect(res).toEqual({
      id: "r-1",
      patient_id: "p-1",
      research_date: "2026-08-23",
      payment_type: "oms",
      organization: undefined,
      doctor_name: "Петров",
      notes: undefined,
      created_at: "2026-01-01T00:00:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
      studies: [studyFixture],
    });

    m.apiClientMock.researches.getById.mockRejectedValue(new Error("network"));
    expect(await invoke("research:getById", "r-999")).toBeNull();
  });

  it("research:getByPatientId — список и ошибка: []", async () => {
    m.apiClientMock.researches.getByPatientId.mockResolvedValue({
      researches: [researchFixture],
      total: 1,
    });
    const res = await invoke("research:getByPatientId", "p-1", 5, 0);
    expect(m.apiClientMock.researches.getByPatientId).toHaveBeenCalledWith(
      "p-1",
      5,
      0,
    );
    expect(res).toEqual([
      {
        id: "r-1",
        patient_id: "p-1",
        research_date: "2026-08-23",
        payment_type: "oms",
        organization: undefined,
        doctor_name: "Петров",
        notes: undefined,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        studies: [studyFixture],
      },
    ]);

    m.apiClientMock.researches.getByPatientId.mockRejectedValue(
      new Error("network"),
    );
    expect(await invoke("research:getByPatientId", "p-1")).toEqual([]);
  });

  it("research:getAll — список с данными пациента и ошибка: []", async () => {
    m.apiClientMock.researches.getAll.mockResolvedValue({
      researches: [
        {
          ...researchFixture,
          patient: {
            last_name: "Иванов",
            first_name: "Иван",
            middle_name: "Иванович",
            date_of_birth: "1980-01-15",
          },
        },
      ],
      total: 1,
    });
    const res = await invoke("research:getAll", 20, 0);
    expect(m.apiClientMock.researches.getAll).toHaveBeenCalledWith(20, 0);
    expect(res).toEqual([
      {
        id: "r-1",
        patient_id: "p-1",
        research_date: "2026-08-23",
        payment_type: "oms",
        organization: undefined,
        doctor_name: "Петров",
        notes: undefined,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        last_name: "Иванов",
        first_name: "Иван",
        middle_name: "Иванович",
        date_of_birth: "1980-01-15",
        studies: [studyFixture],
      },
    ]);

    m.apiClientMock.researches.getAll.mockRejectedValue(new Error("network"));
    expect(await invoke("research:getAll")).toEqual([]);
  });

  it("research:update — успех и ошибка", async () => {
    m.apiClientMock.researches.update.mockResolvedValue({
      success: true,
    });
    const res = await invoke("research:update", {
      id: "r-1",
      researchDate: "2026-08-24",
      paymentType: "paid",
      doctorName: "Петров",
    });
    expect(m.apiClientMock.researches.update).toHaveBeenCalledWith("r-1", {
      researchDate: "2026-08-24",
      paymentType: "paid",
      doctorName: "Петров",
    });
    expect(res).toEqual({ success: true, message: "Исследование обновлено" });

    m.apiClientMock.researches.update.mockRejectedValue(
      new m.ApiError("Не найдено"),
    );
    expect(
      await invoke("research:update", {
        id: "r-999",
        researchDate: "2026-01-01",
      }),
    ).toEqual({ success: false, message: "Не найдено" });
  });

  it("research:delete — успех и ошибка", async () => {
    m.apiClientMock.researches.delete.mockResolvedValue({
      message: "Удалено",
    });
    const res = await invoke("research:delete", "r-1");
    expect(m.apiClientMock.researches.delete).toHaveBeenCalledWith("r-1");
    expect(res).toEqual({ success: true, message: "Удалено" });

    m.apiClientMock.researches.delete.mockRejectedValue(
      new m.ApiError("Нет прав"),
    );
    expect(await invoke("research:delete", "r-1")).toEqual({
      success: false,
      message: "Нет прав",
    });
  });

  it("research:search — успех и ошибка: []", async () => {
    m.apiClientMock.researches.search.mockResolvedValue({
      researches: [researchFixture],
      total: 1,
    });
    const res = await invoke("research:search", "Иванов", 10);
    expect(m.apiClientMock.researches.search).toHaveBeenCalledWith(
      "Иванов",
      10,
    );
    expect(res).toEqual([
      {
        id: "r-1",
        patient_id: "p-1",
        research_date: "2026-08-23",
        payment_type: "oms",
        organization: undefined,
        doctor_name: "Петров",
        notes: undefined,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        studies: [studyFixture],
      },
    ]);

    m.apiClientMock.researches.search.mockRejectedValue(new Error("network"));
    expect(await invoke("research:search", "x")).toEqual([]);
  });
});

describe("journal-хендлеры", () => {
  const journalEntry = {
    patient: patientFixture,
    researches: [
      {
        id: "r-1",
        patient_id: "p-1",
        research_date: "2026-08-23",
        payment_type: "oms",
        doctor_name: "Петров",
        notes: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
        study_types: ["obp"],
      },
    ],
  };

  it("journal:getByDate — маппит записи, ошибка: []", async () => {
    m.apiClientMock.journal.getByDate.mockResolvedValue([journalEntry]);
    const res = await invoke("journal:getByDate", "2026-08-23");
    expect(m.apiClientMock.journal.getByDate).toHaveBeenCalledWith(
      "2026-08-23",
    );
    expect(res).toEqual([
      {
        patient: { ...patientFixture, middle_name: "Иванович" },
        researches: [
          {
            id: "r-1",
            patient_id: "p-1",
            research_date: "2026-08-23",
            payment_type: "oms",
            doctor_name: "Петров",
            notes: undefined,
            created_at: "2026-01-01T00:00:00.000Z",
            updated_at: "2026-01-01T00:00:00.000Z",
            study_types: ["obp"],
          },
        ],
      },
    ]);

    m.apiClientMock.journal.getByDate.mockRejectedValue(new Error("network"));
    expect(await invoke("journal:getByDate", "2026-08-23")).toEqual([]);
  });

  it("journal:getByPeriod — успех и ошибка: []", async () => {
    m.apiClientMock.journal.getByPeriod.mockResolvedValue([journalEntry]);
    const res = await invoke("journal:getByPeriod", "2026-08-01", "2026-08-31");
    expect(m.apiClientMock.journal.getByPeriod).toHaveBeenCalledWith(
      "2026-08-01",
      "2026-08-31",
    );
    expect(res).toHaveLength(1);

    m.apiClientMock.journal.getByPeriod.mockRejectedValue(new Error("network"));
    expect(await invoke("journal:getByPeriod", "2026-08-01", "2026-08-31")).toEqual(
      [],
    );
  });

  it("journal:getDoctorNames — успех и ошибка: []", async () => {
    m.apiClientMock.journal.getDoctors.mockResolvedValue([
      "Петров",
      "Иванов",
    ]);
    const res = await invoke("journal:getDoctorNames");
    expect(res).toEqual(["Петров", "Иванов"]);

    m.apiClientMock.journal.getDoctors.mockRejectedValue(new Error("network"));
    expect(await invoke("journal:getDoctorNames")).toEqual([]);
  });
});

describe("protocol-хендлеры (ipc-handlers)", () => {
  it("protocol:getByResearchId — успех и ошибка: null", async () => {
    const saved = {
      researchId: "r-1",
      studies: { obp: { liver: {} } },
      printOverrides: { block_a: "текст" },
    };
    m.apiClientMock.protocol.getByResearchId.mockResolvedValue(saved);
    const res = await invoke("protocol:getByResearchId", "r-1");
    expect(m.apiClientMock.protocol.getByResearchId).toHaveBeenCalledWith("r-1");
    expect(res).toEqual(saved);

    m.apiClientMock.protocol.getByResearchId.mockRejectedValue(
      new Error("network"),
    );
    expect(await invoke("protocol:getByResearchId", "r-1")).toBeNull();
  });

  it("protocol:savePrintOverrides — успех и ошибка", async () => {
    m.apiClientMock.protocol.savePrintOverrides.mockResolvedValue({
      message: "Шаблоны сохранены.",
    });
    const res = await invoke("protocol:savePrintOverrides", {
      researchId: "r-1",
      overrides: { block_a: "текст" },
    });
    expect(m.apiClientMock.protocol.savePrintOverrides).toHaveBeenCalledWith(
      "r-1",
      { block_a: "текст" },
    );
    expect(res).toEqual({ success: true, message: "Шаблоны сохранены." });

    m.apiClientMock.protocol.savePrintOverrides.mockRejectedValue(
      new m.ApiError("Исследование не найдено"),
    );
    expect(
      await invoke("protocol:savePrintOverrides", {
        researchId: "r-999",
        overrides: {},
      }),
    ).toEqual({ success: false, message: "Исследование не найдено" });
  });
});

describe("statistics-хендлер", () => {
  it("database:getStatistics — успех и ошибка", async () => {
    const stats = { totalPatients: 10, totalResearches: 20 };
    m.apiClientMock.statistics.getStatistics.mockResolvedValue({
      success: true,
      data: stats,
    });
    const res = await invoke(
      "database:getStatistics",
      "2026-01-01",
      "2026-08-23",
      "Петров",
    );
    expect(m.apiClientMock.statistics.getStatistics).toHaveBeenCalledWith(
      "2026-01-01",
      "2026-08-23",
      "Петров",
    );
    expect(res).toEqual({ success: true, data: stats });

    m.apiClientMock.statistics.getStatistics.mockRejectedValue(
      new Error("network"),
    );
    expect(await invoke("database:getStatistics")).toEqual({
      success: false,
      message: "Ошибка при получении статистики",
    });
  });
});

describe("file/print-хендлеры", () => {
  it("file:saveHtml — без окна возвращает ошибку", async () => {
    m.handlerRegistry.clear();
    setupAuthHandlers(undefined as never);
    const res = await invoke("file:saveHtml", { content: "<p>x</p>" });
    expect(res).toEqual({
      success: false,
      message: "Окно не инициализировано",
    });
    expect(m.dialogMock.showSaveDialog).not.toHaveBeenCalled();
  });

  it("file:saveHtml — отмена диалога", async () => {
    m.dialogMock.showSaveDialog.mockResolvedValue({
      canceled: true,
      filePath: undefined,
    });
    const res = await invoke("file:saveHtml", { content: "<p>x</p>" });
    expect(res).toEqual({ success: false, canceled: true });
  });

  it("file:saveHtml — успешно записывает файл", async () => {
    const filePath = path.join(m.userDataPath.current, "out.html");
    m.dialogMock.showSaveDialog.mockResolvedValue({
      canceled: false,
      filePath,
    });
    const res = await invoke("file:saveHtml", {
      content: "<p>Привет</p>",
      defaultPath: "uzi.html",
    });
    expect(m.dialogMock.showSaveDialog).toHaveBeenCalledWith(
      mainWindow,
      expect.objectContaining({ defaultPath: "uzi.html" }),
    );
    expect(res).toEqual({ success: true, filePath });
    expect(await fs.readFile(filePath, "utf8")).toBe("<p>Привет</p>");
  });

  it("protocol:getPrinters — возвращает список принтеров", async () => {
    const res = await invoke("protocol:getPrinters");
    expect(res).toEqual({
      success: true,
      printers: [{ name: "Принтер HP", isDefault: false }],
    });
  });

  it("protocol:getPrinters — без живого окна возвращает пустой список", async () => {
    mainWindow.isDestroyed.mockReturnValue(true);
    const res = await invoke("protocol:getPrinters");
    expect(res).toEqual({ success: true, printers: [] });
  });

  it("protocol:printHtml — тихая печать проходит успешно", async () => {
    const res = await invoke("protocol:printHtml", {
      content: "<p>Протокол</p>",
      title: "Протокол УЗИ",
    });
    expect(res).toEqual({ success: true });
    expect(m.MockBrowserWindow.instances).toHaveLength(1);
    const win = m.MockBrowserWindow.instances[0];
    expect(win.loadFile).toHaveBeenCalledTimes(1);
    expect(win.setTitle).toHaveBeenCalledWith("Протокол УЗИ");
    expect(win.webContents.print).toHaveBeenCalledWith(
      expect.objectContaining({
        silent: true,
        printBackground: true,
        deviceName: "Принтер 1",
      }),
      expect.any(Function),
    );
    expect(win.close).toHaveBeenCalled();
  });

  it("protocol:printHtml — ошибка печати возвращает сообщение", async () => {
    m.printBehavior.success = false;
    m.printBehavior.reason = "Printer offline";
    const res = await invoke("protocol:printHtml", { content: "<p>x</p>" });
    expect(res).toEqual({
      success: false,
      message: "Не удалось отправить документ на печать",
    });
  });
});

describe("defaults-хендлеры", () => {
  it("defaults:load — пустой файл отдаёт {}", async () => {
    expect(await invoke("defaults:load")).toEqual({ success: true, data: {} });
  });

  it("defaults:save — сохраняет и объединяет обновления", async () => {
    await invoke("defaults:save", {
      liver: { freeFluid: "не определяется" },
    });
    expect(await invoke("defaults:load")).toEqual({
      success: true,
      data: { liver: { freeFluid: "не определяется" } },
    });

    await invoke("defaults:save", { kidney: { size: "10 см" } });
    expect(await invoke("defaults:load")).toEqual({
      success: true,
      data: {
        liver: { freeFluid: "не определяется" },
        kidney: { size: "10 см" },
      },
    });
  });

  it("defaults:reset — очищает файл", async () => {
    await invoke("defaults:save", { liver: { freeFluid: "x" } });
    await invoke("defaults:reset");
    expect(await invoke("defaults:load")).toEqual({ success: true, data: {} });
  });
});

describe("registry-хендлер", () => {
  it("registry:getAppointmentsByDate — успех и ошибка: []", async () => {
    const appointments = [
      { id: "a-1", patient_id: "p-1", appointment_date: "2026-08-23" },
    ];
    m.apiClientMock.appointments.getByDate.mockResolvedValue(appointments);
    const res = await invoke("registry:getAppointmentsByDate", "2026-08-23");
    expect(m.apiClientMock.appointments.getByDate).toHaveBeenCalledWith(
      "2026-08-23",
    );
    expect(res).toEqual(appointments);

    m.apiClientMock.appointments.getByDate.mockRejectedValue(
      new Error("network"),
    );
    expect(
      await invoke("registry:getAppointmentsByDate", "2026-08-23"),
    ).toEqual([]);
  });
});

describe("network-хендлер", () => {
  it("network:sendExport — пустой IP отклоняется без запроса", async () => {
    const mockFetch = vi.fn();
    vi.stubGlobal("fetch", mockFetch);
    const res = await invoke("network:sendExport", {
      targetIp: "  ",
      html: "<p>x</p>",
    });
    expect(res).toEqual({ success: false, message: "IP-адрес не указан" });
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("network:sendExport — успешно отправляет экспорт", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ imported: 2, skipped: 1, message: "Готово" }),
    });
    vi.stubGlobal("fetch", mockFetch);
    const res = await invoke("network:sendExport", {
      targetIp: "192.168.1.20",
      html: "<p>протокол</p>",
      fileName: "result.html",
    });
    expect(mockFetch).toHaveBeenCalledWith(
      "http://192.168.1.20:38243/receive-export",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
      }),
    );
    expect(res).toEqual({
      success: true,
      imported: 2,
      skipped: 1,
      message: "Готово",
    });
  });

  it("network:sendExport — ошибка сети возвращает понятное сообщение", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", mockFetch);
    const res = await invoke("network:sendExport", {
      targetIp: "192.168.1.20",
      html: "<p>x</p>",
    });
    expect(res).toEqual({
      success: false,
      message: "Не удалось подключиться к 192.168.1.20: fetch failed",
    });
  });
});

describe("window-хендлеры (ipcMain.on)", () => {
  it("window:focus — фокусирует и показывает окно", () => {
    invokeOn("window:focus");
    expect(mainWindow.focus).toHaveBeenCalled();
    expect(mainWindow.show).toHaveBeenCalled();
  });

  it("window:minimize — сворачивает окно", () => {
    invokeOn("window:minimize");
    expect(mainWindow.minimize).toHaveBeenCalled();
  });

  it("window:maximize — разворачивает/восстанавливает окно", () => {
    invokeOn("window:maximize");
    expect(mainWindow.maximize).toHaveBeenCalled();
    expect(mainWindow.unmaximize).not.toHaveBeenCalled();

    mainWindow.isMaximized.mockReturnValue(true);
    invokeOn("window:maximize");
    expect(mainWindow.unmaximize).toHaveBeenCalled();
  });

  it("window:close — игнорируется при уничтоженном окне", () => {
    mainWindow.isDestroyed.mockReturnValue(true);
    invokeOn("window:close");
    expect(mainWindow.close).not.toHaveBeenCalled();
  });
});
