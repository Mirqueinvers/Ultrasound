// ultrasound/frontend/electron/database/protocolRepository.ts
import type Database from "better-sqlite3";
import type { ResearchStudy } from "./schema";

export interface SavedProtocol {
  researchId: number;
  studies: {
    [studyType: string]: any;
  };
}

export class ProtocolRepository {
  constructor(private db: Database.Database) {}

  getByResearchId(researchId: number): SavedProtocol | null {
    const rows = this.db
      .prepare(
        `
        SELECT study_type, study_data
        FROM research_studies
        WHERE research_id = ?
        ORDER BY created_at
      `,
      )
      .all(researchId) as Pick<ResearchStudy, "study_type" | "study_data">[];

    if (!rows.length) return null;

    const studies: SavedProtocol["studies"] = {};

    for (const row of rows) {
      try {
        studies[row.study_type] = JSON.parse(row.study_data as unknown as string);
      } catch {
        studies[row.study_type] = null;
      }
    }

    return { researchId, studies };
  }
}
