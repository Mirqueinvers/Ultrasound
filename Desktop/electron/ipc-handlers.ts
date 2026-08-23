// ultrasound/frontend/electron/ipc-handlers.ts
// Этап 2.2: обработчики IPC делегируют запросы центральному API-серверу (Server/).
// Интерфейс `window.api.*` для Renderer сохранён без изменений.
import { app, ipcMain, BrowserWindow, dialog } from "electron";
import { promises as fs } from "node:fs";
import path from "node:path";
import { URL } from "node:url";
import {
  apiClient,
  ApiError,
} from "./apiClient";
import { saveAuthToken, saveServerConfig } from "./apiConfig";

export function setupAuthHandlers(mainWindow?: BrowserWindow): void {
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
      try {
        const result = await apiClient.auth.register({
          username,
          password,
          name,
          organization,
        });
        return {
          success: true,
          message: result.message ?? "Регистрация успешна",
          userId: result.data?.userId,
        };
      } catch (err) {
        return {
          success: false,
          message: err instanceof ApiError ? err.message : "Ошибка при регистрации",
        };
      }
    }
  );

  ipcMain.handle(
    "auth:login",
    async (_, { username, password }: { username: string; password: string }) => {
      try {
        const result = await apiClient.auth.login({ username, password });
        apiClient.setToken(result.token);
        await saveAuthToken(result.token);
        await saveServerConfig({ lastLoginUsername: username });
        return {
          success: true,
          message: result.message ?? "Вход выполнен успешно",
          user: {
            id: result.user.id,
            username: result.user.username,
            name: result.user.name,
            organization: result.user.organization,
          },
        };
      } catch (err) {
        return {
          success: false,
          message: err instanceof ApiError ? err.message : "Ошибка при входе",
        };
      }
    }
  );

  ipcMain.handle("auth:getUser", async (_, userId: string) => {
    try {
      const me = await apiClient.auth.getMe();
      // Сервер возвращает текущего пользователя по токену; сверяем с запрошенным id.
      if (me && me.id === userId) {
        return {
          id: me.id,
          username: me.username,
          name: me.name,
          organization: me.organization,
        };
      }
      return null;
    } catch (err) {
      console.error("auth:getUser error:", err);
      return null;
    }
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
      }: { id: string; name: string; username: string; organization?: string }
    ) => {
      try {
        const me = await apiClient.auth.getMe();
        if (!me || me.id !== id) {
          return { success: false, message: "Пользователь не найден" };
        }
        const result = await apiClient.auth.updateProfile({
          name,
          username,
          organization: organization ?? null,
        });
        return {
          success: true,
          message: result.message ?? "Профиль успешно обновлён",
        };
      } catch (err) {
        return {
          success: false,
          message:
            err instanceof ApiError ? err.message : "Ошибка при обновлении профиля",
        };
      }
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
      }: { userId: string; currentPassword: string; newPassword: string }
    ) => {
      try {
        const me = await apiClient.auth.getMe();
        if (!me || me.id !== userId) {
          return { success: false, message: "Пользователь не найден" };
        }
        const result = await apiClient.auth.changePassword({
          currentPassword,
          newPassword,
        });
        return {
          success: true,
          message: result.message ?? "Пароль успешно изменён",
        };
      } catch (err) {
        return {
          success: false,
          message:
            err instanceof ApiError ? err.message : "Ошибка при смене пароля",
        };
      }
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
      try {
        const result = await apiClient.patients.findOrCreate({
          lastName,
          firstName,
          middleName,
          dateOfBirth,
        });
        const patient = result.data?.patient;
        return {
          success: true,
          message: result.message ?? "Пациент найден",
          patient: patient
            ? {
                id: patient.id,
                last_name: patient.last_name,
                first_name: patient.first_name,
                middle_name: patient.middle_name ?? undefined,
                date_of_birth: patient.date_of_birth,
                created_at: patient.created_at,
                updated_at: patient.updated_at,
              }
            : undefined,
        };
      } catch (err) {
        return {
          success: false,
          message:
            err instanceof ApiError ? err.message : "Ошибка при поиске/создании пациента",
        };
      }
    }
  );

  ipcMain.handle(
    "patient:search",
    async (_, query: string, limit?: number) => {
      try {
        const result = await apiClient.patients.search(query, limit);
        return result.patients.map((p) => ({
          id: p.id,
          last_name: p.last_name,
          first_name: p.first_name,
          middle_name: p.middle_name ?? undefined,
          date_of_birth: p.date_of_birth,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));
      } catch (err) {
        console.error("patient:search error:", err);
        return [];
      }
    }
  );

  ipcMain.handle(
    "patient:getAll",
    async (_, limit?: number, offset?: number) => {
      try {
        const result = await apiClient.patients.getAll(limit, offset);
        return result.patients.map((p) => ({
          id: p.id,
          last_name: p.last_name,
          first_name: p.first_name,
          middle_name: p.middle_name ?? undefined,
          date_of_birth: p.date_of_birth,
          created_at: p.created_at,
          updated_at: p.updated_at,
        }));
      } catch (err) {
        console.error("patient:getAll error:", err);
        return [];
      }
    }
  );

  ipcMain.handle("patient:getById", async (_, id: string) => {
    try {
      const patient = await apiClient.patients.getById(id);
      return {
        id: patient.id,
        last_name: patient.last_name,
        first_name: patient.first_name,
        middle_name: patient.middle_name ?? undefined,
        date_of_birth: patient.date_of_birth,
        created_at: patient.created_at,
        updated_at: patient.updated_at,
      };
    } catch (err) {
      console.error("patient:getById error:", err);
      return undefined;
    }
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
        id: string;
        lastName: string;
        firstName: string;
        middleName: string | null;
        dateOfBirth: string;
      }
    ) => {
      try {
        await apiClient.patients.update(id, {
          lastName,
          firstName,
          middleName,
          dateOfBirth,
        });
        return { success: true, message: "Данные пациента обновлены" };
      } catch (err) {
        return {
          success: false,
          message:
            err instanceof ApiError ? err.message : "Ошибка при обновлении данных пациента",
        };
      }
    }
  );

  ipcMain.handle("patient:delete", async (_, id: string) => {
    try {
      const result = await apiClient.patients.delete(id);
      return {
        success: true,
        message: result.message ?? "Пациент и его исследования удалены",
      };
    } catch (err) {
      return {
        success: false,
        message:
          err instanceof ApiError ? err.message : "Ошибка при удалении пациента",
      };
    }
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
        patientId: string;
        researchDate: string;
        paymentType: "oms" | "paid";
        organization?: string | null;
        doctorName?: string;
        notes?: string;
      }
    ) => {
      try {
        const result = await apiClient.researches.create({
          patientId,
          researchDate,
          paymentType,
          organization: organization ?? null,
          doctorName: doctorName ?? null,
          notes: notes ?? null,
        });
        return {
          success: true,
          message: result.message ?? "Исследование создано",
          researchId: result.data?.researchId,
        };
      } catch (err) {
        return {
          success: false,
          message:
            err instanceof ApiError ? err.message : "Ошибка при создании исследования",
        };
      }
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
        researchId: string;
        studyType: string;
        studyData: object;
      }
    ) => {
      try {
        const result = await apiClient.researches.addStudy(researchId, {
          studyType,
          studyData,
        });
        return {
          success: true,
          message: result.message ?? "Исследование добавлено",
          studyId: result.data?.studyId,
        };
      } catch (err) {
        return {
          success: false,
          message:
            err instanceof ApiError ? err.message : "Ошибка при добавлении исследования",
        };
      }
    }
  );

  ipcMain.handle("research:getById", async (_, id: string) => {
    try {
      const research = await apiClient.researches.getById(id);
      if (!research) return null;
      return {
        id: research.id,
        patient_id: research.patient_id,
        research_date: research.research_date,
        payment_type: research.payment_type,
        organization: research.organization ?? undefined,
        doctor_name: research.doctor_name ?? undefined,
        notes: research.notes ?? undefined,
        created_at: research.created_at,
        updated_at: research.updated_at,
        studies: (research.studies ?? []).map((s) => ({
          id: s.id,
          research_id: s.research_id,
          study_type: s.study_type,
          study_data: s.study_data,
          created_at: s.created_at,
        })),
      };
    } catch (err) {
      console.error("research:getById error:", err);
      return null;
    }
  });

  ipcMain.handle(
    "research:getByPatientId",
    async (_, patientId: string, limit?: number, offset?: number) => {
      try {
        const result = await apiClient.researches.getByPatientId(
          patientId,
          limit,
          offset
        );
        return result.researches.map((research) => ({
          id: research.id,
          patient_id: research.patient_id,
          research_date: research.research_date,
          payment_type: research.payment_type,
          organization: research.organization ?? undefined,
          doctor_name: research.doctor_name ?? undefined,
          notes: research.notes ?? undefined,
          created_at: research.created_at,
          updated_at: research.updated_at,
          studies: (research.studies ?? []).map((s) => ({
            id: s.id,
            research_id: s.research_id,
            study_type: s.study_type,
            study_data: s.study_data,
            created_at: s.created_at,
          })),
        }));
      } catch (err) {
        console.error("research:getByPatientId error:", err);
        return [];
      }
    }
  );

  ipcMain.handle(
    "research:getAll",
    async (_, limit?: number, offset?: number) => {
      try {
        const result = await apiClient.researches.getAll(limit, offset);
        return result.researches.map((research) => ({
          id: research.id,
          patient_id: research.patient_id,
          research_date: research.research_date,
          payment_type: research.payment_type,
          organization: research.organization ?? undefined,
          doctor_name: research.doctor_name ?? undefined,
          notes: research.notes ?? undefined,
          created_at: research.created_at,
          updated_at: research.updated_at,
          ...(research.patient
            ? {
                last_name: research.patient.last_name,
                first_name: research.patient.first_name,
                middle_name: research.patient.middle_name,
                date_of_birth: research.patient.date_of_birth,
              }
            : {}),
          studies: (research.studies ?? []).map((s) => ({
            id: s.id,
            research_id: s.research_id,
            study_type: s.study_type,
            study_data: s.study_data,
            created_at: s.created_at,
          })),
        }));
      } catch (err) {
        console.error("research:getAll error:", err);
        return [];
      }
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
        id: string;
        researchDate?: string;
        paymentType?: "oms" | "paid";
        organization?: string | null;
        doctorName?: string;
        notes?: string;
      }
    ) => {
      try {
        await apiClient.researches.update(id, {
          researchDate,
          paymentType,
          organization,
          doctorName,
          notes,
        });
        return { success: true, message: "Исследование обновлено" };
      } catch (err) {
        return {
          success: false,
          message:
            err instanceof ApiError ? err.message : "Ошибка при обновлении исследования",
        };
      }
    }
  );

  ipcMain.handle("research:delete", async (_, id: string) => {
    try {
      const result = await apiClient.researches.delete(id);
      return {
        success: true,
        message: result.message ?? "Исследование удалено",
      };
    } catch (err) {
      return {
        success: false,
        message:
          err instanceof ApiError ? err.message : "Ошибка при удалении исследования",
      };
    }
  });

  ipcMain.handle(
    "research:search",
    async (_, query: string, limit?: number) => {
      try {
        const result = await apiClient.researches.search(query, limit);
        return result.researches.map((research) => ({
          id: research.id,
          patient_id: research.patient_id,
          research_date: research.research_date,
          payment_type: research.payment_type,
          organization: research.organization ?? undefined,
          doctor_name: research.doctor_name ?? undefined,
          notes: research.notes ?? undefined,
          created_at: research.created_at,
          updated_at: research.updated_at,
          ...(research.patient
            ? {
                last_name: research.patient.last_name,
                first_name: research.patient.first_name,
                middle_name: research.patient.middle_name,
                date_of_birth: research.patient.date_of_birth,
              }
            : {}),
          studies: (research.studies ?? []).map((s) => ({
            id: s.id,
            research_id: s.research_id,
            study_type: s.study_type,
            study_data: s.study_data,
            created_at: s.created_at,
          })),
        }));
      } catch (err) {
        console.error("research:search error:", err);
        return [];
      }
    }
  );

  // ==================== JOURNAL HANDLERS ====================

  ipcMain.handle("journal:getByDate", async (_, date: string) => {
    try {
      const entries = await apiClient.journal.getByDate(date);
      return entries.map((entry) => ({
        patient: {
          id: entry.patient.id,
          last_name: entry.patient.last_name,
          first_name: entry.patient.first_name,
          middle_name: entry.patient.middle_name ?? undefined,
          date_of_birth: entry.patient.date_of_birth,
          created_at: entry.patient.created_at,
          updated_at: entry.patient.updated_at,
        },
        researches: entry.researches.map((r) => ({
          id: r.id,
          patient_id: r.patient_id,
          research_date: r.research_date,
          payment_type: r.payment_type,
          doctor_name: r.doctor_name ?? undefined,
          notes: r.notes ?? undefined,
          created_at: r.created_at,
          updated_at: r.updated_at,
          study_types: r.study_types,
        })),
      }));
    } catch (err) {
      console.error("journal:getByDate error:", err);
      return [];
    }
  });

  ipcMain.handle(
    "journal:getByPeriod",
    async (_, startDate: string, endDate: string) => {
      try {
        const entries = await apiClient.journal.getByPeriod(startDate, endDate);
        return entries.map((entry) => ({
          patient: {
            id: entry.patient.id,
            last_name: entry.patient.last_name,
            first_name: entry.patient.first_name,
            middle_name: entry.patient.middle_name ?? undefined,
            date_of_birth: entry.patient.date_of_birth,
            created_at: entry.patient.created_at,
            updated_at: entry.patient.updated_at,
          },
          researches: entry.researches.map((r) => ({
            id: r.id,
            patient_id: r.patient_id,
            research_date: r.research_date,
            payment_type: r.payment_type,
            doctor_name: r.doctor_name ?? undefined,
            notes: r.notes ?? undefined,
            created_at: r.created_at,
            updated_at: r.updated_at,
            study_types: r.study_types,
          })),
        }));
      } catch (err) {
        console.error("journal:getByPeriod error:", err);
        return [];
      }
    }
  );

  ipcMain.handle("journal:getDoctorNames", async () => {
    try {
      return await apiClient.journal.getDoctors();
    } catch (err) {
      console.error("journal:getDoctorNames error:", err);
      return [];
    }
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

  ipcMain.handle(
    "database:getStatistics",
    async (_, startDate?: string, endDate?: string, doctorName?: string) => {
      try {
        const result = await apiClient.statistics.getStatistics(
          startDate,
          endDate,
          doctorName
        );
        return { success: true, data: result.data };
      } catch (err) {
        console.error("Statistics error:", err);
        return { success: false, message: "Ошибка при получении статистики" };
      }
    }
  );

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

  // ==================== DEFAULTS HANDLERS ====================

  const defaultsFilePath = path.join(app.getPath("userData"), "defaultValues.json");

  ipcMain.handle("defaults:load", async () => {
    try {
      const data = await fs.readFile(defaultsFilePath, "utf8");
      return { success: true, data: JSON.parse(data) as Record<string, unknown> };
    } catch {
      return { success: true, data: {} };
    }
  });

  ipcMain.handle("defaults:save", async (_, updates: Record<string, unknown>) => {
    try {
      const existing = await fs.readFile(defaultsFilePath, "utf8").then(
        (d) => JSON.parse(d) as Record<string, unknown>,
        () => ({}) as Record<string, unknown>,
      );
      const merged = { ...existing, ...updates };
      await fs.writeFile(defaultsFilePath, JSON.stringify(merged, null, 2), "utf8");
      return { success: true };
    } catch (error) {
      console.error("Defaults save error:", error);
      return { success: false, message: "Не удалось сохранить значения по умолчанию" };
    }
  });

  ipcMain.handle("defaults:reset", async () => {
    try {
      await fs.writeFile(defaultsFilePath, "{}", "utf8");
      return { success: true };
    } catch (error) {
      console.error("Defaults reset error:", error);
      return { success: false, message: "Не удалось сбросить значения по умолчанию" };
    }
  });

  // ==================== REGISTRY APPOINTMENTS HANDLERS ====================
  // Этап 2.6: кэш registry_appointments удалён — записи регистратуры
  // читаются напрямую из центральной БД через API-сервер.

  ipcMain.handle("registry:getAppointmentsByDate", async (_, date: string) => {
    try {
      return await apiClient.appointments.getByDate(date);
    } catch (err) {
      console.error("registry:getAppointmentsByDate error:", err);
      return [];
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