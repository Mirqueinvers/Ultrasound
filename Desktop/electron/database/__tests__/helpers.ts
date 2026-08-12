// Вспомогательный модуль для тестов репозиториев на in-memory SQLite.
// Использует better-sqlite3 с ":memory:" + initializeDatabase.
import Database from "better-sqlite3";
import { initializeDatabase } from "../initDatabase";
import { PatientRepository } from "../patientRepository";
import { ResearchRepository } from "../researchRepository";

export function createInMemoryDatabase(): Database.Database {
  const db = new Database(":memory:");
  initializeDatabase(db);
  return db;
}

/** Создаёт тестового пациента и возвращает его id. */
export function createTestPatient(
  db: Database.Database,
  overrides?: {
    lastName?: string;
    firstName?: string;
    middleName?: string | null;
    dateOfBirth?: string;
  },
): number {
  const repo = new PatientRepository(db);
  const result = repo.createPatient(
    overrides?.lastName ?? "Иванов",
    overrides?.firstName ?? "Иван",
    overrides?.middleName ?? "Иванович",
    overrides?.dateOfBirth ?? "1980-01-15",
  );
  if (!result.success || result.patientId === undefined) {
    throw new Error("Не удалось создать тестового пациента");
  }
  return result.patientId;
}

/** Создаёт тестовое исследование для пациента, возвращает id. */
export function createTestResearch(
  db: Database.Database,
  patientId: number,
  overrides?: {
    researchDate?: string;
    paymentType?: "oms" | "paid";
    organization?: string | null;
    doctorName?: string;
  },
): number {
  const repo = new ResearchRepository(db);
  const result = repo.createResearch(
    patientId,
    overrides?.researchDate ?? "2026-01-15",
    overrides?.paymentType ?? "oms",
    overrides?.organization ?? "ГБУЗ №1",
    overrides?.doctorName ?? "Иванов Иван Иванович",
    "",
  );
  if (!result.success || result.researchId === undefined) {
    throw new Error("Не удалось создать тестовое исследование");
  }
  return result.researchId;
}

/** Добавляет study к исследованию, возвращает id. */
export function createTestStudy(
  db: Database.Database,
  researchId: number,
  studyType: string,
  studyData: object,
): number {
  const repo = new ResearchRepository(db);
  const result = repo.addStudyToResearch(researchId, studyType, studyData);
  if (!result.success || result.studyId === undefined) {
    throw new Error("Не удалось добавить test study");
  }
  return result.studyId;
}