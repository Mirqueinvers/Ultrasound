// @vitest-environment node
import { describe, expect, it, beforeEach } from "vitest";
import { JournalRepository } from "../journalRepository";
import {
  createInMemoryDatabase,
  createTestPatient,
  createTestResearch,
  createTestStudy,
} from "./helpers";
import type Database from "better-sqlite3";

describe("JournalRepository", () => {
  let db: Database.Database;
  let repo: JournalRepository;

  beforeEach(() => {
    db = createInMemoryDatabase();
    repo = new JournalRepository(db);
  });

  it("получает записи журнала по дате", () => {
    const patientId = createTestPatient(db);
    const researchId = createTestResearch(db, patientId, {
      researchDate: "2026-01-15",
      doctorName: "Иванов Иван Иванович",
    });
    createTestStudy(db, researchId, "ОБП", {});

    const entries = repo.getJournalByDate("2026-01-15");
    expect(entries).toHaveLength(1);
    expect(entries[0].patient.last_name).toBe("Иванов");
    expect(entries[0].researches).toHaveLength(1);
    expect(entries[0].researches[0].study_types).toEqual(["ОБП"]);
  });

  it("не возвращает записи для пустой даты", () => {
    createTestPatient(db);
    const entries = repo.getJournalByDate("2025-01-01");
    expect(entries).toHaveLength(0);
  });

  it("получает записи за период и агрегирует по пациентам", () => {
    const patientId = createTestPatient(db, { lastName: "Первый" });
    createTestResearch(db, patientId, { researchDate: "2026-01-10" });
    createTestResearch(db, patientId, { researchDate: "2026-01-20" });

    const patientId2 = createTestPatient(db, { lastName: "Второй" });
    createTestResearch(db, patientId2, { researchDate: "2026-02-05" });

    const entries = repo.getJournalByPeriod("2026-01-01", "2026-01-31");
    expect(entries).toHaveLength(1);
    expect(entries[0].researches).toHaveLength(2);

    const all = repo.getJournalByPeriod("2026-01-01", "2026-02-28");
    expect(all).toHaveLength(2);
  });

  it("получает уникальные имена врачей без дублей и пустых", () => {
    const p1 = createTestPatient(db, { lastName: "Один" });
    const p2 = createTestPatient(db, { lastName: "Два" });
    createTestResearch(db, p1, { doctorName: "Иванов И.И." });
    createTestResearch(db, p2, { doctorName: "Иванов И.И." });
    createTestResearch(db, p1, { doctorName: "Петров П.П." });
    // врач не указан (пустая строка → NULL) — должен быть пропущен
    createTestResearch(db, p1, { doctorName: "" });

    const doctors = repo.getDoctorNames();
    expect(doctors).toContain("Иванов И.И.");
    expect(doctors).toContain("Петров П.П.");
    expect(doctors).toHaveLength(2);
  });
});