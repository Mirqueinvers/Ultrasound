"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuthHandlers = setupAuthHandlers;
const electron_1 = require("electron");
const database_1 = require("./database/database");
function setupAuthHandlers(mainWindow) {
    const db = database_1.DatabaseManager.getInstance();
    electron_1.ipcMain.handle('auth:register', async (_, { username, password, name, organization }) => {
        return await db.registerUser(username, password, name, organization);
    });
    electron_1.ipcMain.handle('auth:login', async (_, { username, password }) => {
        return await db.loginUser(username, password);
    });
    electron_1.ipcMain.handle('auth:getUser', async (_, userId) => {
        return db.getUserById(userId);
    });
    electron_1.ipcMain.handle('auth:updateUser', async (_, { id, name, username, organization }) => {
        return await db.updateUser(id, name, username, organization);
    });
    electron_1.ipcMain.handle('auth:changePassword', async (_, { userId, currentPassword, newPassword }) => {
        return await db.changePassword(userId, currentPassword, newPassword);
    });
    electron_1.ipcMain.on('window:focus', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.focus();
            mainWindow.show();
        }
    });
}
