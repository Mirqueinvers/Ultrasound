import { ipcMain, BrowserWindow } from 'electron';
import { DatabaseManager } from './database/database';

export function setupAuthHandlers(mainWindow?: BrowserWindow): void {
  const db = DatabaseManager.getInstance();

  // ==================== AUTH HANDLERS ====================

  ipcMain.handle(
    'auth:register',
    async (
      _,
      {
        username,
        password,
        name,
        organization,
      }: { username: string; password: string; name: string; organization?: string }
    ) => {
      return await db.registerUser(username, password, name, organization);
    }
  );

  ipcMain.handle(
    'auth:login',
    async (_, { username, password }: { username: string; password: string }) => {
      return await db.loginUser(username, password);
    }
  );

  ipcMain.handle('auth:getUser', async (_, userId: number) => {
    return db.getUserById(userId);
  });

  ipcMain.handle(
    'auth:updateUser',
    async (
      _,
      {
        id,
        name,
        username,
        organization,
      }: { id: number; name: string; username: string; organization?: string }
    ) => {
      return await db.updateUser(id, name, username, organization);
    }
  );

  ipcMain.handle(
    'auth:changePassword',
    async (
      _,
      {
        userId,
        currentPassword,
        newPassword,
      }: { userId: number; currentPassword: string; newPassword: string }
    ) => {
      return await db.changePassword(userId, currentPassword, newPassword);
    }
  );

  // ==================== PATIENT HANDLERS ====================

  ipcMain.handle(
    'patient:findOrCreate',
    async (
      _,
      {
        lastName,
        firstName,
        middleName,
        dateOfBirth,
      }: {
        lastName: string;
        firstName: string;
        middleName: string | null;
        dateOfBirth: string;
      }
    ) => {
      return db.findOrCreatePatient(lastName, firstName, middleName, dateOfBirth);
    }
  );

  ipcMain.handle('patient:search', async (_, query: string, limit?: number) => {
    return db.searchPatients(query, limit);
  });

  ipcMain.handle('patient:getAll', async (_, limit?: number, offset?: number) => {
    return db.getAllPatients(limit, offset);
  });

  ipcMain.handle('patient:getById', async (_, id: number) => {
    return db.findPatientById(id);
  });

  ipcMain.handle(
    'patient:update',
    async (
      _,
      {
        id,
        lastName,
        firstName,
        middleName,
        dateOfBirth,
      }: {
        id: number;
        lastName: string;
        firstName: string;
        middleName: string | null;
        dateOfBirth: string;
      }
    ) => {
      return db.updatePatient(id, lastName, firstName, middleName, dateOfBirth);
    }
  );

  // ==================== RESEARCH HANDLERS ====================

  ipcMain.handle(
    'research:create',
    async (
      _,
      {
        patientId,
        researchDate,
        paymentType,
        doctorName,
        notes,
      }: {
        patientId: number;
        researchDate: string;
        paymentType: 'oms' | 'paid';
        doctorName?: string;
        notes?: string;
      }
    ) => {
      return db.createResearch(patientId, researchDate, paymentType, doctorName, notes);
    }
  );

  ipcMain.handle(
    'research:addStudy',
    async (
      _,
      {
        researchId,
        studyType,
        studyData,
      }: {
        researchId: number;
        studyType: string;
        studyData: object;
      }
    ) => {
      return db.addStudyToResearch(researchId, studyType, studyData);
    }
  );

  ipcMain.handle('research:getById', async (_, id: number) => {
    return db.getResearchById(id);
  });

  ipcMain.handle(
    'research:getByPatientId',
    async (_,
      patientId: number,
      limit?: number,
      offset?: number
    ) => {
      return db.getResearchesByPatientId(patientId, limit, offset);
    }
  );

  ipcMain.handle('research:getAll', async (_, limit?: number, offset?: number) => {
    return db.getAllResearches(limit, offset);
  });

  ipcMain.handle(
    'research:update',
    async (
      _,
      {
        id,
        researchDate,
        paymentType,
        doctorName,
        notes,
      }: {
        id: number;
        researchDate?: string;
        paymentType?: 'oms' | 'paid';
        doctorName?: string;
        notes?: string;
      }
    ) => {
      return db.updateResearch(id, researchDate, paymentType, doctorName, notes);
    }
  );

  ipcMain.handle('research:delete', async (_, id: number) => {
    return db.deleteResearch(id);
  });

  ipcMain.handle('research:search', async (_, query: string, limit?: number) => {
    return db.searchResearches(query, limit);
  });

  // ==================== JOURNAL HANDLERS ====================

  ipcMain.handle('journal:getByDate', async (_, date: string) => {
    return db.getJournalByDate(date);
  });

  // ==================== WINDOW HANDLERS ====================

  ipcMain.on('window:focus', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.focus();
      mainWindow.show();
    }
  });

  ipcMain.on('window:minimize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.on('window:maximize', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on('window:close', () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });
}
