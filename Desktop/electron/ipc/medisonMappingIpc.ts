import { ipcMain } from "electron";
import { apiClient, ApiError } from "../apiClient";

export function setupMedisonMappingHandlers(): void {
  ipcMain.handle("medison-mapping:getAll", async (_, userId: string) => {
    try {
      const mappings = await apiClient.medison.getMappings(userId);
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
        userId: string;
        measurementId: string;
        targetStudyType: string;
        targetField: string;
        transform: string;
        isEnabled: boolean;
      }
    ) => {
      try {
        const result = await apiClient.medison.upsertMapping(data);
        return { success: true, id: result.id };
      } catch (err) {
        console.error("medison-mapping:upsert error:", err);
        return {
          success: false,
          message:
            err instanceof ApiError ? err.message : "Ошибка сохранения маппинга",
        };
      }
    }
  );

  ipcMain.handle("medison-mapping:delete", async (_, id: string) => {
    try {
      await apiClient.medison.deleteMapping(id);
      return { success: true };
    } catch (err) {
      console.error("medison-mapping:delete error:", err);
      return {
        success: false,
        message:
          err instanceof ApiError ? err.message : "Ошибка удаления маппинга",
      };
    }
  });

  ipcMain.handle("medison-mapping:resetDefaults", async (_, userId: string) => {
    try {
      await apiClient.medison.resetDefaults(userId);
      return { success: true };
    } catch (err) {
      console.error("medison-mapping:resetDefaults error:", err);
      return {
        success: false,
        message:
          err instanceof ApiError ? err.message : "Ошибка сброса маппингов",
      };
    }
  });
}