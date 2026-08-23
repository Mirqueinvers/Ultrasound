/**
 * IPC-мост между React-компонентами Registry и центральным API-сервером.
 *
 * Этап 3.3 плана перехода на PostgreSQL: компоненты React больше не ходят
 * в собственный HTTP-сервер Registry (src/api.ts), а обращаются к центральному
 * API через IPC. Обработчики делегируют запросы слою данных `src/db.ts`,
 * который уже работает с центральным сервером (PostgreSQL + Prisma).
 *
 * Renderer получает доступ к этим функциям через `window.registryAPI`
 * (см. preload.ts и src/electron.d.ts).
 */

import { ipcMain } from "electron";
import type { Patient } from "../src/db";
import {
  getAppointmentsByMonth,
  getAppointmentsByDate,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getDoctors,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} from "../src/db";

/** Данные пациента для создания/обновления записи (без id — его выдаёт сервер). */
type PatientInput = Omit<Patient, "id">;

export function registerRegistryIpc(): void {
  // ===== Записи (Appointments) =====

  ipcMain.handle(
    "registry:getAppointmentsByMonth",
    async (_event, month: number, year: number) =>
      getAppointmentsByMonth(month, year)
  );

  ipcMain.handle(
    "registry:getAppointmentsByDate",
    async (_event, date: string) => getAppointmentsByDate(date)
  );

  ipcMain.handle(
    "registry:createAppointment",
    async (
      _event,
      patientData: PatientInput,
      appointmentDate: string,
      studies: string[]
    ) => createAppointment(patientData, appointmentDate, studies)
  );

  ipcMain.handle(
    "registry:updateAppointment",
    async (
      _event,
      id: string,
      studies: string[],
      patientData?: Partial<Omit<PatientInput, "department">>
    ) => updateAppointment(id, studies, patientData)
  );

  ipcMain.handle("registry:deleteAppointment", async (_event, id: string) =>
    deleteAppointment(id)
  );

  // ===== Врачи (Doctors) =====

  ipcMain.handle("registry:getDoctors", async () => getDoctors());

  ipcMain.handle(
    "registry:createDoctor",
    async (
      _event,
      name: string,
      maxPatientsPerDay: number,
      workDays: number[]
    ) => createDoctor(name, maxPatientsPerDay, workDays)
  );

  ipcMain.handle(
    "registry:updateDoctor",
    async (
      _event,
      id: string,
      name: string,
      maxPatientsPerDay: number,
      workDays: number[]
    ) => updateDoctor(id, name, maxPatientsPerDay, workDays)
  );

  ipcMain.handle("registry:deleteDoctor", async (_event, id: string) =>
    deleteDoctor(id)
  );
}
