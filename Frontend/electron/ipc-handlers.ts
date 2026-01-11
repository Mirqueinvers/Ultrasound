import { ipcMain, BrowserWindow } from 'electron';
import { DatabaseManager } from './database/database';

export function setupAuthHandlers(mainWindow?: BrowserWindow): void {
  const db = DatabaseManager.getInstance();

  ipcMain.handle('auth:register', async (_, { username, password, name, organization }: { 
    username: string; 
    password: string; 
    name: string; 
    organization?: string 
  }) => {
    return await db.registerUser(username, password, name, organization);
  });

  ipcMain.handle('auth:login', async (_, { username, password }: { 
    username: string; 
    password: string 
  }) => {
    return await db.loginUser(username, password);
  });

  ipcMain.handle('auth:getUser', async (_, userId: number) => {
    return db.getUserById(userId);
  });

  ipcMain.handle('auth:updateUser', async (_, { id, name, username, organization }: { 
    id: number; 
    name: string; 
    username: string; 
    organization?: string 
  }) => {
    return await db.updateUser(id, name, username, organization);
  });

  ipcMain.handle('auth:changePassword', async (_, { userId, currentPassword, newPassword }: { 
    userId: number; 
    currentPassword: string; 
    newPassword: string 
  }) => {
    return await db.changePassword(userId, currentPassword, newPassword);
  });

  ipcMain.on('window:focus', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.focus();
      mainWindow.show();
    }
  });
}
