// ultrasound/frontend/electron/ipc-handlers.ts
import { app, ipcMain, BrowserWindow, dialog } from "electron";
import { promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";
import { URL } from "node:url";
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

  ipcMain.handle(
    "journal:getByPeriod",
    async (_, startDate: string, endDate: string) => {
      return db.journal.getJournalByPeriod(startDate, endDate);
    }
  );

  ipcMain.handle("journal:getDoctorNames", async () => {
    return db.journal.getDoctorNames();
  });

  ipcMain.handle(
    "file:saveHtml",
    async (
      _,
      {
        content,
        defaultPath,
      }: { content: string; defaultPath?: string }
    ) => {
      try {
        if (!mainWindow) {
          return { success: false, message: "Окно не инициализировано" };
        }
        const result = await dialog.showSaveDialog(mainWindow, {
          title: "Сохранить протокол исследования",
          defaultPath: defaultPath || "uzi-protocol.html",
          filters: [{ name: "HTML files", extensions: ["html", "htm"] }],
        });

        if (result.canceled || !result.filePath) {
          return { success: false, canceled: true };
        }

        await fs.writeFile(result.filePath, content, "utf8");

        return { success: true, filePath: result.filePath };
      } catch (error) {
        console.error("Save HTML error:", error);
        return {
          success: false,
          message: "Не удалось сохранить HTML-файл",
        };
      }
    }
  );

  ipcMain.handle("protocol:getPrinters", async () => {
    try {
      const targetWindow = mainWindow && !mainWindow.isDestroyed() ? mainWindow : undefined;
      const printers = targetWindow ? await targetWindow.webContents.getPrintersAsync() : [];
      return {
        success: true,
        printers: printers.map((printer) => ({
          name: printer.name,
          isDefault: false,
        })),
      };
    } catch (error) {
      console.error("Get printers error:", error);
      return {
        success: false,
        printers: [],
        message: "Не удалось получить список принтеров",
      };
    }
  });

  ipcMain.handle(
    "protocol:printHtml",
    async (
      _event,
      data: { content: string; title?: string; printerName?: string }
    ) => {
      const printWindow = new BrowserWindow({
        show: false,
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: false,
        },
      });
      const tempHtmlPath = path.join(
        app.getPath("temp"),
        `ultrasound-print-${crypto.randomUUID()}.html`,
      );

      try {
        const html = data.content.trim();
        const pageTitle = data.title?.trim() || "Ultrasound protocol";
        const payload = html || "<html><head><title>Ultrasound protocol</title></head><body></body></html>";
        const targetHtml = payload.includes("<html")
          ? payload
          : `<!doctype html><html><head><meta charset="utf-8"><title>${pageTitle}</title></head><body>${payload}</body></html>`;

        await fs.writeFile(tempHtmlPath, targetHtml, "utf8");
        printWindow.setTitle(pageTitle);
        await printWindow.loadFile(tempHtmlPath);

        await printWindow.webContents.executeJavaScript(
          "document.fonts ? document.fonts.ready.then(() => true) : Promise.resolve(true)"
        );

        await new Promise((resolve) => setTimeout(resolve, 250));

        const printers = (await printWindow.webContents.getPrintersAsync()) as Array<{
          name: string;
        }>;
        const selectedPrinter = data.printerName?.trim()
          ? printers.find((printer) => printer.name === data.printerName!.trim())
          : printers[0];
        const deviceName = selectedPrinter?.name?.trim() || undefined;

        const printed = await new Promise<boolean>((resolve) => {
          printWindow.webContents.print(
            {
              silent: true,
              printBackground: true,
              deviceName,
            },
            (success, failureReason) => {
              if (success) {
                resolve(true);
                return;
              }

              console.error("Silent print failure:", {
                deviceName,
                failureReason,
              });
              resolve(false);
            }
          );
        });

        if (!printed) {
          return {
            success: false,
            message: "Не удалось отправить документ на печать",
          };
        }

        return { success: true };
      } catch (error) {
        console.error("Silent print error:", error);
        return {
          success: false,
          message: "Не удалось отправить документ на печать",
        };
      } finally {
        try {
          await fs.unlink(tempHtmlPath);
        } catch {
          // Ignore cleanup errors.
        }
        if (!printWindow.isDestroyed()) {
          printWindow.close();
        }
      }
    }
  );

  // ==================== STATISTICS HANDLERS ====================

  ipcMain.handle("database:getStatistics", async (_, startDate?: string, endDate?: string, doctorName?: string) => {
    try {
      const data = db.statistics.getStatistics(startDate, endDate, doctorName);
      return { success: true, data };
    } catch (error) {
      console.error("Statistics error:", error);
      return { success: false, message: "Ошибка при получении статистики" };
    }
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

  // ==================== NETWORK HANDLERS ====================

  ipcMain.handle(
    "network:sendExport",
    async (
      _,
      {
        targetIp,
        html,
        fileName,
      }: {
        targetIp: string;
        html: string;
        fileName?: string;
      }
    ) => {
      try {
        const normalizedIp = targetIp.trim();
        if (!normalizedIp) {
          return { success: false, message: "IP-адрес не указан" };
        }

        const url = new URL(`http://${normalizedIp}:38243/receive-export`);

        const response = await fetch(url.toString(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            html,
            fileName: fileName || "uzi-protocol.html",
          }),
        });

        if (!response.ok) {
          let errorMessage = `Ошибка сервера: ${response.status}`;
          try {
            const errorBody = (await response.json()) as { message?: string };
            if (errorBody.message) {
              errorMessage = errorBody.message;
            }
          } catch {
            // ignore parse error
          }
          return { success: false, message: errorMessage };
        }

        const result = (await response.json()) as {
          success?: boolean;
          imported?: number;
          skipped?: number;
          message?: string;
        };
        return {
          success: true,
          imported: result.imported ?? 0,
          skipped: result.skipped ?? 0,
          message: result.message,
        };
      } catch (error) {
        console.error("Network export error:", error);
        const message =
          error instanceof Error
            ? `Не удалось подключиться к ${targetIp}: ${error.message}`
            : "Не удалось отправить данные по сети";
        return { success: false, message };
      }
    }
  );
}
