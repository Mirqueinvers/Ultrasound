import type { DatabaseAPI } from "../../../electron/preload";

/**
 * Адаптер над window.databaseAPI (только статистика).
 * API доступен только в Electron (в браузере может отсутствовать).
 */
export const databaseService = {
  getStatistics: (startDate?: string, endDate?: string, doctorName?: string) =>
    window.databaseAPI?.getStatistics(startDate, endDate, doctorName),
  isAvailable: () => !!window.databaseAPI,
} satisfies DatabaseAPI & { isAvailable: () => boolean };