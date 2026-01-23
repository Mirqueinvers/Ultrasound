// ultrasound/frontend/electron/ipc/protocolHandlers.ts
import { ipcMain } from "electron";
import type { ProtocolRepository } from "../database/protocolRepository";

export const setupProtocolHandlers = (repo: ProtocolRepository) => {
  ipcMain.handle("protocol:getByResearchId", async (_event, id: number) => {
    return repo.getByResearchId(id) ?? null;
  });
};
