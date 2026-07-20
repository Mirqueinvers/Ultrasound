import type Database from "better-sqlite3";

export interface MedisonMappingRow {
  id: number;
  user_id: number;
  measurement_id: string;
  target_study_type: string;
  target_field: string;
  transform: string;
  is_enabled: number;
  created_at: string;
  updated_at: string;
}

export interface MedisonMappingInput {
  measurementId: string;
  targetStudyType: string;
  targetField: string;
  transform: string;
  isEnabled: boolean;
}

export class MedisonMappingRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
  }

  getByUserId(userId: number): MedisonMappingRow[] {
    const rows = this.db
      .prepare("SELECT * FROM medison_mappings WHERE user_id = ? ORDER BY target_study_type, measurement_id")
      .all(userId) as MedisonMappingRow[];
    return rows;
  }

  upsert(data: {
    userId: number;
    measurementId: string;
    targetStudyType: string;
    targetField: string;
    transform: string;
    isEnabled: boolean;
  }): { success: boolean; id?: number; message?: string } {
    try {
      // Проверяем, существует ли уже запись
      const existing = this.db
        .prepare(
          "SELECT id FROM medison_mappings WHERE user_id = ? AND measurement_id = ? AND target_study_type = ?"
        )
        .get(data.userId, data.measurementId, data.targetStudyType) as
        | { id: number }
        | undefined;

      if (existing) {
        this.db
          .prepare(
            `UPDATE medison_mappings 
             SET target_field = ?, transform = ?, is_enabled = ?, updated_at = CURRENT_TIMESTAMP
             WHERE id = ?`
          )
          .run(
            data.targetField,
            data.transform,
            data.isEnabled ? 1 : 0,
            existing.id
          );
        return { success: true, id: existing.id };
      } else {
        const result = this.db
          .prepare(
            `INSERT INTO medison_mappings (user_id, measurement_id, target_study_type, target_field, transform, is_enabled)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
          .run(
            data.userId,
            data.measurementId,
            data.targetStudyType,
            data.targetField,
            data.transform,
            data.isEnabled ? 1 : 0
          );
        return { success: true, id: result.lastInsertRowid as number };
      }
    } catch (err) {
      console.error("Failed to upsert mapping:", err);
      return { success: false, message: "Ошибка сохранения маппинга" };
    }
  }

  delete(id: number): { success: boolean; message?: string } {
    try {
      this.db.prepare("DELETE FROM medison_mappings WHERE id = ?").run(id);
      return { success: true };
    } catch (err) {
      console.error("Failed to delete mapping:", err);
      return { success: false, message: "Ошибка удаления маппинга" };
    }
  }

  resetDefaults(userId: number): { success: boolean; message?: string } {
    try {
      // Удаляем все маппинги пользователя
      this.db
        .prepare("DELETE FROM medison_mappings WHERE user_id = ?")
        .run(userId);

      // Вставляем дефолтные маппинги
      const defaults = this.getDefaultMappings(userId);
      const insert = this.db.prepare(
        `INSERT INTO medison_mappings (user_id, measurement_id, target_study_type, target_field, transform, is_enabled)
         VALUES (?, ?, ?, ?, ?, ?)`
      );

      const insertMany = this.db.transaction(
        (mappings: Array<{
          userId: number;
          measurementId: string;
          targetStudyType: string;
          targetField: string;
          transform: string;
        }>) => {
          for (const m of mappings) {
            insert.run(
              m.userId,
              m.measurementId,
              m.targetStudyType,
              m.targetField,
              m.transform,
              1
            );
          }
        }
      );

      insertMany(defaults);
      return { success: true };
    } catch (err) {
      console.error("Failed to reset defaults:", err);
      return { success: false, message: "Ошибка сброса маппингов" };
    }
  }

  private getDefaultMappings(userId: number) {
    return [
      // ОБП
      { userId, measurementId: "Rad_Liver_L", targetStudyType: "obp", targetField: "liver.rightLobeAP", transform: "number->string" },
      { userId, measurementId: "Rad_Liver_W", targetStudyType: "obp", targetField: "liver.leftLobeAP", transform: "number->string" },
      { userId, measurementId: "Rad_GB_L", targetStudyType: "obp", targetField: "gallbladder.length", transform: "number->string" },
      { userId, measurementId: "Rad_GB_W", targetStudyType: "obp", targetField: "gallbladder.width", transform: "number->string" },
      { userId, measurementId: "Rad_GB_GBW", targetStudyType: "obp", targetField: "gallbladder.wallThickness", transform: "number->string" },
      { userId, measurementId: "Rad_GB_CBD", targetStudyType: "obp", targetField: "gallbladder.commonBileDuct", transform: "number->string" },
      { userId, measurementId: "Rad_Pancreas_PancHead", targetStudyType: "obp", targetField: "pancreas.head", transform: "number->string" },
      { userId, measurementId: "Rad_Pancreas_PancBody", targetStudyType: "obp", targetField: "pancreas.body", transform: "number->string" },
      { userId, measurementId: "Rad_Pancreas_PancTail", targetStudyType: "obp", targetField: "pancreas.tail", transform: "number->string" },
      { userId, measurementId: "Rad_Spleen_L", targetStudyType: "obp", targetField: "spleen.length", transform: "number->string" },
      { userId, measurementId: "Rad_Spleen_W", targetStudyType: "obp", targetField: "spleen.width", transform: "number->string" },
      { userId, measurementId: "Rad_MPortalV_VDist", targetStudyType: "obp", targetField: "portalVein.diameter", transform: "number->string" },
      // Почки
      { userId, measurementId: "Rad_Kidney_LL", targetStudyType: "kidneys", targetField: "leftKidney.length", transform: "number->string" },
      { userId, measurementId: "Rad_Kidney_LW", targetStudyType: "kidneys", targetField: "leftKidney.width", transform: "number->string" },
      { userId, measurementId: "Rad_Kidney_LH", targetStudyType: "kidneys", targetField: "leftKidney.parenchymaSize", transform: "number->string" },
      { userId, measurementId: "Rad_Kidney_RL", targetStudyType: "kidneys", targetField: "rightKidney.length", transform: "number->string" },
      { userId, measurementId: "Rad_Kidney_RW", targetStudyType: "kidneys", targetField: "rightKidney.width", transform: "number->string" },
      { userId, measurementId: "Rad_Kidney_RH", targetStudyType: "kidneys", targetField: "rightKidney.parenchymaSize", transform: "number->string" },
      // Гинекология
      { userId, measurementId: "GYN_UTERUS_LENGTH", targetStudyType: "gyn", targetField: "uterus.length", transform: "number->string" },
      { userId, measurementId: "GYN_UTERUS_HEIGHT", targetStudyType: "gyn", targetField: "uterus.height", transform: "number->string" },
      { userId, measurementId: "GYN_UTERUS_WIDTH", targetStudyType: "gyn", targetField: "uterus.width", transform: "number->string" },
      { userId, measurementId: "GYN_UTERUS_VOL", targetStudyType: "gyn", targetField: "uterus.volume", transform: "number->string" },
      { userId, measurementId: "GYN_UTERUS_EndoTh", targetStudyType: "gyn", targetField: "uterus.endometriumThickness", transform: "number->string" },
      { userId, measurementId: "GYN_UTERUS_CervixW", targetStudyType: "gyn", targetField: "uterus.cervixWidth", transform: "number->string" },
      { userId, measurementId: "GYN_RtOvary_LENGTH", targetStudyType: "gyn", targetField: "rightOvary.length", transform: "number->string" },
      { userId, measurementId: "GYN_RtOvary_WIDTH", targetStudyType: "gyn", targetField: "rightOvary.width", transform: "number->string" },
      { userId, measurementId: "GYN_LtOvary_LENGTH", targetStudyType: "gyn", targetField: "leftOvary.length", transform: "number->string" },
      { userId, measurementId: "GYN_LtOvary_WIDTH", targetStudyType: "gyn", targetField: "leftOvary.width", transform: "number->string" },
      // Урология (мочевой пузырь)
      { userId, measurementId: "Uro_Bladder_Length", targetStudyType: "uro", targetField: "bladder.length", transform: "number->string" },
      { userId, measurementId: "Uro_Bladder_Height", targetStudyType: "uro", targetField: "bladder.height", transform: "number->string" },
      { userId, measurementId: "Uro_Bladder_Width", targetStudyType: "uro", targetField: "bladder.width", transform: "number->string" },
      { userId, measurementId: "Uro_Bladder_Volume", targetStudyType: "uro", targetField: "bladder.volume", transform: "number->string" },
      { userId, measurementId: "Uro_ResVol_PostLength", targetStudyType: "uro", targetField: "bladder.residualLength", transform: "number->string" },
      { userId, measurementId: "Uro_ResVol_PostHeight", targetStudyType: "uro", targetField: "bladder.residualHeight", transform: "number->string" },
      { userId, measurementId: "Uro_ResVol_PostWidth", targetStudyType: "uro", targetField: "bladder.residualWidth", transform: "number->string" },
      { userId, measurementId: "Uro_ResVol_PostVolume", targetStudyType: "uro", targetField: "bladder.residualVolume", transform: "number->string" },
      // Простата
      { userId, measurementId: "Uro_Prostate_Length", targetStudyType: "uro", targetField: "prostate.length", transform: "number->string" },
      { userId, measurementId: "Uro_Prostate_Height", targetStudyType: "uro", targetField: "prostate.height", transform: "number->string" },
      { userId, measurementId: "Uro_Prostate_Width", targetStudyType: "uro", targetField: "prostate.width", transform: "number->string" },
      { userId, measurementId: "Uro_Prostate_Volume", targetStudyType: "uro", targetField: "prostate.volume", transform: "number->string" },
      { userId, measurementId: "Uro_TZ_Length", targetStudyType: "uro", targetField: "prostate.tzLength", transform: "number->string" },
      { userId, measurementId: "Uro_PREDPSA_PREDPSA", targetStudyType: "uro", targetField: "prostate.predictedPSA", transform: "number->string" },
      // Щитовидка (доли)
      { userId, measurementId: "Thyroid_Lobe_RL", targetStudyType: "thyroid", targetField: "rightLobe.length", transform: "number->string" },
      { userId, measurementId: "Thyroid_Lobe_RH", targetStudyType: "thyroid", targetField: "rightLobe.height", transform: "number->string" },
      { userId, measurementId: "Thyroid_Lobe_RW", targetStudyType: "thyroid", targetField: "rightLobe.width", transform: "number->string" },
      { userId, measurementId: "Thyroid_Lobe_RVol", targetStudyType: "thyroid", targetField: "rightLobe.volume", transform: "number->string" },
      { userId, measurementId: "Thyroid_Lobe_LL", targetStudyType: "thyroid", targetField: "leftLobe.length", transform: "number->string" },
      { userId, measurementId: "Thyroid_Lobe_LH", targetStudyType: "thyroid", targetField: "leftLobe.height", transform: "number->string" },
      { userId, measurementId: "Thyroid_Lobe_LW", targetStudyType: "thyroid", targetField: "leftLobe.width", transform: "number->string" },
      { userId, measurementId: "Thyroid_Lobe_LVol", targetStudyType: "thyroid", targetField: "leftLobe.volume", transform: "number->string" },
      { userId, measurementId: "Thyroid_Lobe_Isthmus", targetStudyType: "thyroid", targetField: "isthmusSize", transform: "number->string" },
    ];
  }
}