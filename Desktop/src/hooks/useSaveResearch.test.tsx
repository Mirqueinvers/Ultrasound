import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { AuthProvider } from "@/contexts/AuthProvider";
import { useSaveResearch } from "./useSaveResearch";
import { installWindowMocks } from "@/test/mocks/electron";

// Мокаем @services, чтобы не обращаться к реальному window.*API.
vi.mock("@services", () => {
  return {
    patientService: {
      findOrCreate: vi.fn(),
      search: vi.fn(),
      getAll: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    researchService: {
      create: vi.fn(),
      addStudy: vi.fn(),
      getById: vi.fn(),
      getByPatientId: vi.fn(),
      getAll: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      search: vi.fn(),
    },
    mobileHostService: {
      isAvailable: vi.fn(() => true),
      setProfile: vi.fn(async () => {}),
      getStatus: vi.fn(),
      publishSync: vi.fn(),
    },
  };
});

import { patientService, researchService } from "@services";

type Wrapper = React.FC<{ children: React.ReactNode }>;

const wrapper: Wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

const baseParams = {
  patientFullName: "Иванов Иван Иванович",
  patientDateOfBirth: "1980-01-15",
  researchDate: "2026-01-15",
  selectedStudies: ["ОБП"],
  studiesData: { "ОБП": { freeFluid: "не определяется" } },
  onSaved: vi.fn(),
};

describe("useSaveResearch", () => {
  beforeAll(() => {
    installWindowMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(patientService.findOrCreate).mockResolvedValue({
      success: true,
      message: "ОК",
      patient: {
        id: "1",
        last_name: "Иванов",
        first_name: "Иван",
        middle_name: "Иванович",
        date_of_birth: "1980-01-15",
        created_at: "",
        updated_at: "",
      },
    });
    vi.mocked(researchService.create).mockResolvedValue({
      success: true,
      message: "ОК",
      researchId: "42",
    });
    vi.mocked(researchService.addStudy).mockResolvedValue({
      success: true,
      message: "ОК",
      studyId: "1",
    });
  });

  it("успешно сохраняет исследование и вызывает onSaved", async () => {
    const onSaved = vi.fn();
    const { result } = renderHook(
      () => useSaveResearch({ ...baseParams, onSaved }),
      { wrapper },
    );

    await act(async () => {
      await result.current.saveResearch("oms");
    });

    expect(result.current.isSavedSuccessfully).toBe(true);
    expect(result.current.saveMessage?.type).toBe("success");
    expect(result.current.saveMessage?.text).toContain("42");
    expect(onSaved).toHaveBeenCalledWith("42");
    expect(patientService.findOrCreate).toHaveBeenCalled();
    expect(researchService.create).toHaveBeenCalled();
    expect(researchService.addStudy).toHaveBeenCalledWith({
      researchId: "42",
      studyType: "ОБП",
      studyData: { freeFluid: "не определяется" },
    });
  });

  it("валидация: пустая фамилия", async () => {
    const { result } = renderHook(
      () => useSaveResearch({ ...baseParams, patientFullName: " Иван" }),
      { wrapper },
    );

    await act(async () => {
      await result.current.saveResearch("oms");
    });

    expect(result.current.saveMessage?.type).toBe("error");
    expect(result.current.saveMessage?.text).toBe("Введите фамилию пациента");
    expect(patientService.findOrCreate).not.toHaveBeenCalled();
  });

  it("валидация: пустая дата рождения", async () => {
    const { result } = renderHook(
      () => useSaveResearch({ ...baseParams, patientDateOfBirth: "" }),
      { wrapper },
    );

    await act(async () => {
      await result.current.saveResearch("oms");
    });

    expect(result.current.saveMessage?.type).toBe("error");
    expect(result.current.saveMessage?.text).toBe("Введите дату рождения");
  });

  it("валидация: нет выбранных исследований", async () => {
    const { result } = renderHook(
      () => useSaveResearch({ ...baseParams, selectedStudies: [] }),
      { wrapper },
    );

    await act(async () => {
      await result.current.saveResearch("oms");
    });

    expect(result.current.saveMessage?.type).toBe("error");
    expect(result.current.saveMessage?.text).toBe("Выберите хотя бы одно исследование");
  });

  it("ошибка сервиса при создании пациента", async () => {
    vi.mocked(patientService.findOrCreate).mockResolvedValue({
      success: false,
      message: "Ошибка",
    });
    const { result } = renderHook(() => useSaveResearch(baseParams), { wrapper });

    await act(async () => {
      await result.current.saveResearch("oms");
    });

    expect(result.current.saveMessage?.type).toBe("error");
    expect(result.current.saveMessage?.text).toBe("Ошибка при сохранении пациента");
  });

  it("ошибка сервиса при создании исследования", async () => {
    vi.mocked(researchService.create).mockResolvedValue({
      success: false,
      message: "Ошибка",
    });
    const { result } = renderHook(() => useSaveResearch(baseParams), { wrapper });

    await act(async () => {
      await result.current.saveResearch("oms");
    });

    expect(result.current.saveMessage?.type).toBe("error");
    expect(result.current.saveMessage?.text).toBe("Ошибка при создании исследования");
  });

  it("перехватывает исключение", async () => {
    vi.mocked(patientService.findOrCreate).mockRejectedValue(new Error("network"));
    const { result } = renderHook(() => useSaveResearch(baseParams), { wrapper });

    await act(async () => {
      await result.current.saveResearch("oms");
    });

    expect(result.current.saveMessage?.type).toBe("error");
    expect(result.current.isSaving).toBe(false);
  });
});