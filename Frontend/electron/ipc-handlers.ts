// ultrasound/frontend/electron/ipc-handlers.ts
import { ipcMain, BrowserWindow } from "electron";
import { DatabaseManager } from "./database/database";

export function setupAuthHandlers(mainWindow?: BrowserWindow): void {
  const db = DatabaseManager.getInstance();

  // ==================== AUTH HANDLERS ====================

  ipcMain.handle(
    "auth:register",
    async (
      _,
      {
        username,
        password,
        name,
        organization,
      }: { username: string; password: string; name: string; organization?: string }
    ) => {
      return await db.users.registerUser(username, password, name, organization);
    }
  );

  ipcMain.handle(
    "auth:login",
    async (_, { username, password }: { username: string; password: string }) => {
      return await db.users.loginUser(username, password);
    }
  );

  ipcMain.handle("auth:getUser", async (_, userId: number) => {
    return db.users.getUserById(userId);
  });

  ipcMain.handle(
    "auth:updateUser",
    async (
      _,
      {
        id,
        name,
        username,
        organization,
      }: { id: number; name: string; username: string; organization?: string }
    ) => {
      return await db.users.updateUser(id, name, username, organization);
    }
  );

  ipcMain.handle(
    "auth:changePassword",
    async (
      _,
      {
        userId,
        currentPassword,
        newPassword,
      }: { userId: number; currentPassword: string; newPassword: string }
    ) => {
      return await db.users.changePassword(userId, currentPassword, newPassword);
    }
  );

  // ==================== PATIENT HANDLERS ====================

  ipcMain.handle(
    "patient:findOrCreate",
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
      return db.patients.findOrCreatePatient(
        lastName,
        firstName,
        middleName,
        dateOfBirth
      );
    }
  );

  ipcMain.handle("patient:search", async (_, query: string, limit?: number) => {
    return db.patients.searchPatients(query, limit);
  });

  ipcMain.handle(
    "patient:getAll",
    async (_, limit?: number, offset?: number) => {
      return db.patients.getAllPatients(limit, offset);
    }
  );

  ipcMain.handle("patient:getById", async (_, id: number) => {
    return db.patients.findPatientById(id);
  });

  ipcMain.handle(
    "patient:update",
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
      return db.patients.updatePatient(
        id,
        lastName,
        firstName,
        middleName,
        dateOfBirth
      );
    }
  );

  ipcMain.handle("patient:delete", async (_, id: number) => {
    return db.patients.deletePatient(id);
  });

  // ==================== RESEARCH HANDLERS ====================

  ipcMain.handle(
    "research:create",
    async (
      _,
      {
        patientId,
        researchDate,
        paymentType,
        organization,
        doctorName,
        notes,
      }: {
        patientId: number;
        researchDate: string;
        paymentType: "oms" | "paid";
        organization?: string | null;
        doctorName?: string;
        notes?: string;
      }
    ) => {
      return db.researches.createResearch(
        patientId,
        researchDate,
        paymentType,
        organization ?? null,
        doctorName,
        notes
      );
    }
  );

  ipcMain.handle(
    "research:addStudy",
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
      return db.researches.addStudyToResearch(researchId, studyType, studyData);
    }
  );

  ipcMain.handle("research:getById", async (_, id: number) => {
    return db.researches.getResearchById(id);
  });

  ipcMain.handle(
    "research:getByPatientId",
    async (_, patientId: number, limit?: number, offset?: number) => {
      return db.researches.getResearchesByPatientId(patientId, limit, offset);
    }
  );

  ipcMain.handle(
    "research:getAll",
    async (_, limit?: number, offset?: number) => {
      return db.researches.getAllResearches(limit, offset);
    }
  );

  ipcMain.handle(
    "research:update",
    async (
      _,
      {
        id,
        researchDate,
        paymentType,
        organization,
        doctorName,
        notes,
      }: {
        id: number;
        researchDate?: string;
        paymentType?: "oms" | "paid";
        organization?: string | null;
        doctorName?: string;
        notes?: string;
      }
    ) => {
      return db.researches.updateResearch(
        id,
        researchDate,
        paymentType,
        organization ?? null,
        doctorName,
        notes
      );
    }
  );

  ipcMain.handle("research:delete", async (_, id: number) => {
    return db.researches.deleteResearch(id);
  });

  ipcMain.handle(
    "research:search",
    async (_, query: string, limit?: number) => {
      return db.researches.searchResearches(query, limit);
    }
  );

  // ==================== JOURNAL HANDLERS ====================

  ipcMain.handle("journal:getByDate", async (_, date: string) => {
    return db.journal.getJournalByDate(date);
  });

  // ==================== WINDOW HANDLERS ====================

  ipcMain.on("window:focus", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.focus();
      mainWindow.show();
    }
  });

  ipcMain.on("window:minimize", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.minimize();
    }
  });

  ipcMain.on("window:maximize", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      if (mainWindow.isMaximized()) {
        mainWindow.unmaximize();
      } else {
        mainWindow.maximize();
      }
    }
  });

  ipcMain.on("window:close", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });
}
