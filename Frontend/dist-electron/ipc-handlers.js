"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupAuthHandlers = setupAuthHandlers;
const electron_1 = require("electron");
const database_1 = require("./database/database");
function setupAuthHandlers(mainWindow) {
    const db = database_1.DatabaseManager.getInstance();
    // ==================== AUTH HANDLERS ====================
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
    // ==================== PATIENT HANDLERS ====================
    electron_1.ipcMain.handle('patient:findOrCreate', async (_, { lastName, firstName, middleName, dateOfBirth }) => {
        return db.findOrCreatePatient(lastName, firstName, middleName, dateOfBirth);
    });
    electron_1.ipcMain.handle('patient:search', async (_, query, limit) => {
        return db.searchPatients(query, limit);
    });
    electron_1.ipcMain.handle('patient:getAll', async (_, limit, offset) => {
        return db.getAllPatients(limit, offset);
    });
    electron_1.ipcMain.handle('patient:getById', async (_, id) => {
        return db.findPatientById(id);
    });
    electron_1.ipcMain.handle('patient:update', async (_, { id, lastName, firstName, middleName, dateOfBirth }) => {
        return db.updatePatient(id, lastName, firstName, middleName, dateOfBirth);
    });
    // ==================== RESEARCH HANDLERS ====================
    electron_1.ipcMain.handle('research:create', async (_, { patientId, researchDate, paymentType, doctorName, notes }) => {
        return db.createResearch(patientId, researchDate, paymentType, doctorName, notes);
    });
    electron_1.ipcMain.handle('research:addStudy', async (_, { researchId, studyType, studyData }) => {
        return db.addStudyToResearch(researchId, studyType, studyData);
    });
    electron_1.ipcMain.handle('research:getById', async (_, id) => {
        return db.getResearchById(id);
    });
    electron_1.ipcMain.handle('research:getByPatientId', async (_, patientId, limit, offset) => {
        return db.getResearchesByPatientId(patientId, limit, offset);
    });
    electron_1.ipcMain.handle('research:getAll', async (_, limit, offset) => {
        return db.getAllResearches(limit, offset);
    });
    electron_1.ipcMain.handle('research:update', async (_, { id, researchDate, paymentType, doctorName, notes }) => {
        return db.updateResearch(id, researchDate, paymentType, doctorName, notes);
    });
    electron_1.ipcMain.handle('research:delete', async (_, id) => {
        return db.deleteResearch(id);
    });
    electron_1.ipcMain.handle('research:search', async (_, query, limit) => {
        return db.searchResearches(query, limit);
    });
    // ==================== WINDOW HANDLERS ====================
    electron_1.ipcMain.on('window:focus', () => {
        if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.focus();
            mainWindow.show();
        }
    });
}
