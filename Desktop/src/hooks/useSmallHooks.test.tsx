import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useState } from "react";
import { useFormState } from "./useFormState";
import { useFieldUpdate } from "./useFieldUpdate";
import { useListManager } from "./useListManager";

describe("useFormState", () => {
  it("возвращает начальное состояние и setter", () => {
    const { result } = renderHook(() => useFormState({ a: 1 }));
    expect(result.current[0]).toEqual({ a: 1 });

    act(() => {
      result.current[1]({ a: 2 });
    });
    expect(result.current[0]).toEqual({ a: 2 });
  });
});

describe("useFieldUpdate", () => {
  it("обновляет поле и вызывает onChange", () => {
    const onChange = vi.fn();

    const useHarness = () => {
      const [state, setState] = useState({ name: "", age: "" });
      const updateField = useFieldUpdate(state, setState, onChange);
      return { state, updateField };
    };

    const { result } = renderHook(useHarness);
    act(() => {
      result.current.updateField("name", "Иван");
    });
    expect(result.current.state.name).toBe("Иван");
    expect(onChange).toHaveBeenCalledWith({ name: "Иван", age: "" });
  });
});

describe("useListManager", () => {
  it("добавляет, обновляет и удаляет элементы списка", () => {
    const onChange = vi.fn();

    const useHarness = () => {
      const [state, setState] = useState<{
        list: { number: number; size: string }[];
      }>({
        list: [{ number: 1, size: "10" }],
      });
      const manager = useListManager(state.list, state, setState, "list", onChange);
      return { state, ...manager };
    };

    const { result } = renderHook(useHarness);

    act(() => {
      result.current.addItem({ number: 2, size: "20" });
    });
    expect(result.current.state.list).toHaveLength(2);
    expect(result.current.state.list[1].number).toBe(2);

    act(() => {
      result.current.updateItem(0, "size", "15");
    });
    expect(result.current.state.list[0].size).toBe("15");

    act(() => {
      result.current.removeItem(0);
    });
    expect(result.current.state.list).toHaveLength(1);
    expect(onChange).toHaveBeenCalled();
  });
});