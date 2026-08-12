import { describe, expect, it } from "vitest";
import { deepMerge, mergeNodeArrays } from "./deepMerge";

describe("mergeNodeArrays", () => {
  it("мержит узлы по индексу, source-значения приоритетны", () => {
    const target = [{ number: 1, size1: "10", size2: "" }];
    const source = [{ number: 1, size1: "", size2: "20" }];
    expect(mergeNodeArrays(target, source)).toEqual([
      { number: 1, size1: "10", size2: "20" },
    ]);
  });

  it("не затирает непустые значения пустыми", () => {
    const target = [{ number: 1, size1: "10", size2: "20" }];
    const source = [{ number: 1, size1: "", size2: "" }];
    expect(mergeNodeArrays(target, source)).toEqual([
      { number: 1, size1: "10", size2: "20" },
    ]);
  });

  it("добавляет новые узлы из source, отсутствующие в target", () => {
    const target = [{ number: 1, size1: "10" }];
    const source = [{ number: 1, size1: "10" }, { number: 2, size1: "30" }];
    expect(mergeNodeArrays(target, source)).toEqual([
      { number: 1, size1: "10" },
      { number: 2, size1: "30" },
    ]);
  });

  it("обрабатывает null/не-объекты в source", () => {
    const target = [{ number: 1, size1: "10" }];
    const source = [null, { number: 2, size1: "30" }];
    expect(mergeNodeArrays(target, source)).toEqual([
      { number: 1, size1: "10" },
      { number: 2, size1: "30" },
    ]);
  });
});

describe("deepMerge", () => {
  it("возвращает target при source null/undefined", () => {
    expect(deepMerge({ a: 1 }, null)).toEqual({ a: 1 });
    expect(deepMerge({ a: 1 }, undefined)).toEqual({ a: 1 });
  });

  it("возвращает source при target null/undefined", () => {
    expect(deepMerge(null, { a: 1 })).toEqual({ a: 1 });
    expect(deepMerge(undefined, { a: 1 })).toEqual({ a: 1 });
  });

  it("возвращает source для примитивов", () => {
    expect(deepMerge({ a: 1 }, "str")).toBe("str");
    expect(deepMerge("old", "new")).toBe("new");
  });

  it("рекурсивно мержит вложенные объекты", () => {
    const target = { a: { b: 1, c: 2 }, d: 3 };
    const source = { a: { b: 10 }, d: 30 };
    expect(deepMerge(target, source)).toEqual({ a: { b: 10, c: 2 }, d: 30 });
  });

  it("заменяет массивы без поля number целиком", () => {
    const target = { list: [1, 2, 3] };
    const source = { list: [4, 5] };
    expect(deepMerge(target, source)).toEqual({ list: [4, 5] });
  });

  it("спецобработка массивов с полем number: корневой массив сливается по индексу", () => {
    const target = [{ number: 1, size1: "10" }];
    const source = [{ number: 1, size1: "", size2: "20" }];
    expect(deepMerge(target, source)).toEqual([
      { number: 1, size1: "10", size2: "20" },
    ]);
  });

  it("спецобработка массивов с полем number: вложенный массив заменяется целиком", () => {
    // ВАЖНО: deepMerge вызывает mergeNodeArrays только для корневых массивов.
    // Вложенный массив (nodesList внутри объекта) заменяется source целиком —
    // это фактическое поведение, зафиксированное тестом.
    const target = { nodesList: [{ number: 1, size1: "10" }] };
    const source = { nodesList: [{ number: 1, size1: "", size2: "20" }] };
    expect(deepMerge(target, source)).toEqual({
      nodesList: [{ number: 1, size1: "", size2: "20" }],
    });
  });

  it("игнорирует undefined в source", () => {
    const target = { a: 1, b: 2 };
    const source = { a: undefined, b: 3 };
    expect(deepMerge(target, source)).toEqual({ a: 1, b: 3 });
  });
});