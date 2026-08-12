import { describe, expect, it } from "vitest";
import {
  normalizeEditableText,
  normalizeEditableHtml,
  hasVisibleHtmlContent,
  bodyOverrideKey,
  conclusionOverrideKey,
  recommendationOverrideKey,
} from "./printHelpers";

describe("normalizeEditableText", () => {
  it("нормализует CRLF в LF", () => {
    expect(normalizeEditableText("a\r\nb")).toBe("a\nb");
  });

  it("убирает пробелы/табы в конце строк", () => {
    expect(normalizeEditableText("a  \nb\t\nc")).toBe("a\nb\nc");
  });

  it("сжимает три и более переноса до двух", () => {
    expect(normalizeEditableText("a\n\n\n\nb")).toBe("a\n\nb");
  });

  it("обрезает пробелы по краям", () => {
    expect(normalizeEditableText("  текст  ")).toBe("текст");
  });

  it("обрабатывает undefined как пустую строку", () => {
    expect(normalizeEditableText(undefined)).toBe("");
  });
});

describe("normalizeEditableHtml", () => {
  it("нормализует CRLF и обрезает", () => {
    expect(normalizeEditableHtml("  <p>a\r\nb</p>  ")).toBe("<p>a\nb</p>");
  });
});

describe("hasVisibleHtmlContent", () => {
  it("возвращает false для пустой строки", () => {
    expect(hasVisibleHtmlContent("")).toBe(false);
    expect(hasVisibleHtmlContent("   ")).toBe(false);
  });

  it("возвращает false для HTML из одних тегов (jsdom)", () => {
    expect(hasVisibleHtmlContent("<div><span></span></div>")).toBe(false);
  });

  it("возвращает true для HTML с текстом", () => {
    expect(hasVisibleHtmlContent("<p>Текст</p>")).toBe(true);
  });

  it("обрабатывает undefined", () => {
    expect(hasVisibleHtmlContent(undefined)).toBe(false);
  });
});

describe("override keys", () => {
  it("строит ключи блоков/заключений/рекомендаций", () => {
    expect(bodyOverrideKey("obp")).toBe("block:obp");
    expect(conclusionOverrideKey("obp")).toBe("conclusion:obp");
    expect(recommendationOverrideKey("obp")).toBe("recommendation:obp");
  });
});