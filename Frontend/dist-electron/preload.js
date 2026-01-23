"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// ultrasound/frontend/electron/preload.ts
const electron_1 = require("electron");
// ========== Реализации API ==========
const authAPI = {
    register: (data) => electron_1.ipcRenderer.invoke("auth:register", data),
    login: (data) => electron_1.ipcRenderer.invoke("auth:login", data),
    getUser: (userId) => electron_1.ipcRenderer.invoke("auth:getUser", userId),
    updateUser: (data) => electron_1.ipcRenderer.invoke("auth:updateUser", data),
    changePassword: (data) => electron_1.ipcRenderer.invoke("auth:changePassword", data),
};
const patientAPI = {
    findOrCreate: (data) => electron_1.ipcRenderer.invoke("patient:findOrCreate", data),
    search: (query, limit) => electron_1.ipcRenderer.invoke("patient:search", query, limit),
    getAll: (limit, offset) => electron_1.ipcRenderer.invoke("patient:getAll", limit, offset),
    getById: (id) => electron_1.ipcRenderer.invoke("patient:getById", id),
    update: (data) => electron_1.ipcRenderer.invoke("patient:update", data),
};
const researchAPI = {
    create: (data) => electron_1.ipcRenderer.invoke("research:create", data),
    addStudy: (data) => electron_1.ipcRenderer.invoke("research:addStudy", data),
    getById: (id) => electron_1.ipcRenderer.invoke("research:getById", id),
    getByPatientId: (patientId, limit, offset) => electron_1.ipcRenderer.invoke("research:getByPatientId", patientId, limit, offset),
    getAll: (limit, offset) => electron_1.ipcRenderer.invoke("research:getAll", limit, offset),
    update: (data) => electron_1.ipcRenderer.invoke("research:update", data),
    delete: (id) => electron_1.ipcRenderer.invoke("research:delete", id),
    search: (query, limit) => electron_1.ipcRenderer.invoke("research:search", query, limit),
};
const journalAPI = {
    getByDate: (date) => electron_1.ipcRenderer.invoke("journal:getByDate", date),
};
const windowAPI = {
    focus: () => electron_1.ipcRenderer.send("window:focus"),
    minimize: () => electron_1.ipcRenderer.send("window:minimize"),
    maximize: () => electron_1.ipcRenderer.send("window:maximize"),
    close: () => electron_1.ipcRenderer.send("window:close"),
};
const protocolAPI = {
    getByResearchId: (id) => electron_1.ipcRenderer.invoke("protocol:getByResearchId", id),
};
// ========== Экспорт в window ==========
electron_1.contextBridge.exposeInMainWorld("authAPI", authAPI);
electron_1.contextBridge.exposeInMainWorld("patientAPI", patientAPI);
electron_1.contextBridge.exposeInMainWorld("researchAPI", researchAPI);
electron_1.contextBridge.exposeInMainWorld("journalAPI", journalAPI);
electron_1.contextBridge.exposeInMainWorld("windowAPI", windowAPI);
electron_1.contextBridge.exposeInMainWorld("protocolAPI", protocolAPI);
