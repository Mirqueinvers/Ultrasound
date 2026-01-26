"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuthHandlers = setupAuthHandlers;
// ultrasound/frontend/electron/ipc-handlers.ts
const electron_1 = require("electron");
const database_1 = require("./database/database");
function setupAuthHandlers(mainWindow) {
    const db = database_1.DatabaseManager.getInstance();
    // ==================== AUTH HANDLERS ====================
    electron_1.ipcMain.handle("auth:register", async (_, { username, password, name, organization, }) => {
        return await db.users.registerUser(username, password, name, organization);
    });
    electron_1.ipcMain.handle("auth:login", async (_, { username, password }) => {
        return await db.users.loginUser(username, password);
    });
    electron_1.ipcMain.handle("auth:getUser", async (_, userId) => {
        return db.users.getUserById(userId);
    });
    electron_1.ipcMain.handle("auth:updateUser", async (_, { id, name, username, organization, }) => {
        return await db.users.updateUser(id, name, username, organization);
    });
    electron_1.ipcMain.handle("auth:changePassword", async (_, { userId, currentPassword, newPassword, }) => {
        return await db.users.changePassword(userId, currentPassword, newPassword);
    });
    // ==================== PATIENT HANDLERS ====================
    electron_1.ipcMain.handle("patient:findOrCreate", async (_, { lastName, firstName, middleName, dateOfBirth, }) => {
        return db.patients.findOrCreatePatient(lastName, firstName, middleName, dateOfBirth);
    });
    electron_1.ipcMain.handle("patient:search", async (_, query, limit) => {
        return db.patients.searchPatients(query, limit);
    });
    electron_1.ipcMain.handle("patient:getAll", async (_, limit, offset) => {
        return db.patients.getAllPatients(limit, offset);
    });
    electron_1.ipcMain.handle("patient:getById", async (_, id) => {
        return db.patients.findPatientById(id);
    });
    electron_1.ipcMain.handle("patient:update", async (_, { id, lastName, firstName, middleName, dateOfBirth, }) => {
        return db.patients.updatePatient(id, lastName, firstName, middleName, dateOfBirth);
    });
    // ==================== RESEARCH HANDLERS ====================
    electron_1.ipcMain.handle("research:create", async (_, { patientId, researchDate, paymentType, organization, doctorName, notes, }) => {
        return db.researches.createResearch(patientId, researchDate, paymentType, organization ?? null, doctorName, notes);
    });
    electron_1.ipcMain.handle("research:addStudy", async (_, { researchId, studyType, studyData, }) => {
        return db.researches.addStudyToResearch(researchId, studyType, studyData);
    });
    electron_1.ipcMain.handle("research:getById", async (_, id) => {
        return db.researches.getResearchById(id);
    });
    electron_1.ipcMain.handle("research:getByPatientId", async (_, patientId, limit, offset) => {
        return db.researches.getResearchesByPatientId(patientId, limit, offset);
    });
    electron_1.ipcMain.handle("research:getAll", async (_, limit, offset) => {
        return db.researches.getAllResearches(limit, offset);
    });
    electron_1.ipcMain.handle("research:update", async (_, { id, researchDate, paymentType, organization, doctorName, notes, }) => {
        return db.researches.updateResearch(id, researchDate, paymentType, organization ?? null, doctorName, notes);
    });
    electron_1.ipcMain.handle("research:delete", async (_, id) => {
        return db.researches.deleteResearch(id);
    });
    electron_1.ipcMain.handle("research:search", async (_, query, limit) => {
        return db.researches.searchResearches(query, limit);
    });
    // ==================== JOURNAL HANDLERS ====================
    electron_1.ipcMain.handle("journal:getByDate", async (_, date) => {
        return db.journal.getJournalByDate(date);
    });
    // ==================== WINDOW HANDLERS ====================
    electron_1.ipcMain.on("window:focus", () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.focus();
            mainWindow.show();
        }
    });
    electron_1.ipcMain.on("window:minimize", () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.minimize();
        }
    });
    electron_1.ipcMain.on("window:maximize", () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            if (mainWindow.isMaximized()) {
                mainWindow.unmaximize();
            }
            else {
                mainWindow.maximize();
            }
        }
    });
    electron_1.ipcMain.on("window:close", () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.close();
        }
    });
}
