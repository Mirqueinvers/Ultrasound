import type { PatientAPI } from "../../../electron/preload";

/**
 * Адаптер над window.patientAPI.
 */
export const patientService = {
  findOrCreate: (data: Parameters<PatientAPI["findOrCreate"]>[0]) =>
    window.patientAPI.findOrCreate(data),
  search: (query: string, limit?: number) =>
    window.patientAPI.search(query, limit),
  getAll: (limit?: number, offset?: number) =>
    window.patientAPI.getAll(limit, offset),
  getById: (id: number) => window.patientAPI.getById(id),
  update: (data: Parameters<PatientAPI["update"]>[0]) =>
    window.patientAPI.update(data),
  delete: (id: number) => window.patientAPI.delete(id),
};