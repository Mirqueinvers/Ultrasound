// ultrasound/frontend/electron/database/researchRepository.ts
import type Database from "better-sqlite3";
import type { Research, ResearchStudy } from "./schema";

export class ResearchRepository {
  constructor(private db: Database.Database) {}

  createResearch(
    patientId: number,
    researchDate: string,
    paymentType: "oms" | "paid",
    doctorName?: string,
    notes?: string
  ): { success: boolean; message: string; researchId?: number } {
    try {
      const insert = this.db.prepare(
        "INSERT INTO researches (patient_id, research_date, payment_type, doctor_name, notes) VALUES (?, ?, ?, ?, ?)"
      );
      const result = insert.run(
        patientId,
        researchDate,
        paymentType,
        doctorName || null,
        notes || null
      );

      return {
        success: true,
        message: "Исследование создано",
        researchId: result.lastInsertRowid as number,
      };
    } catch (error) {
      console.error("Create research error:", error);
      return { success: false, message: "Ошибка при создании исследования" };
    }
  }

  addStudyToResearch(
    researchId: number,
    studyType: string,
    studyData: object
  ): { success: boolean; message: string; studyId?: number } {
    try {
      const insert = this.db.prepare(
        "INSERT INTO research_studies (research_id, study_type, study_data) VALUES (?, ?, ?)"
      );
      const result = insert.run(
        researchId,
        studyType,
        JSON.stringify(studyData)
      );

      return {
        success: true,
        message: "Исследование добавлено",
        studyId: result.lastInsertRowid as number,
      };
    } catch (error) {
      console.error("Add study error:", error);
      return {
        success: false,
        message: "Ошибка при добавлении исследования",
      };
    }
  }

  getResearchById(
    id: number
  ): (Research & { studies: Array<ResearchStudy & { study_data: any }> }) | null {
    const research = this.db
      .prepare("SELECT * FROM researches WHERE id = ?")
      .get(id) as Research | undefined;

    if (!research) return null;

    const studies = this.db
      .prepare("SELECT * FROM research_studies WHERE research_id = ?")
      .all(id) as ResearchStudy[];

    return {
      ...research,
      studies: studies.map((study) => ({
        ...study,
        study_data: JSON.parse(study.study_data),
      })),
    };
  }

  getResearchesByPatientId(
    patientId: number,
    limit: number = 50,
    offset: number = 0
  ): Array<Research & { studies: Array<ResearchStudy & { study_data: any }> }> {
    const researches = this.db
      .prepare(
        `
        SELECT * FROM researches
        WHERE patient_id = ?
        ORDER BY research_date DESC, created_at DESC
        LIMIT ? OFFSET ?
      `
      )
      .all(patientId, limit, offset) as Research[];

    return researches.map((research) => {
      const studies = this.db
        .prepare("SELECT * FROM research_studies WHERE research_id = ?")
        .all(research.id) as ResearchStudy[];

      return {
        ...research,
        studies: studies.map((study) => ({
          ...study,
          study_data: JSON.parse(study.study_data),
        })),
      };
    });
  }

  getAllResearches(
    limit: number = 100,
    offset: number = 0
  ): Array<
    Research & {
      last_name: string;
      first_name: string;
      middle_name: string | null;
      date_of_birth: string;
      studies: Array<ResearchStudy & { study_data: any }>;
    }
  > {
    const researches = this.db
      .prepare(
        `
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
      `
      )
      .all(limit, offset) as Array<
      Research & {
        last_name: string;
        first_name: string;
        middle_name: string | null;
        date_of_birth: string;
      }
    >;

    return researches.map((research) => {
      const studies = this.db
        .prepare("SELECT * FROM research_studies WHERE research_id = ?")
        .all(research.id) as ResearchStudy[];

      return {
        ...research,
        studies: studies.map((study) => ({
          ...study,
          study_data: JSON.parse(study.study_data),
        })),
      };
    });
  }

  updateResearch(
    id: number,
    researchDate?: string,
    paymentType?: "oms" | "paid",
    doctorName?: string,
    notes?: string
  ): { success: boolean; message: string } {
    try {
      const fields: string[] = [];
      const values: any[] = [];

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
    } catch (error) {
      console.error("Update research error:", error);
      return {
        success: false,
        message: "Ошибка при обновлении исследования",
      };
    }
  }

  deleteResearch(id: number): { success: boolean; message: string } {
    try {
      const result = this.db
        .prepare("DELETE FROM researches WHERE id = ?")
        .run(id);

      if (result.changes > 0) {
        return { success: true, message: "Исследование удалено" };
      }

      return { success: false, message: "Исследование не найдено" };
    } catch (error) {
      console.error("Delete research error:", error);
      return {
        success: false,
        message: "Ошибка при удалении исследования",
      };
    }
  }

  searchResearches(
    query: string,
    limit: number = 50
  ): Array<
    Research & {
      last_name: string;
      first_name: string;
      middle_name: string | null;
      studies: Array<ResearchStudy & { study_data: any }>;
    }
  > {
    const searchPattern = `%${query}%`;
    const researches = this.db
      .prepare(
        `
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
      `
      )
      .all(
        searchPattern,
        searchPattern,
        searchPattern,
        searchPattern,
        limit
      ) as Array<
      Research & {
        last_name: string;
        first_name: string;
        middle_name: string | null;
      }
    >;

    return researches.map((research) => {
      const studies = this.db
        .prepare("SELECT * FROM research_studies WHERE research_id = ?")
        .all(research.id) as ResearchStudy[];

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
