import { ipcMain } from "electron";
import type { PrintBlockOverrides, ProtocolRepository } from "../database/protocolRepository";

export const setupProtocolHandlers = (repo: ProtocolRepository) => {
  ipcMain.handle("protocol:getByResearchId", async (_event, id: number) => {
    return repo.getByResearchId(id) ?? null;
  });

  ipcMain.handle(
    "protocol:savePrintOverrides",
    async (_event, data: { researchId: number; overrides: PrintBlockOverrides }) => {
      return repo.savePrintOverrides(data.researchId, data.overrides ?? {});
    },
  );
};
