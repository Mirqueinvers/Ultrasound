import type { DatabaseAPI } from "../../../electron/preload";

/**
 * Адаптер над window.databaseAPI (только статистика).
 */
export const databaseService = {
  getStatistics: (startDate?: string, endDate?: string, doctorName?: string) =>
    window.databaseAPI?.getStatistics(startDate, endDate, doctorName),
} satisfies DatabaseAPI;