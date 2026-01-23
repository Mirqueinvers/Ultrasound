"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResearchRepository = void 0;
class ResearchRepository {
    constructor(db) {
        this.db = db;
    }
    createResearch(patientId, researchDate, paymentType, doctorName, notes) {
        try {
            const insert = this.db.prepare("INSERT INTO researches (patient_id, research_date, payment_type, doctor_name, notes) VALUES (?, ?, ?, ?, ?)");
            const result = insert.run(patientId, researchDate, paymentType, doctorName || null, notes || null);
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
    updateResearch(id, researchDate, paymentType, doctorName, notes) {
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
    searchResearches(query, limit = 50) {
        const searchPattern = `%${query}%`;
        const researches = this.db
            .prepare(`
        SELECT
          r.*,
          p.last_name,
          p.first_name,
          p.middle_name
        FROM researches r
        JOIN patients p ON r.patient_id = p.id
        WHERE p.last_name LIKE ?
           OR p.first_name LIKE ?
           OR p.middle_name LIKE ?
           OR r.research_date LIKE ?
        ORDER BY r.research_date DESC
        LIMIT ?
      `)
            .all(searchPattern, searchPattern, searchPattern, searchPattern, limit);
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
}
exports.ResearchRepository = ResearchRepository;
