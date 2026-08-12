// @vitest-environment node
import { describe, expect, it, beforeEach } from "vitest";
import { ProtocolRepository } from "../protocolRepository";
import {
  createInMemoryDatabase,
  createTestPatient,
  createTestResearch,
  createTestStudy,
} from "./helpers";
import type Database from "better-sqlite3";

describe("ProtocolRepository", () => {
  let db: Database.Database;
  let repo: ProtocolRepository;

  beforeEach(() => {
    db = createInMemoryDatabase();
    repo = new ProtocolRepository(db);
  });

  it("возвращает null, если исследований нет", () => {
    const patientId = createTestPatient(db);
    const researchId = createTestResearch(db, patientId);
    expect(repo.getByResearchId(researchId)).toBeNull();
  });

  it("получает протокол с декодированными studies и пустыми overrides", () => {
    const patientId = createTestPatient(db);
    const researchId = createTestResearch(db, patientId);
    createTestStudy(db, researchId, "ОБП", { freeFluid: "не определяется" });

    const protocol = repo.getByResearchId(researchId);
    expect(protocol).not.toBeNull();
    expect(protocol?.researchId).toBe(researchId);
    expect(protocol?.studies["ОБП"]).toEqual({ freeFluid: "не определяется" });
    expect(protocol?.printOverrides).toEqual({});
  });

  it("обрабатывает повреждённый JSON в study_data", () => {
    const patientId = createTestPatient(db);
    const researchId = createTestResearch(db, patientId);

    db.prepare(
      "INSERT INTO research_studies (research_id, study_type, study_data) VALUES (?, ?, ?)",
    ).run(researchId, "Почки", "{broken json");

    const protocol = repo.getByResearchId(researchId);
    expect(protocol?.studies["Почки"]).toBeNull();
  });

  it("сохраняет переопределения печатных блоков", () => {
    const patientId = createTestPatient(db);
    const researchId = createTestResearch(db, patientId);
    createTestStudy(db, researchId, "ОБП", {});

    const result = repo.savePrintOverrides(researchId, {
      "block:obp": "<p>Данные</p>",
      "conclusion:ОБП": "Заключение",
    });
    expect(result.success).toBe(true);

    const protocol = repo.getByResearchId(researchId);
    expect(protocol?.printOverrides["block:obp"]).toBe("<p>Данные</p>");
    expect(protocol?.printOverrides["conclusion:ОБП"]).toBe("Заключение");
  });

  it("заменяет переопределения при повторном сохранении", () => {
    const patientId = createTestPatient(db);
    const researchId = createTestResearch(db, patientId);
    createTestStudy(db, researchId, "ОБП", {});

    repo.savePrintOverrides(researchId, { "block:obp": "Старое" });
    repo.savePrintOverrides(researchId, { "block:obp": "Новое" });

    const protocol = repo.getByResearchId(researchId);
    expect(protocol?.printOverrides).toEqual({ "block:obp": "Новое" });
  });

  it("игнорирует пустые ключи блоков", () => {
    const patientId = createTestPatient(db);
    const researchId = createTestResearch(db, patientId);
    createTestStudy(db, researchId, "ОБП", {});

    repo.savePrintOverrides(researchId, {
      "": "Пустой ключ",
      "  ": "Пробелы",
      "block:obp": "Валидный",
    });

    const protocol = repo.getByResearchId(researchId);
    expect(protocol?.printOverrides).toEqual({ "block:obp": "Валидный" });
  });
});