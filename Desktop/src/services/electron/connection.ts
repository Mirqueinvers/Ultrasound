import type {
  ConnectionAPI,
  ConnectionStatus,
  ConnectionStatusInfo,
  OfflineCacheSummary,
} from "../../../electron/contracts";

/**
 * Сервис статуса подключения к центральному серверу (этап 2.3).
 * Доступен только в Electron (в браузере отсутствует — isAvailable() === false).
 */
export const connectionService = {
  getStatus: (): Promise<ConnectionStatusInfo> =>
    window.connectionAPI?.getStatus() ??
    Promise.resolve({ status: "not-configured", lastCheckedAt: null }),

  getOfflineCacheSummary: (): Promise<OfflineCacheSummary> =>
    window.connectionAPI?.getOfflineCacheSummary() ??
    Promise.resolve({
      patients: 0,
      researches: 0,
      journal: 0,
      statistics: 0,
      protocols: 0,
    }),

  onStatusChange: (handler: (status: ConnectionStatus) => void): (() => void) => {
    if (!window.connectionAPI) return () => {};
    return window.connectionAPI.onStatusChange(handler);
  },

  isAvailable: () => !!window.connectionAPI,
} satisfies Partial<ConnectionAPI> & {
  isAvailable: () => boolean;
};