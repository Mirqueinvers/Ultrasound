"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProtocolRepository = void 0;
class ProtocolRepository {
    constructor(db) {
        this.db = db;
    }
    getByResearchId(researchId) {
        const rows = this.db
            .prepare(`
        SELECT study_type, study_data
        FROM research_studies
        WHERE research_id = ?
        ORDER BY created_at
      `)
            .all(researchId);
        if (!rows.length)
            return null;
        const studies = {};
        for (const row of rows) {
            try {
                studies[row.study_type] = JSON.parse(row.study_data);
            }
            catch {
                studies[row.study_type] = null;
            }
        }
        return { researchId, studies };
    }
}
exports.ProtocolRepository = ProtocolRepository;
