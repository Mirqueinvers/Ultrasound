import type { MedisonAPI } from "../../../electron/preload";

/**
 * Адаптер над window.medisonAPI.
 * API доступен только в Electron (в браузере может отсутствовать).
 */
export const medisonService = {
  startWatching: (): Promise<{ success: boolean }> =>
    window.medisonAPI?.startWatching() ?? Promise.resolve({ success: false }),
  stopWatching: (): Promise<{ success: boolean }> =>
    window.medisonAPI?.stopWatching() ?? Promise.resolve({ success: false }),
  scanAndRead: (): Promise<{
    success: boolean;
    content?: string;
    filePath?: string;
    filename?: string;
    message?: string;
  }> =>
    window.medisonAPI?.scanAndRead() ?? Promise.resolve({ success: false }),
  onXmlFound: (handler: (data: { filePath: string; filename: string; content: string }) => void): (() => void) =>
    window.medisonAPI?.onXmlFound(handler) ?? (() => {}),
} satisfies MedisonAPI;