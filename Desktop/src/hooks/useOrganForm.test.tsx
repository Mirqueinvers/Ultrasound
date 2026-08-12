import { describe, expect, it, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useOrganForm } from "./useOrganForm";

interface TestForm {
  name: string;
  size: string;
  nodesList?: { number: number; size1: string }[];
}

const defaults: TestForm = {
  name: "",
  size: "",
  nodesList: [],
};

describe("useOrganForm", () => {
  it("инициализирует форму дефолтами при отсутствии value", () => {
    const { result } = renderHook(() =>
      useOrganForm<TestForm>({
        value: undefined,
        defaults,
        organKey: null,
      }),
    );
    expect(result.current.form).toEqual(defaults);
  });

  it("инициализирует форму из value (mergeValue = defaults + value)", () => {
    const { result } = renderHook(() =>
      useOrganForm<TestForm>({
        value: { name: "Печень", size: "" },
        defaults,
        organKey: null,
      }),
    );
    expect(result.current.form.name).toBe("Печень");
    expect(result.current.form.size).toBe("");
  });

  it("updateField: обновляет поле и вызывает onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useOrganForm<TestForm>({
        value: undefined,
        defaults,
        organKey: null,
        onChange,
      }),
    );

    act(() => {
      result.current.updateField("size", "150");
    });
    expect(result.current.form.size).toBe("150");
    expect(onChange).toHaveBeenCalledWith({ name: "", size: "150", nodesList: [] });
  });

  it("commit: заменяет форму целиком и вызывает onChange", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() =>
      useOrganForm<TestForm>({
        value: undefined,
        defaults,
        organKey: null,
        onChange,
      }),
    );

    const draft: TestForm = { name: "Селезёнка", size: "90" };
    act(() => {
      result.current.commit(draft);
    });
    expect(result.current.form).toEqual(draft);
    expect(onChange).toHaveBeenCalledWith(draft);
  });

  it("синхронизирует форму при изменении value (rerender)", () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: TestForm | null }) =>
        useOrganForm<TestForm>({
          value,
          defaults,
          organKey: null,
        }),
      { initialProps: { value: { name: "Один", size: "10" } } },
    );
    expect(result.current.form.name).toBe("Один");

    rerender({ value: { name: "Два", size: "20" } });
    expect(result.current.form.name).toBe("Два");
    expect(result.current.form.size).toBe("20");
  });

  it("mergeValue: объединяет дефолты с value и mergeLists", () => {
    const { result } = renderHook(() =>
      useOrganForm<TestForm>({
        value: { name: "Орган", size: "" },
        defaults,
        organKey: null,
        mergeLists: () => ({ nodesList: [{ number: 1, size1: "5" }] }),
      }),
    );
    expect(result.current.mergeValue(undefined)).toEqual({
      name: "",
      size: "",
      nodesList: [{ number: 1, size1: "5" }],
    });
  });

  it("подписывается на useConclusion и добавляет текст в conclusion (organKey)", () => {
    const { result } = renderHook(() =>
      useOrganForm<TestForm & { conclusion?: string }>({
        value: undefined,
        defaults: { ...defaults, conclusion: "" },
        organKey: "organ-1",
      }),
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent("add-conclusion-text", {
          detail: { text: "Текст заключения", organ: "organ-1" },
        }),
      );
    });
    expect((result.current.form as TestForm & { conclusion?: string }).conclusion).toBe(
      "Текст заключения",
    );
  });

  it("не подписывается при organKey=null", () => {
    const { result } = renderHook(() =>
      useOrganForm<TestForm & { conclusion?: string }>({
        value: undefined,
        defaults: { ...defaults, conclusion: "" },
        organKey: null,
      }),
    );

    act(() => {
      window.dispatchEvent(
        new CustomEvent("add-conclusion-text", {
          detail: { text: "Игнор", organ: "organ-1" },
        }),
      );
    });
    expect((result.current.form as TestForm & { conclusion?: string }).conclusion).toBe(
      "",
    );
  });
});