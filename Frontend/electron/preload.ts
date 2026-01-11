import { contextBridge, ipcRenderer } from 'electron';

export interface AuthAPI {
  register: (data: { username: string; password: string; name: string }) => Promise<{
    success: boolean;
    message: string;
    userId?: number;
  }>;
  login: (data: { username: string; password: string }) => Promise<{
    success: boolean;
    message: string;
    user?: any;
  }>;
  getUser: (userId: number) => Promise<any>;
}

const authAPI: AuthAPI = {
  register: (data) => ipcRenderer.invoke('auth:register', data),
  login: (data) => ipcRenderer.invoke('auth:login', data),
  getUser: (userId) => ipcRenderer.invoke('auth:getUser', userId)
};

contextBridge.exposeInMainWorld('authAPI', authAPI);
