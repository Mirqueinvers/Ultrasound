// ultrasound/frontend/electron/database/journalRepository.ts
import type Database from "better-sqlite3";
import type { JournalEntry } from "./database";
import type { Patient, Research } from "./schema";

export class JournalRepository {
  constructor(private db: Database.Database) {}

  getJournalByDate(date: string): JournalEntry[] {
    const rows = this.db
      .prepare(
        `
        SELECT
          p.id             AS patient_id,
          p.last_name      AS p_last_name,
          p.first_name     AS p_first_name,
          p.middle_name    AS p_middle_name,
          p.date_of_birth  AS p_date_of_birth,
          p.created_at     AS p_created_at,
          p.updated_at     AS p_updated_at,
          r.id             AS research_id,
          r.patient_id     AS r_patient_id,
          r.research_date  AS r_research_date,
          r.payment_type   AS r_payment_type,
          r.doctor_name    AS r_doctor_name,
          r.notes          AS r_notes,
          r.created_at     AS r_created_at,
          r.updated_at     AS r_updated_at
        FROM researches r
        JOIN patients p ON r.patient_id = p.id
        WHERE DATE(r.research_date) = DATE(?)
        ORDER BY p.last_name, p.first_name, r.research_date
      `
      )
      .all(date) as any[];

    const map = new Map<number, JournalEntry>();

    for (const row of rows) {
      let entry = map.get(row.patient_id);
      if (!entry) {
        entry = {
          patient: {
            id: row.patient_id,
            last_name: row.p_last_name,
            first_name: row.p_first_name,
            middle_name: row.p_middle_name ?? undefined,
            date_of_birth: row.p_date_of_birth,
            created_at: row.p_created_at,
            updated_at: row.p_updated_at,
          } as Patient,
          researches: [],
        };
        map.set(row.patient_id, entry);
      }

      const studies = this.db
        .prepare(
          `
          SELECT study_type
          FROM research_studies
          WHERE research_id = ?
          ORDER BY created_at
        `
        )
        .all(row.research_id) as { study_type: string }[];

      (entry.researches as any as Research[]).push({
        id: row.research_id,
        patient_id: row.r_patient_id,
        research_date: row.r_research_date,
        payment_type: row.r_payment_type,
        doctor_name: row.r_doctor_name ?? undefined,
        notes: row.r_notes ?? undefined,
        created_at: row.r_created_at,
        updated_at: row.r_updated_at,
        // дополнительное поле
        study_types: studies.map((s) => s.study_type),
      } as any);
    }

    return Array.from(map.values());
  }
}
