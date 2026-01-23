// ultrasound/frontend/electron/database/patientRepository.ts
import type Database from "better-sqlite3";
import type { Patient } from "./schema";

export class PatientRepository {
  constructor(private db: Database.Database) {}

  createPatient(
    lastName: string,
    firstName: string,
    middleName: string | null,
    dateOfBirth: string
  ): { success: boolean; message: string; patientId?: number } {
    try {
      const insert = this.db.prepare(
        "INSERT INTO patients (last_name, first_name, middle_name, date_of_birth) VALUES (?, ?, ?, ?)"
      );
      const result = insert.run(lastName, firstName, middleName, dateOfBirth);

      return {
        success: true,
        message: "Пациент успешно создан",
        patientId: result.lastInsertRowid as number,
      };
    } catch (error) {
      console.error("Create patient error:", error);
      return { success: false, message: "Ошибка при создании пациента" };
    }
  }

  findPatientById(id: number): Patient | undefined {
    return this.db
      .prepare("SELECT * FROM patients WHERE id = ?")
      .get(id) as Patient | undefined;
  }

  findPatientByFullNameAndDob(
    lastName: string,
    firstName: string,
    middleName: string | null,
    dateOfBirth: string
  ): Patient | undefined {
    return this.db
      .prepare(
        `
        SELECT * FROM patients
        WHERE last_name = ?
          AND first_name = ?
          AND (middle_name = ? OR (middle_name IS NULL AND ? IS NULL))
          AND date_of_birth = ?
      `
      )
      .get(lastName, firstName, middleName, middleName, dateOfBirth) as
      | Patient
      | undefined;
  }

  findOrCreatePatient(
    lastName: string,
    firstName: string,
    middleName: string | null,
    dateOfBirth: string
  ): { success: boolean; message: string; patient?: Patient } {
    try {
      const existing = this.findPatientByFullNameAndDob(
        lastName,
        firstName,
        middleName,
        dateOfBirth
      );

      if (existing) {
        return { success: true, message: "Пациент найден", patient: existing };
      }

      const result = this.createPatient(
        lastName,
        firstName,
        middleName,
        dateOfBirth
      );
      if (result.success && result.patientId) {
        const patient = this.findPatientById(result.patientId);
        return { success: true, message: "Пациент создан", patient };
      }

      return { success: false, message: "Ошибка при создании пациента" };
    } catch (error) {
      console.error("Find or create patient error:", error);
      return {
        success: false,
        message: "Ошибка при поиске/создании пациента",
      };
    }
  }

  searchPatients(query: string, limit: number = 50): Patient[] {
    const searchPattern = `%${query}%`;
    return this.db
      .prepare(
        `
        SELECT * FROM patients
        WHERE last_name LIKE ?
           OR first_name LIKE ?
           OR middle_name LIKE ?
        ORDER BY last_name, first_name
        LIMIT ?
      `
      )
      .all(searchPattern, searchPattern, searchPattern, limit) as Patient[];
  }

  getAllPatients(limit: number = 100, offset: number = 0): Patient[] {
    return this.db
      .prepare(
        `
        SELECT * FROM patients
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `
      )
      .all(limit, offset) as Patient[];
  }

  updatePatient(
    id: number,
    lastName: string,
    firstName: string,
    middleName: string | null,
    dateOfBirth: string
  ): { success: boolean; message: string } {
    try {
      const result = this.db
        .prepare(
          `
          UPDATE patients
          SET last_name = ?,
              first_name = ?,
              middle_name = ?,
              date_of_birth = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `
        )
        .run(lastName, firstName, middleName, dateOfBirth, id);

      if (result.changes > 0) {
        return { success: true, message: "Данные пациента обновлены" };
      }

      return { success: false, message: "Пациент не найден" };
    } catch (error) {
      console.error("Update patient error:", error);
      return {
        success: false,
        message: "Ошибка при обновлении данных пациента",
      };
    }
  }
}
