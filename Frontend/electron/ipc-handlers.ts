import { ipcMain } from 'electron';
import { DatabaseManager } from './database/database';

export function setupAuthHandlers(): void {
  const db = DatabaseManager.getInstance();

  ipcMain.handle('auth:register', async (_, { username, password, name }) => {
    return await db.registerUser(username, password, name);
  });

  ipcMain.handle('auth:login', async (_, { username, password }) => {
    return await db.loginUser(username, password);
  });

  ipcMain.handle('auth:getUser', async (_, userId: number) => {
    return db.getUserById(userId);
  });
}
