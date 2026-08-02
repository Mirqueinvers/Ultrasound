import type { ProtocolAPI } from "../../../electron/preload";

/**
 * Адаптер над window.protocolAPI.
 */
export const protocolService = {
  getPrinters: () => window.protocolAPI.getPrinters(),
  getByResearchId: (id: number) => window.protocolAPI.getByResearchId(id),
  printHtml: (data: Parameters<ProtocolAPI["printHtml"]>[0]) =>
    window.protocolAPI.printHtml(data),
  savePrintOverrides: (data: Parameters<ProtocolAPI["savePrintOverrides"]>[0]) =>
    window.protocolAPI.savePrintOverrides(data),
};