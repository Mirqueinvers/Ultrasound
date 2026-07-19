// ultrasound/frontend/electron/ipc-handlers.ts
import { app, ipcMain, BrowserWindow, dialog } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
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

  // ==================== PROTOCOL FILE HANDLERS (конструктор) ====================

  const BUILTIN_PROTOCOLS_DIR = path.join(__dirname, '..', 'src', 'constructor', 'definitions')
  const CUSTOM_PROTOCOLS_DIR = path.join(BUILTIN_PROTOCOLS_DIR, 'custom')

  // Создаём папку custom если нет
  ;(async () => {
    try { await fs.mkdir(CUSTOM_PROTOCOLS_DIR, { recursive: true }) } catch { /* ignore */ }
  })()

  ipcMain.handle('protocolFile:list', async () => {
    const result: Array<{ id: string; selectionLabel: string; isBuiltin: boolean }> = []
    
    // Читаем builtin протоколы (obp.json и другие в корне definitions/)
    try {
      const files = await fs.readdir(BUILTIN_PROTOCOLS_DIR)
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        if (file === 'custom' || file.startsWith('.')) continue
        const filePath = path.join(BUILTIN_PROTOCOLS_DIR, file)
        const stat = await fs.stat(filePath)
        if (stat.isDirectory()) continue
        try {
          const content = JSON.parse(await fs.readFile(filePath, 'utf8'))
          if (content.id && content.selectionLabel) {
            result.push({
              id: content.id,
              selectionLabel: content.selectionLabel,
              isBuiltin: true,
            })
          }
        } catch { /* skip invalid json */ }
      }
    } catch { /* ignore */ }

    // Читаем кастомные протоколы из custom/
    try {
      const files = await fs.readdir(CUSTOM_PROTOCOLS_DIR)
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        const filePath = path.join(CUSTOM_PROTOCOLS_DIR, file)
        try {
          const content = JSON.parse(await fs.readFile(filePath, 'utf8'))
          if (content.id && content.selectionLabel) {
            result.push({
              id: content.id,
              selectionLabel: content.selectionLabel,
              isBuiltin: false,
            })
          }
        } catch { /* skip invalid json */ }
      }
    } catch { /* ignore */ }

    return result
  })

  ipcMain.handle('protocolFile:load', async (_, id: string) => {
    // Сначала ищем в builtin
    try {
      const files = await fs.readdir(BUILTIN_PROTOCOLS_DIR)
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        if (file === 'custom' || file.startsWith('.')) continue
        const filePath = path.join(BUILTIN_PROTOCOLS_DIR, file)
        const stat = await fs.stat(filePath)
        if (stat.isDirectory()) continue
        try {
          const content = JSON.parse(await fs.readFile(filePath, 'utf8'))
          if (content.id === id) return content
        } catch { /* skip */ }
      }
    } catch { /* ignore */ }

    // Ищем в custom
    try {
      const files = await fs.readdir(CUSTOM_PROTOCOLS_DIR)
      for (const file of files) {
        if (!file.endsWith('.json')) continue
        const filePath = path.join(CUSTOM_PROTOCOLS_DIR, file)
        try {
          const content = JSON.parse(await fs.readFile(filePath, 'utf8'))
          if (content.id === id) return content
        } catch { /* skip */ }
      }
    } catch { /* ignore */ }

    return null
  })

  ipcMain.handle('protocolFile:save', async (_, data: { id: string; selectionLabel: string; data: any }) => {
    try {
      const fileName = `${data.id.replace(/[^a-zA-Z0-9_-]/g, '_')}.json`
      const filePath = path.join(CUSTOM_PROTOCOLS_DIR, fileName)
      await fs.writeFile(filePath, JSON.stringify(data.data, null, 2), 'utf8')
      return { success: true }
    } catch (error) {
      console.error('Save protocol error:', error)
      return { success: false, message: 'Не удалось сохранить протокол' }
    }
  })

  ipcMain.handle('protocolFile:exportDialog', async (_, data: { id: string; data: any }) => {
    try {
      if (!mainWindow) {
        return { success: false, message: 'Окно не инициализировано' }
      }
      const result = await dialog.showSaveDialog(mainWindow, {
        title: 'Экспорт протокола',
        defaultPath: `${data.id || 'protocol'}.json`,
        filters: [{ name: 'JSON files', extensions: ['json'] }],
      })

      if (result.canceled || !result.filePath) {
        return { success: false, canceled: true }
      }

      await fs.writeFile(result.filePath, JSON.stringify(data.data, null, 2), 'utf8')
      return { success: true, filePath: result.filePath }
    } catch (error) {
      console.error('Export protocol error:', error)
      return { success: false, message: 'Не удалось экспортировать протокол' }
    }
  })

  ipcMain.handle('protocolFile:importDialog', async () => {
    try {
      if (!mainWindow) {
        return { success: false, message: 'Окно не инициализировано' }
      }
      const result = await dialog.showOpenDialog(mainWindow, {
        title: 'Импорт протокола',
        filters: [{ name: 'JSON files', extensions: ['json'] }],
        properties: ['openFile'],
      })

      if (result.canceled || result.filePaths.length === 0) {
        return { success: false, canceled: true }
      }

      const content = JSON.parse(await fs.readFile(result.filePaths[0], 'utf8'))
      return { success: true, data: content }
    } catch (error) {
      console.error('Import protocol error:', error)
      return { success: false, message: 'Не удалось импортировать протокол' }
    }
  })

  ipcMain.on("window:close", () => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.close();
    }
  });
}
