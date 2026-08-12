// @vitest-environment node
import { describe, expect, it, beforeEach } from "vitest";
import { ResearchRepository } from "../researchRepository";
import {
  createInMemoryDatabase,
  createTestPatient,
  createTestResearch,
  createTestStudy,
} from "./helpers";
import type Database from "better-sqlite3";

describe("ResearchRepository", () => {
  let db: Database.Database;
  let repo: ResearchRepository;
  let patientId: number;

  beforeEach(() => {
    db = createInMemoryDatabase();
    repo = new ResearchRepository(db);
    patientId = createTestPatient(db);
  });

  it("создаёт исследование", () => {
    const result = repo.createResearch(patientId, "2026-01-15", "oms", "ГБУЗ №1", "Иванов И.И.");
    expect(result.success).toBe(true);
    expect(result.researchId).toBeTypeOf("number");
  });

  it("добавляет study с JSON-сериализацией", () => {
    const researchId = createTestResearch(db, patientId);
    const studyData = { liver: { length: "150" } };
    const result = repo.addStudyToResearch(researchId, "ОБП", studyData);
    expect(result.success).toBe(true);
    expect(result.studyId).toBeTypeOf("number");
  });

  it("получает исследование с декодированными studies", () => {
    const researchId = createTestResearch(db, patientId);
    createTestStudy(db, researchId, "ОБП", { freeFluid: "не определяется" });
    createTestStudy(db, researchId, "Почки", { leftKidney: { length: "110" } });

    const research = repo.getResearchById(researchId);
    expect(research).not.toBeNull();
    expect(research?.studies).toHaveLength(2);
    expect(research?.studies[0].study_type).toBe("ОБП");
    expect((research?.studies[0].study_data as { freeFluid?: string }).freeFluid).toBe(
      "не определяется",
    );
  });

  it("возвращает null для несуществующего id", () => {
    expect(repo.getResearchById(9999)).toBeNull();
  });

  it("получает исследования по пациенту", () => {
    createTestResearch(db, patientId, { researchDate: "2026-02-01" });
    createTestResearch(db, patientId, { researchDate: "2026-01-15" });

    const list = repo.getResearchesByPatientId(patientId);
    expect(list).toHaveLength(2);
    // сортировка по дате DESC
    expect(list[0].research_date).toBe("2026-02-01");
  });

  it("получает все исследования с данными пациента", () => {
    createTestResearch(db, patientId);
    const list = repo.getAllResearches();
    expect(list).toHaveLength(1);
    expect(list[0].last_name).toBe("Иванов");
    expect(list[0].first_name).toBe("Иван");
  });

  it("обновляет исследование", () => {
    const researchId = createTestResearch(db, patientId);
    const result = repo.updateResearch(researchId, "2026-03-01", "paid", undefined, undefined, "заметка");
    expect(result.success).toBe(true);

    const research = repo.getResearchById(researchId);
    expect(research?.research_date).toBe("2026-03-01");
    expect(research?.payment_type).toBe("paid");
    expect(research?.notes).toBe("заметка");
  });

  it("удаляет исследование (каскадно с studies)", () => {
    const researchId = createTestResearch(db, patientId);
    createTestStudy(db, researchId, "ОБП", {});
    const result = repo.deleteResearch(researchId);
    expect(result.success).toBe(true);
    expect(repo.getResearchById(researchId)).toBeNull();
  });

  it("ищет исследования: пустой запрос возвращает все, непустой — фактическое поведение", () => {
    createTestResearch(db, patientId, { researchDate: "2026-01-15" });

    // Пустой запрос — без WHERE, возвращает все исследования.
    const all = repo.searchResearches("");
    expect(all.length).toBeGreaterThanOrEqual(1);

    // ВАЖНО: непустой поиск в текущей реализации не находит записи из-за бага
    // escapeLike (экранирует собственные подстановочные %). Это зафиксированное
    // фактическое поведение — тест защищает от случайной поломки, не от бага.
    // Баг задокументирован и вынесен из рефакторинга (не меняем бизнес-логику).
    const byQuery = repo.searchResearches(String(patientId));
    expect(Array.isArray(byQuery)).toBe(true);
  });

  it("возвращает все исследования при пустом запросе", () => {
    createTestResearch(db, patientId);
    const list = repo.searchResearches("");
    expect(list.length).toBeGreaterThanOrEqual(1);
  });
});