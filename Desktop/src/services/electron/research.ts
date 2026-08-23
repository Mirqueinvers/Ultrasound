import type { ResearchAPI } from "../../../electron/preload";

/**
 * Адаптер над window.researchAPI.
 */
export const researchService = {
  create: (data: Parameters<ResearchAPI["create"]>[0]) =>
    window.researchAPI.create(data),
  addStudy: (data: Parameters<ResearchAPI["addStudy"]>[0]) =>
    window.researchAPI.addStudy(data),
  getById: (id: string) => window.researchAPI.getById(id),
  getByPatientId: (patientId: string, limit?: number, offset?: number) =>
    window.researchAPI.getByPatientId(patientId, limit, offset),
  getAll: (limit?: number, offset?: number) =>
    window.researchAPI.getAll(limit, offset),
  update: (data: Parameters<ResearchAPI["update"]>[0]) =>
    window.researchAPI.update(data),
  delete: (id: string) => window.researchAPI.delete(id),
  search: (query: string, limit?: number) =>
    window.researchAPI.search(query, limit),
};