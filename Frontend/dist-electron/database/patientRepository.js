"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PatientRepository = void 0;
class PatientRepository {
    constructor(db) {
        this.db = db;
    }
    createPatient(lastName, firstName, middleName, dateOfBirth) {
        try {
            const insert = this.db.prepare("INSERT INTO patients (last_name, first_name, middle_name, date_of_birth) VALUES (?, ?, ?, ?)");
            const result = insert.run(lastName, firstName, middleName, dateOfBirth);
            return {
                success: true,
                message: "Пациент успешно создан",
                patientId: result.lastInsertRowid,
            };
        }
        catch (error) {
            console.error("Create patient error:", error);
            return { success: false, message: "Ошибка при создании пациента" };
        }
    }
    findPatientById(id) {
        return this.db
            .prepare("SELECT * FROM patients WHERE id = ?")
            .get(id);
    }
    findPatientByFullNameAndDob(lastName, firstName, middleName, dateOfBirth) {
        return this.db
            .prepare(`
        SELECT * FROM patients
        WHERE last_name = ?
          AND first_name = ?
          AND (middle_name = ? OR (middle_name IS NULL AND ? IS NULL))
          AND date_of_birth = ?
      `)
            .get(lastName, firstName, middleName, middleName, dateOfBirth);
    }
    findOrCreatePatient(lastName, firstName, middleName, dateOfBirth) {
        try {
            const existing = this.findPatientByFullNameAndDob(lastName, firstName, middleName, dateOfBirth);
            if (existing) {
                return { success: true, message: "Пациент найден", patient: existing };
            }
            const result = this.createPatient(lastName, firstName, middleName, dateOfBirth);
            if (result.success && result.patientId) {
                const patient = this.findPatientById(result.patientId);
                return { success: true, message: "Пациент создан", patient };
            }
            return { success: false, message: "Ошибка при создании пациента" };
        }
        catch (error) {
            console.error("Find or create patient error:", error);
            return {
                success: false,
                message: "Ошибка при поиске/создании пациента",
            };
        }
    }
    searchPatients(query, limit = 50) {
        const searchPattern = `%${query}%`;
        return this.db
            .prepare(`
        SELECT * FROM patients
        WHERE last_name LIKE ?
           OR first_name LIKE ?
           OR middle_name LIKE ?
        ORDER BY last_name, first_name
        LIMIT ?
      `)
            .all(searchPattern, searchPattern, searchPattern, limit);
    }
    getAllPatients(limit = 100, offset = 0) {
        return this.db
            .prepare(`
        SELECT * FROM patients
        ORDER BY created_at DESC
        LIMIT ? OFFSET ?
      `)
            .all(limit, offset);
    }
    updatePatient(id, lastName, firstName, middleName, dateOfBirth) {
        try {
            const result = this.db
                .prepare(`
          UPDATE patients
          SET last_name = ?,
              first_name = ?,
              middle_name = ?,
              date_of_birth = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `)
                .run(lastName, firstName, middleName, dateOfBirth, id);
            if (result.changes > 0) {
                return { success: true, message: "Данные пациента обновлены" };
            }
            return { success: false, message: "Пациент не найден" };
        }
        catch (error) {
            console.error("Update patient error:", error);
            return {
                success: false,
                message: "Ошибка при обновлении данных пациента",
            };
        }
    }
}
exports.PatientRepository = PatientRepository;
