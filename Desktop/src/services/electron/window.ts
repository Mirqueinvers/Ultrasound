/**
 * Адаптер над window.windowAPI (управление окном Electron).
 */
export const windowService = {
  focus: () => window.windowAPI?.focus(),
  minimize: () => window.windowAPI?.minimize(),
  maximize: () => window.windowAPI?.maximize(),
  close: () => window.windowAPI?.close(),
};