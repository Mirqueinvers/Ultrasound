"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuthHandlers = setupAuthHandlers;
const electron_1 = require("electron");
const database_1 = require("./database/database");
function setupAuthHandlers() {
    const db = database_1.DatabaseManager.getInstance();
    electron_1.ipcMain.handle('auth:register', async (_, { username, password, name }) => {
        return await db.registerUser(username, password, name);
    });
    electron_1.ipcMain.handle('auth:login', async (_, { username, password }) => {
        return await db.loginUser(username, password);
    });
    electron_1.ipcMain.handle('auth:getUser', async (_, userId) => {
        return db.getUserById(userId);
    });
}
