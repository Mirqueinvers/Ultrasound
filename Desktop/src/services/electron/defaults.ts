/**
 * Адаптер над window.defaultsAPI.
 */
export const defaultsService = {
  load: () => window.defaultsAPI.load(),
  save: (updates: Record<string, unknown>) => window.defaultsAPI.save(updates),
  reset: () => window.defaultsAPI.reset(),
};