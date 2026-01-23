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
// ========== Реализация patientSearchAPI ==========
const patientSearchAPI = {
    async search(query) {
        const researches = (await electron_1.ipcRenderer.invoke("research:search", query, 100));
        const byPatient = new Map();
        for (const r of researches) {
            if (!byPatient.has(r.patient_id)) {
                byPatient.set(r.patient_id, {
                    patient: {
                        id: r.patient_id,
                        last_name: r.last_name,
                        first_name: r.first_name,
                        middle_name: r.middle_name ?? undefined,
                        date_of_birth: r.date_of_birth,
                        created_at: r.created_at,
                        updated_at: r.updated_at,
                    },
                    researches: [],
                });
            }
            const entry = byPatient.get(r.patient_id);
            entry.researches.push({
                id: r.id,
                patient_id: r.patient_id,
                research_date: r.research_date,
                payment_type: r.payment_type,
                doctor_name: r.doctor_name,
                notes: r.notes,
                created_at: r.created_at,
                updated_at: r.updated_at,
                study_types: (r.studies || []).map((s) => s.study_type),
            });
        }
        return Array.from(byPatient.values());
    },
};
// ========== Экспорт в window ==========
electron_1.contextBridge.exposeInMainWorld("authAPI", authAPI);
electron_1.contextBridge.exposeInMainWorld("patientAPI", patientAPI);
electron_1.contextBridge.exposeInMainWorld("researchAPI", researchAPI);
electron_1.contextBridge.exposeInMainWorld("journalAPI", journalAPI);
electron_1.contextBridge.exposeInMainWorld("windowAPI", windowAPI);
electron_1.contextBridge.exposeInMainWorld("protocolAPI", protocolAPI);
electron_1.contextBridge.exposeInMainWorld("patientSearchAPI", patientSearchAPI);
