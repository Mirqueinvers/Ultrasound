import type {
  ServerConfigAPI,
  ServerConfigInfo,
} from "../../../electron/contracts";

/**
 * Сервис настройки адреса центрального сервера (этап 2.5).
 * Доступен только в Electron (в браузере отсутствует — isAvailable() === false).
 */
export const serverConfigService = {
  getConfig: (): Promise<ServerConfigInfo> =>
    window.serverConfigAPI?.getConfig() ??
    Promise.resolve({ serverUrl: "", configured: false }),

  saveConfig: (config: {
    serverUrl: string;
    lastLoginUsername?: string;
  }): Promise<{ success: boolean; message?: string }> =>
    window.serverConfigAPI?.saveConfig(config) ??
    Promise.resolve({ success: false, message: "API недоступно" }),

  isAvailable: () => !!window.serverConfigAPI,
} satisfies ServerConfigAPI & { isAvailable: () => boolean };