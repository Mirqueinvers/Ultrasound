import { describe, expect, it } from "vitest";
import { calculateEllipsoidVolume } from "./volume";

describe("calculateEllipsoidVolume", () => {
  it("считает объём по формуле с коэффициентом по умолчанию 0.523", () => {
    // (100 * 50 * 30 * 0.523) / 1000 = 78.45
    expect(calculateEllipsoidVolume("100", "50", "30")).toBe("78.45");
  });

  it("использует коэффициент щитовидки 0.479", () => {
    // (40 * 15 * 12 * 0.479) / 1000 = 3.4488 → 3.45
    expect(calculateEllipsoidVolume("40", "15", "12", 0.479)).toBe("3.45");
  });

  it("поддерживает precision=0 (мочевой пузырь)", () => {
    expect(calculateEllipsoidVolume("100", "80", "60", 0.523, 0)).toBe("251");
  });

  it("возвращает пустую строку для невалидных размеров", () => {
    expect(calculateEllipsoidVolume("", "50", "30")).toBe("");
    expect(calculateEllipsoidVolume("abc", "50", "30")).toBe("");
    expect(calculateEllipsoidVolume("0", "50", "30")).toBe("");
    expect(calculateEllipsoidVolume("-10", "50", "30")).toBe("");
  });

  it("возвращает пустую строку если любое из значений некорректно", () => {
    expect(calculateEllipsoidVolume("100", "", "30")).toBe("");
    expect(calculateEllipsoidVolume("100", "50", "NaN")).toBe("");
  });
});