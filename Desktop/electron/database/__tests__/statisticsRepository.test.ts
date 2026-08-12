// @vitest-environment node
import { describe, expect, it, beforeEach } from "vitest";
import { StatisticsRepository } from "../statisticsRepository";
import {
  createInMemoryDatabase,
  createTestPatient,
  createTestResearch,
  createTestStudy,
} from "./helpers";
import type Database from "better-sqlite3";

describe("StatisticsRepository", () => {
  let db: Database.Database;
  let repo: StatisticsRepository;

  beforeEach(() => {
    db = createInMemoryDatabase();
    repo = new StatisticsRepository(db);
  });

  it("возвращает нулевую статистику для пустой БД", () => {
    const stats = repo.getStatistics();
    expect(stats.totalPatients).toBe(0);
    expect(stats.totalResearches).toBe(0);
    expect(stats.totalStudies).toBe(0);
    expect(stats.paymentStats).toEqual({ oms: 0, paid: 0 });
    expect(stats.studiesByType).toEqual({});
    expect(stats.doctorsStats).toEqual([]);
  });

  it("считает общие показатели", () => {
    const patientId = createTestPatient(db);
    const researchId = createTestResearch(db, patientId, { paymentType: "oms" });
    createTestStudy(db, researchId, "ОБП", {});

    const stats = repo.getStatistics();
    expect(stats.totalPatients).toBe(1);
    expect(stats.totalResearches).toBe(1);
    expect(stats.totalStudies).toBe(1);
  });

  it("считает статистику за период с фильтром по врачу", () => {
    const p1 = createTestPatient(db, { lastName: "Первый" });
    const p2 = createTestPatient(db, { lastName: "Второй" });
    const r1 = createTestResearch(db, p1, {
      researchDate: "2026-01-15",
      paymentType: "oms",
      doctorName: "Иванов И.И.",
    });
    createTestStudy(db, r1, "ОБП", {});

    const r2 = createTestResearch(db, p2, {
      researchDate: "2026-02-20",
      paymentType: "paid",
      doctorName: "Петров П.П.",
    });
    createTestStudy(db, r2, "Щитовидная железа", {});

    // Период только по Иванову
    const stats = repo.getStatistics("2026-01-01", "2026-01-31", "Иванов И.И.");
    expect(stats.researchesInPeriod).toBe(1);
    expect(stats.patientsInPeriod).toBe(1);
    expect(stats.studiesInPeriod).toBe(1);
    expect(stats.paymentStats.oms).toBe(1);
    expect(stats.paymentStats.paid).toBe(0);

    // Весь период — оба
    const all = repo.getStatistics("2026-01-01", "2026-02-28");
    expect(all.totalResearches).toBe(2);
    expect(all.paymentStats.paid).toBe(1);
  });

  it("считает исследования по типам (OMS) и платные детали (PAID)", () => {
    const patientId = createTestPatient(db);
    const r1 = createTestResearch(db, patientId, { paymentType: "oms" });
    createTestStudy(db, r1, "ОБП", {});
    const r2 = createTestResearch(db, patientId, { paymentType: "oms" });
    createTestStudy(db, r2, "Почки", {});
    const r3 = createTestResearch(db, patientId, { paymentType: "paid" });
    createTestStudy(db, r3, "Щитовидная железа", {});

    const stats = repo.getStatistics();
    expect(stats.studiesByType["ОБП"]).toBe(1);
    expect(stats.studiesByType["Почки"]).toBe(1);
    // studiesByType считает только OMS
    expect(stats.studiesByType["Щитовидная железа"]).toBeUndefined();

    expect(stats.paidStudiesDetail).toContainEqual({
      studyType: "Щитовидная железа",
      count: 1,
    });
  });

  it("формирует статистику по врачам", () => {
    const p = createTestPatient(db);
    const r = createTestResearch(db, p, { doctorName: "Иванов И.И." });
    createTestStudy(db, r, "ОБП", {});

    const stats = repo.getStatistics();
    expect(stats.doctorsStats).toHaveLength(1);
    expect(stats.doctorsStats[0].doctorName).toBe("Иванов И.И.");
    expect(stats.doctorsStats[0].patientCount).toBe(1);
    expect(stats.doctorsStats[0].researchCount).toBe(1);
  });

  it("возвращает актуальную активность (recentActivity)", () => {
    const p = createTestPatient(db, { lastName: "Иванов" });
    const r = createTestResearch(db, p, { researchDate: "2026-01-15" });
    createTestStudy(db, r, "ОБП", {});

    const stats = repo.getStatistics("2026-01-01", "2026-01-31");
    expect(stats.recentActivity).toHaveLength(1);
    expect(stats.recentActivity[0].patientName).toBe("Иванов Иван Иванович");
  });
});