import type { RegistryAPI } from "../../../electron/preload";

/**
 * Адаптер над window.registryAPI (адреса регистратуры).
 */
export const registryService = {
  getAddresses: () => window.registryAPI.getAddresses(),
  saveAddresses: (addresses: Parameters<RegistryAPI["saveAddresses"]>[0]) =>
    window.registryAPI.saveAddresses(addresses),
};