import type { FileAPI } from "../../../electron/preload";

/**
 * Адаптер над window.fileAPI.
 */
export const fileService = {
  saveHtml: (data: Parameters<FileAPI["saveHtml"]>[0]) =>
    window.fileAPI.saveHtml(data),
};