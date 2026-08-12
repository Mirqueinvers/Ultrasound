import { describe, expect, it, vi, beforeEach, beforeAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePrintableOverrides } from "./usePrintableOverrides";
import { installWindowMocks } from "@/test/mocks/electron";
import {
  bodyOverrideKey,
  conclusionOverrideKey,
  recommendationOverrideKey,
} from "@/utils/printHelpers";

vi.mock("@services", () => {
  return {
    protocolService: {
      getPrinters: vi.fn(),
      getByResearchId: vi.fn(),
      printHtml: vi.fn(),
      savePrintOverrides: vi.fn(),
    },
  };
});

import { protocolService } from "@services";

const studyDefs = [{ id: "obp", key: "ОБП" }];

const baseOptions = {
  sourceOverrides: {},
  setSourceOverrides: vi.fn(),
  buildDraftOverrides: vi.fn((base: Record<string, string>) => ({
    ...base,
    [bodyOverrideKey("obp")]: "<p>Текст</p>",
    [conclusionOverrideKey("ОБП")]: "Заключение",
    [recommendationOverrideKey("ОБП")]: "Рекомендации",
  })),
  studyDefinitions: studyDefs,
  researchId: 1,
  onSave: vi.fn(),
};

describe("usePrintableOverrides", () => {
  beforeAll(() => {
    installWindowMocks();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(protocolService.savePrintOverrides).mockResolvedValue({
      success: true,
      message: "Сохранено",
    });
    vi.mocked(baseOptions.setSourceOverrides).mockClear();
    vi.mocked(baseOptions.onSave).mockClear();
  });

  it("handleStartEditing: включает режим и строит черновик из source", () => {
    const { result } = renderHook(() =>
      usePrintableOverrides({
        ...baseOptions,
        sourceOverrides: {},
      }),
    );

    act(() => {
      result.current.handleStartEditing();
    });

    expect(result.current.isEditMode).toBe(true);
    expect(result.current.draftOverrides).toEqual({
      [bodyOverrideKey("obp")]: "<p>Текст</p>",
      [conclusionOverrideKey("ОБП")]: "Заключение",
      [recommendationOverrideKey("ОБП")]: "Рекомендации",
    });
  });

  it("handleSaveOverrides: сохраняет переопределения в БД, обновляет source и вызывает onSave", async () => {
    const setSourceOverrides = vi.fn();
    const onSave = vi.fn();

    const useHarness = () => {
      const h = usePrintableOverrides({
        ...baseOptions,
        setSourceOverrides,
        onSave,
        sourceOverrides: {},
      });
      return h;
    };

    const { result } = renderHook(useHarness);

    // Сначала handleStartEditing: setState → перерендер hook'а с заполненным черновиком.
    act(() => {
      result.current.handleStartEditing();
    });
    expect(result.current.isEditMode).toBe(true);

    // Затем handleSaveOverrides из актуального рендера (draftOverrides заполнен).
    await act(async () => {
      await result.current.handleSaveOverrides();
    });

    expect(protocolService.savePrintOverrides).toHaveBeenCalledWith({
      researchId: 1,
      overrides: expect.objectContaining({
        [bodyOverrideKey("obp")]: "<p>Текст</p>",
        [conclusionOverrideKey("ОБП")]: "Заключение",
        [recommendationOverrideKey("ОБП")]: "Рекомендации",
      }),
    });
    expect(setSourceOverrides).toHaveBeenCalled();
    expect(result.current.isEditMode).toBe(false);
    expect(onSave).toHaveBeenCalled();
  });

  it("handleSaveOverrides: не сохраняет в БД без researchId", async () => {
    const { result } = renderHook(() =>
      usePrintableOverrides({
        ...baseOptions,
        researchId: null,
      }),
    );

    await act(async () => {
      result.current.handleStartEditing();
      await result.current.handleSaveOverrides();
    });

    expect(protocolService.savePrintOverrides).not.toHaveBeenCalled();
  });

  it("requireSaveSuccess=true: при ошибке БД не завершает редактирование", async () => {
    vi.mocked(protocolService.savePrintOverrides).mockResolvedValue({
      success: false,
      message: "Ошибка",
    });

    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    const { result } = renderHook(() =>
      usePrintableOverrides({
        ...baseOptions,
        requireSaveSuccess: true,
      }),
    );

    await act(async () => {
      result.current.handleStartEditing();
      await result.current.handleSaveOverrides();
    });

    expect(alertSpy).toHaveBeenCalled();
    expect(result.current.isEditMode).toBe(true);

    alertSpy.mockRestore();
  });
});