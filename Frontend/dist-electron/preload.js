"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const authAPI = {
    register: (data) => electron_1.ipcRenderer.invoke('auth:register', data),
    login: (data) => electron_1.ipcRenderer.invoke('auth:login', data),
    getUser: (userId) => electron_1.ipcRenderer.invoke('auth:getUser', userId)
};
const windowAPI = {
    focus: () => electron_1.ipcRenderer.send('window:focus')
};
electron_1.contextBridge.exposeInMainWorld('authAPI', authAPI);
electron_1.contextBridge.exposeInMainWorld('windowAPI', windowAPI);
