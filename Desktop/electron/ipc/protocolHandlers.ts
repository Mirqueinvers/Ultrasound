import { ipcMain } from "electron";
import { apiClient, ApiError } from "../apiClient";

export const setupProtocolHandlers = () => {
  ipcMain.handle("protocol:getByResearchId", async (_event, id: string) => {
    try {
      return await apiClient.protocol.getByResearchId(id);
    } catch (err) {
      console.error("protocol:getByResearchId error:", err);
      return null;
    }
  });

  ipcMain.handle(
    "protocol:savePrintOverrides",
    async (_event, data: { researchId: string; overrides: Record<string, string> }) => {
      try {
        const result = await apiClient.protocol.savePrintOverrides(
          data.researchId,
          data.overrides ?? {}
        );
        return {
          success: true,
          message:
            result.message ?? "Шаблоны протоколов успешно сохранены.",
        };
      } catch (err) {
        console.error("protocol:savePrintOverrides error:", err);
        return {
          success: false,
          message:
            err instanceof ApiError
              ? err.message
              : "Не удалось сохранить шаблоны протоколов.",
        };
      }
    }
  );
};