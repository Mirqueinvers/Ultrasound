import { describe, expect, it } from "vitest";
import { normalizeSelectValue, isNormalizedMatch } from "./normalizeSelectValue";

describe("normalizeSelectValue", () => {
  it("приводит к нижнему регистру и обрезает пробелы", () => {
    expect(normalizeSelectValue("  Обычное  ")).toBe("обычное");
  });

  it("заменяет ё на е", () => {
    expect(normalizeSelectValue("Ёлка подъём")).toBe("елкаподъем");
  });

  it("удаляет пробелы и запятые", () => {
    expect(normalizeSelectValue("не определяется, в области")).toBe("неопределяетсявобласти");
  });

  it("обрабатывает null и undefined", () => {
    expect(normalizeSelectValue(null)).toBe("");
    expect(normalizeSelectValue(undefined)).toBe("");
  });

  it("возвращает пустую строку для пустой строки", () => {
    expect(normalizeSelectValue("")).toBe("");
  });
});

describe("isNormalizedMatch", () => {
  it("сравнивает нормализованные значения", () => {
    expect(isNormalizedMatch("Обычное", "обычное")).toBe(true);
    expect(isNormalizedMatch("Подъём", "подъем")).toBe(true);
    expect(isNormalizedMatch("а, б", "аб")).toBe(true);
    expect(isNormalizedMatch("одно", "другое")).toBe(false);
  });

  it("сравнивает null с пустой строкой через normalizeSelectValue", () => {
    expect(isNormalizedMatch(normalizeSelectValue(null), "")).toBe(true);
    expect(isNormalizedMatch(normalizeSelectValue(undefined), "")).toBe(true);
  });
});