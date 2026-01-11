import { contextBridge, ipcRenderer } from 'electron';

export interface AuthAPI {
  register: (data: { username: string; password: string; name: string; organization?: string }) => Promise<{
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
  updateUser: (data: { id: number; name: string; username: string; organization?: string }) => Promise<{
    success: boolean;
    message: string;
  }>;
  changePassword: (data: { userId: number; currentPassword: string; newPassword: string }) => Promise<{
    success: boolean;
    message: string;
  }>;
}

export interface WindowAPI {
  focus: () => void;
}

const authAPI: AuthAPI = {
  register: (data) => ipcRenderer.invoke('auth:register', data),
  login: (data) => ipcRenderer.invoke('auth:login', data),
  getUser: (userId) => ipcRenderer.invoke('auth:getUser', userId),
  updateUser: (data) => ipcRenderer.invoke('auth:updateUser', data),
  changePassword: (data) => ipcRenderer.invoke('auth:changePassword', data)
};

const windowAPI: WindowAPI = {
  focus: () => ipcRenderer.send('window:focus')
};

contextBridge.exposeInMainWorld('authAPI', authAPI);
contextBridge.exposeInMainWorld('windowAPI', windowAPI);
