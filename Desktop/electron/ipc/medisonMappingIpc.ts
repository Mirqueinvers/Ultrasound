import { ipcMain } from "electron";
import { DatabaseManager } from "../database/database";

export function setupMedisonMappingHandlers(): void {
  const db = DatabaseManager.getInstance();

  ipcMain.handle("medison-mapping:getAll", async (_, userId: number) => {
    try {
      const mappings = db.medisonMappings.getByUserId(userId);
      return { success: true, mappings };
    } catch (err) {
      console.error("medison-mapping:getAll error:", err);
      return { success: false, message: "Ошибка получения маппингов" };
    }
  });

  ipcMain.handle(
    "medison-mapping:upsert",
    async (
      _,
      data: {
        userId: number;
        measurementId: string;
        targetStudyType: string;
        targetField: string;
        transform: string;
        isEnabled: boolean;
      }
    ) => {
      try {
        const result = db.medisonMappings.upsert(data);
        return result;
      } catch (err) {
        console.error("medison-mapping:upsert error:", err);
        return { success: false, message: "Ошибка сохранения маппинга" };
      }
    }
  );

  ipcMain.handle("medison-mapping:delete", async (_, id: number) => {
    try {
      const result = db.medisonMappings.delete(id);
      return result;
    } catch (err) {
      console.error("medison-mapping:delete error:", err);
      return { success: false, message: "Ошибка удаления маппинга" };
    }
  });

  ipcMain.handle("medison-mapping:resetDefaults", async (_, userId: number) => {
    try {
      const result = db.medisonMappings.resetDefaults(userId);
      return result;
    } catch (err) {
      console.error("medison-mapping:resetDefaults error:", err);
      return { success: false, message: "Ошибка сброса маппингов" };
    }
  });
}