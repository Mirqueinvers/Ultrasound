import type Database from "better-sqlite3";
import type { PrintBlockOverrideRow, ResearchStudy } from "./schema";

export type PrintBlockOverrides = Record<string, string>;

export interface SavedProtocol {
  researchId: number;
  studies: {
    [studyType: string]: any;
  };
  printOverrides: PrintBlockOverrides;
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

    return {
      researchId,
      studies,
      printOverrides: this.getPrintOverridesByResearchId(researchId),
    };
  }

  getPrintOverridesByResearchId(researchId: number): PrintBlockOverrides {
    const rows = this.db
      .prepare(
        `
        SELECT block_id, block_text
        FROM print_block_overrides
        WHERE research_id = ?
        ORDER BY block_id
      `,
      )
      .all(researchId) as Array<Pick<PrintBlockOverrideRow, "block_id" | "block_text">>;

    return rows.reduce<PrintBlockOverrides>((acc, row) => {
      acc[row.block_id] = row.block_text ?? "";
      return acc;
    }, {});
  }

  savePrintOverrides(researchId: number, overrides: PrintBlockOverrides) {
    const normalizedEntries = Object.entries(overrides)
      .filter(([blockId]) => blockId.trim())
      .map(([blockId, blockText]) => [blockId.trim(), typeof blockText === "string" ? blockText : String(blockText ?? "")] as const);

    const transaction = this.db.transaction((entries: ReadonlyArray<readonly [string, string]>) => {
      this.db.prepare("DELETE FROM print_block_overrides WHERE research_id = ?").run(researchId);

      const insertStatement = this.db.prepare(
        `
        INSERT INTO print_block_overrides (research_id, block_id, block_text, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
      `,
      );

      for (const [blockId, blockText] of entries) {
        insertStatement.run(researchId, blockId, blockText);
      }
    });

    try {
      transaction(normalizedEntries);
      return { success: true, message: "?????? ???????? ?????? ?????????." };
    } catch (error) {
      console.error("?? ??????? ????????? ?????? ???????? ??????", error);
      return { success: false, message: "?? ??????? ????????? ?????? ???????? ??????." };
    }
  }
}
