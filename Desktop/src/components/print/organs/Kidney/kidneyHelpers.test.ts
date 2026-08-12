import { describe, expect, it } from "vitest";
import { buildKidneyText } from "./kidneyHelpers";
import type { KidneyProtocol } from "@types";

const baseKidney = {
  position: "обычное",
  positionText: "",
  length: "110",
  width: "50",
  thickness: "40",
  contour: "ровный",
  parenchymaSize: "20",
  parenchymaEchogenicity: "не изменена",
  parenchymaStructure: "однородная",
  parenchymaConcrements: "",
  parenchymaConcrementslist: [],
  parenchymaCysts: "",
  parenchymaCystslist: [],
  parenchymaMultipleCysts: false,
  parenchymaMultipleCystsSize: "",
  parenchymaPathologicalFormations: "",
  parenchymaPathologicalFormationsText: "",
  pcsSize: "не расширена",
  pcsMicroliths: "",
  pcsMicrolithsSize: "",
  pcsConcrements: "",
  pcsConcrementslist: [],
  pcsCysts: "",
  pcsCystslist: [],
  pcsMultipleCysts: false,
  pcsMultipleCystsSize: "",
  pcsPathologicalFormations: "",
  pcsPathologicalFormationsText: "",
  sinus: "без включений",
  adrenalArea: "не изменена",
  adrenalAreaText: "",
  additional: "",
} as KidneyProtocol;

describe("buildKidneyText", () => {
  it("возвращает null для пустого протокола", () => {
    expect(buildKidneyText("Правая почка", {} as KidneyProtocol)).toBeNull();
  });

  it("строит полный текст для обычного положения", () => {
    const text = buildKidneyText("Правая почка", baseKidney);
    expect(text).toContain("Правая почка: ");
    expect(text).toContain("определяется в обычном положении.");
    expect(text).toContain("Размерами: длина 110 мм, ширина 50 мм, толщина 40 мм, толщина паренхимы 20 мм.");
    expect(text).toContain("Контур почки ровный.");
    expect(text).toContain("Эхогенность паренхимы не изменена, структура однородная.");
    expect(text).toContain("Чашечно-лоханочная система не расширена.");
    expect(text).toContain("Почечный синус не изменен.");
    expect(text).toContain("Область надпочечников не изменена.");
  });

  it("строит текст при опущении с указанной позицией", () => {
    const text = buildKidneyText("Левая почка", {
      ...baseKidney,
      position: "опущение",
      positionText: "ниже на 3 см",
    });
    expect(text).toContain("Ниже на 3 см.");
  });

  it("строит текст для нефрэктомии", () => {
    const text = buildKidneyText("Правая почка", {
      ...baseKidney,
      position: "нефрэктомия",
      positionText: "",
    });
    expect(text).toContain("Нефрэктомия.");
  });

  it("строит фразу для одного конкремента", () => {
    const text = buildKidneyText("Правая почка", {
      ...baseKidney,
      parenchymaConcrements: "определяются",
      parenchymaConcrementslist: [{ size: "7", location: "центральной части" }],
    });
    // Для единичного образования buildFormationPhrase не выводит число "1".
    expect(text).toContain(
      "В паренхиме, в центральной части определяется гиперэхогенное образование с акустической тенью размерами 7 мм",
    );
  });

  it("строит фразу для нескольких конкрементов (2–4)", () => {
    const text = buildKidneyText("Правая почка", {
      ...baseKidney,
      parenchymaConcrements: "определяются",
      parenchymaConcrementslist: [
        { size: "7", location: "центральной части" },
        { size: "5", location: "центральной части" },
      ],
    });
    expect(text).toContain("2 гиперэхогенных образования с акустической тенью");
  });

  it("строит фразу для 5+ конкрементов", () => {
    const text = buildKidneyText("Правая почка", {
      ...baseKidney,
      parenchymaConcrements: "определяются",
      parenchymaConcrementslist: [
        { size: "7", location: "центральной части" },
        { size: "5", location: "центральной части" },
        { size: "6", location: "центральной части" },
        { size: "4", location: "центральной части" },
        { size: "3", location: "центральной части" },
      ],
    });
    expect(text).toContain("5 гиперэхогенных образований с акустической тенью");
  });

  it("строит фразу для множественных кист с размером", () => {
    const text = buildKidneyText("Правая почка", {
      ...baseKidney,
      parenchymaCysts: "определяются",
      parenchymaMultipleCysts: true,
      parenchymaMultipleCystsSize: "10",
    });
    expect(text).toContain("В паренхиме определяются множественные гиперэхогенные образования размерами до 10 мм");
  });

  it("строит фразу для микролитов ЧЛС и конкрементов", () => {
    const text = buildKidneyText("Правая почка", {
      ...baseKidney,
      pcsMicroliths: "определяются",
      pcsMicrolithsSize: "3",
      pcsConcrements: "определяются",
      pcsConcrementslist: [{ size: "8", location: "" }],
    });
    // Единичный конкремент ЧЛС без локации — без числа и без префикса "конкременты в...".
    expect(text).toContain(
      "В чашечно-лоханочной системе определяются микролиты, размерами до 3 мм. определяется гиперэхогенное образование с акустической тенью размерами 8 мм",
    );
  });

  it("строит текст для синуса с включениями", () => {
    const text = buildKidneyText("Правая почка", {
      ...baseKidney,
      sinus: "с включениями",
    });
    expect(text).toContain("Синус повышенной эхогенности, с гиперэхогенными включениями.");
  });

  it("добавляет additional-текст", () => {
    const text = buildKidneyText("Правая почка", {
      ...baseKidney,
      additional: "Дополнительная находка",
    });
    expect(text).toContain("Дополнительная находка.");
  });
});