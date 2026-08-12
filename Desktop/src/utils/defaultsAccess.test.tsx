import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";

// Мокаем useDefaultValues из @hooks, чтобы не поднимать весь контекст.
vi.mock("@hooks", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@hooks")>();
  return {
    ...actual,
    useDefaultValues: () => ({
      defaults: {
        "ОБП:печень": { length: "150", width: "100" },
      },
      isLoaded: true,
      error: null,
      saveDefaults: vi.fn(),
      resetDefaults: vi.fn(),
      reload: vi.fn(),
    }),
  };
});

import { useDefaultOrganValues } from "./defaultsAccess";

describe("useDefaultOrganValues", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("возвращает типизированное значение дефолта секции", () => {
    const { result } = renderHook(() => useDefaultOrganValues());
    expect(result.current.getOrgan<{ length: string }>("ОБП:печень")).toEqual({
      length: "150",
      width: "100",
    });
    expect(result.current.getOrgan("Несуществующая")).toBeNull();
  });

  it("возвращает fallback для отсутствующей секции", () => {
    const { result } = renderHook(() => useDefaultOrganValues());
    expect(result.current.getOrganOrDefault("Нет", { length: "" })).toEqual({
      length: "",
    });
    expect(
      result.current.getOrganOrDefault<{ length: string }>("ОБП:печень", {
        length: "",
      }),
    ).toEqual({ length: "150", width: "100" });
  });

  it("проверяет наличие дефолта секции", () => {
    const { result } = renderHook(() => useDefaultOrganValues());
    expect(result.current.hasOrgan("ОБП:печень")).toBe(true);
    expect(result.current.hasOrgan("Нет")).toBe(false);
  });

  it("пробрасывает isLoaded", () => {
    const { result } = renderHook(() => useDefaultOrganValues());
    expect(result.current.isLoaded).toBe(true);
  });
});