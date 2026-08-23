import type { ImportMappingAPI } from "../../../electron/preload";

/**
 * Адаптер над window.importMappingAPI.
 */
export const importMappingService = {
  getMappings: (userId: string) => window.importMappingAPI.getMappings(userId),
  upsertMapping: (data: Parameters<ImportMappingAPI["upsertMapping"]>[0]) =>
    window.importMappingAPI.upsertMapping(data),
  deleteMapping: (id: string) => window.importMappingAPI.deleteMapping(id),
  resetDefaultMappings: (userId: string) =>
    window.importMappingAPI.resetDefaultMappings(userId),
};