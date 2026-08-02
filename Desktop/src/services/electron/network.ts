import type { NetworkAPI } from "../../../electron/preload";

/**
 * Адаптер над window.networkAPI (отправка экспорта по сети).
 */
export const networkService = {
  sendExport: (data: Parameters<NetworkAPI["sendExport"]>[0]) =>
    window.networkAPI.sendExport(data),
} satisfies NetworkAPI;