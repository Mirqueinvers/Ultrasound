"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupProtocolHandlers = void 0;
// ultrasound/frontend/electron/ipc/protocolHandlers.ts
const electron_1 = require("electron");
const setupProtocolHandlers = (repo) => {
    electron_1.ipcMain.handle("protocol:getByResearchId", async (_event, id) => {
        return repo.getByResearchId(id) ?? null;
    });
};
exports.setupProtocolHandlers = setupProtocolHandlers;
