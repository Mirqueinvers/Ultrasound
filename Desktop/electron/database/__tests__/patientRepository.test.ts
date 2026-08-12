// @vitest-environment node
import { describe, expect, it, beforeEach } from "vitest";
import { PatientRepository } from "../patientRepository";
import {
  createInMemoryDatabase,
  createTestPatient,
} from "./helpers";
import type Database from "better-sqlite3";

describe("PatientRepository", () => {
  let db: Database.Database;
  let repo: PatientRepository;

  beforeEach(() => {
    db = createInMemoryDatabase();
    repo = new PatientRepository(db);
  });

  it("создаёт пациента", () => {
    const result = repo.createPatient("Петров", "Пётр", "Петрович", "1990-05-20");
    expect(result.success).toBe(true);
    expect(result.patientId).toBeTypeOf("number");
  });

  it("findOrCreate: создаёт при первом вызове и находит при повторном", () => {
    const first = repo.findOrCreatePatient("Иванов", "Иван", "Иванович", "1980-01-15");
    expect(first.success).toBe(true);
    expect(first.message).toBe("Пациент создан");
    const firstId = first.patient?.id;

    const second = repo.findOrCreatePatient("Иванов", "Иван", "Иванович", "1980-01-15");
    expect(second.success).toBe(true);
    expect(second.message).toBe("Пациент найден");
    expect(second.patient?.id).toBe(firstId);
  });

  it("findOrCreate: различает nullable middle_name", () => {
    repo.findOrCreatePatient("Сидоров", "Сидор", null, "1970-01-01");
    const withMiddle = repo.findOrCreatePatient("Сидоров", "Сидор", "Сидорович", "1970-01-01");
    expect(withMiddle.message).toBe("Пациент создан");
  });

  it("ищет пациентов по подстроке ФИО", () => {
    createTestPatient(db, { lastName: "Иванов" });
    createTestPatient(db, {
      lastName: "Петров",
      firstName: "Пётр",
      middleName: "Петрович",
    });

    const results = repo.searchPatients("Иван");
    expect(results).toHaveLength(1);
    expect(results[0].last_name).toBe("Иванов");
  });

  it("получает пациентов с лимитом и offset", () => {
    createTestPatient(db, { lastName: "Первый" });
    createTestPatient(db, { lastName: "Второй" });

    const all = repo.getAllPatients(10, 0);
    expect(all).toHaveLength(2);

    const limited = repo.getAllPatients(1, 0);
    expect(limited).toHaveLength(1);
  });

  it("находит пациента по id", () => {
    const id = createTestPatient(db);
    const patient = repo.findPatientById(id);
    expect(patient?.last_name).toBe("Иванов");
    expect(repo.findPatientById(9999)).toBeUndefined();
  });

  it("обновляет данные пациента", () => {
    const id = createTestPatient(db);
    const result = repo.updatePatient(id, "Нов", "Новый", null, "2000-01-01");
    expect(result.success).toBe(true);

    const updated = repo.findPatientById(id);
    expect(updated?.last_name).toBe("Нов");
  });

  it("удаляет пациента (каскадно с исследованиями)", () => {
    const id = createTestPatient(db);
    const result = repo.deletePatient(id);
    expect(result.success).toBe(true);
    expect(repo.findPatientById(id)).toBeUndefined();
  });
});