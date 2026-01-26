"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchRepository = void 0;
class ResearchRepository {
    constructor(db) {
        this.db = db;
    }
    createResearch(patientId, researchDate, paymentType, organization, // добавлено из профиля пользователя
    doctorName, notes) {
        try {
            const insert = this.db.prepare("INSERT INTO researches (patient_id, research_date, payment_type, organization, doctor_name, notes) VALUES (?, ?, ?, ?, ?, ?)");
            const result = insert.run(patientId, researchDate, paymentType, organization, doctorName || null, notes || null);
            return {
                success: true,
                message: "Исследование создано",
                researchId: result.lastInsertRowid,
            };
        }
        catch (error) {
            console.error("Create research error:", error);
            return { success: false, message: "Ошибка при создании исследования" };
        }
    }
    addStudyToResearch(researchId, studyType, studyData) {
        try {
            const insert = this.db.prepare("INSERT INTO research_studies (research_id, study_type, study_data) VALUES (?, ?, ?)");
            const result = insert.run(researchId, studyType, JSON.stringify(studyData));
            return {
                success: true,
                message: "Исследование добавлено",
                studyId: result.lastInsertRowid,
            };
        }
        catch (error) {
            console.error("Add study error:", error);
            return {
                success: false,
                message: "Ошибка при добавлении исследования",
            };
        }
    }
    getResearchById(id) {
        const research = this.db
            .prepare("SELECT * FROM researches WHERE id = ?")
            .get(id);
        if (!research)
            return null;
        const studies = this.db
            .prepare("SELECT * FROM research_studies WHERE research_id = ?")
            .all(id);
        return {
            ...research,
            studies: studies.map((study) => ({
                ...study,
                study_data: JSON.parse(study.study_data),
            })),
        };
    }
    getResearchesByPatientId(patientId, limit = 50, offset = 0) {
        const researches = this.db
            .prepare(`
        SELECT * FROM researches
        WHERE patient_id = ?
        ORDER BY research_date DESC, created_at DESC
        LIMIT ? OFFSET ?
      `)
            .all(patientId, limit, offset);
        return researches.map((research) => {
            const studies = this.db
                .prepare("SELECT * FROM research_studies WHERE research_id = ?")
                .all(research.id);
            return {
                ...research,
                studies: studies.map((study) => ({
                    ...study,
                    study_data: JSON.parse(study.study_data),
                })),
            };
        });
    }
    getAllResearches(limit = 100, offset = 0) {
        const researches = this.db
            .prepare(`
        SELECT
          r.*,
          p.last_name,
          p.first_name,
          p.middle_name,
          p.date_of_birth
        FROM researches r
        JOIN patients p ON r.patient_id = p.id
        ORDER BY r.research_date DESC, r.created_at DESC
        LIMIT ? OFFSET ?
      `)
            .all(limit, offset);
        return researches.map((research) => {
            const studies = this.db
                .prepare("SELECT * FROM research_studies WHERE research_id = ?")
                .all(research.id);
            return {
                ...research,
                studies: studies.map((study) => ({
                    ...study,
                    study_data: JSON.parse(study.study_data),
                })),
            };
        });
    }
    updateResearch(id, researchDate, paymentType, organization, // добавлено
    doctorName, notes) {
        try {
            const fields = [];
            const values = [];
            if (researchDate !== undefined) {
                fields.push("research_date = ?");
                values.push(researchDate);
            }
            if (paymentType !== undefined) {
                fields.push("payment_type = ?");
                values.push(paymentType);
            }
            if (organization !== undefined) {
                fields.push("organization = ?");
                values.push(organization);
            }
            if (doctorName !== undefined) {
                fields.push("doctor_name = ?");
                values.push(doctorName);
            }
            if (notes !== undefined) {
                fields.push("notes = ?");
                values.push(notes);
            }
            if (fields.length === 0) {
                return { success: false, message: "Нет данных для обновления" };
            }
            fields.push("updated_at = CURRENT_TIMESTAMP");
            values.push(id);
            const result = this.db
                .prepare(`UPDATE researches SET ${fields.join(", ")} WHERE id = ?`)
                .run(...values);
            if (result.changes > 0) {
                return { success: true, message: "Исследование обновлено" };
            }
            return { success: false, message: "Исследование не найдено" };
        }
        catch (error) {
            console.error("Update research error:", error);
            return {
                success: false,
                message: "Ошибка при обновлении исследования",
            };
        }
    }
    deleteResearch(id) {
        try {
            const result = this.db
                .prepare("DELETE FROM researches WHERE id = ?")
                .run(id);
            if (result.changes > 0) {
                return { success: true, message: "Исследование удалено" };
            }
            return { success: false, message: "Исследование не найдено" };
        }
        catch (error) {
            console.error("Delete research error:", error);
            return {
                success: false,
                message: "Ошибка при удалении исследования",
            };
        }
    }
    // Поиск исследований с поддержкой кода вида "кдю12101990"
    searchResearches(query, limit = 50) {
        const raw = query.trim().toLowerCase();
        // кодовый вариант: кдю12101990
        const normalizedCode = raw
            .replace(/\s+/g, "")
            .replace(/ё/g, "е")
            .replace(/[^0-9а-я]/g, "");
        const researches = this.db
            .prepare(`
        SELECT
          r.*,
          p.last_name,
          p.first_name,
          p.middle_name,
          p.date_of_birth
        FROM researches r
        JOIN patients p ON r.patient_id = p.id
        ORDER BY r.research_date DESC, r.created_at DESC
        LIMIT ?
      `)
            .all(limit);
        const withStudies = researches.map((research) => {
            const studies = this.db
                .prepare("SELECT * FROM research_studies WHERE research_id = ?")
                .all(research.id);
            return {
                ...research,
                studies: studies.map((study) => ({
                    ...study,
                    study_data: JSON.parse(study.study_data),
                })),
            };
        });
        // если пустой запрос — возвращаем всё
        if (!raw)
            return withStudies;
        return withStudies.filter((r) => {
            const fio = `${r.last_name} ${r.first_name} ${r.middle_name ?? ""}`.toLowerCase();
            const dob = (r.date_of_birth || "").toLowerCase();
            const researchDate = (r.research_date || "").toLowerCase();
            const idStr = String(r.patient_id).toLowerCase();
            // обычный текстовый поиск (без учёта регистра)
            const textMatch = fio.includes(raw) ||
                dob.includes(raw) ||
                researchDate.includes(raw) ||
                idStr.includes(raw);
            // код вида кдю12101990
            const code = (r.last_name[0] || "") +
                (r.first_name[0] || "") +
                ((r.middle_name || "")[0] || "") +
                (r.date_of_birth || "").replace(/\D/g, "");
            const normalizedDbCode = code
                .toLowerCase()
                .replace(/ё/g, "е")
                .replace(/\s+/g, "");
            const codeMatch = normalizedCode.length > 0 &&
                normalizedDbCode.includes(normalizedCode);
            return textMatch || codeMatch;
        });
    }
}
exports.ResearchRepository = ResearchRepository;
