import type { PatientSearchAPI } from "../../../electron/preload";

/**
 * Адаптер над window.patientSearchAPI.
 */
export const patientSearchService = {
  search: (query: string) => window.patientSearchAPI.search(query),
} satisfies PatientSearchAPI;