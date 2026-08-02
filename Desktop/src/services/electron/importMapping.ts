import type { ImportMappingAPI } from "../../../electron/preload";

/**
 * Адаптер над window.importMappingAPI.
 */
export const importMappingService = {
  getMappings: (userId: number) => window.importMappingAPI.getMappings(userId),
  upsertMapping: (data: Parameters<ImportMappingAPI["upsertMapping"]>[0]) =>
    window.importMappingAPI.upsertMapping(data),
  deleteMapping: (id: number) => window.importMappingAPI.deleteMapping(id),
  resetDefaultMappings: (userId: number) =>
    window.importMappingAPI.resetDefaultMappings(userId),
};