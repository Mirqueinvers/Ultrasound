import type {
  CachedRegistryAppointment,
  RegistryAPI,
  RegistryAddress,
} from "../../../electron/preload";

/**
 * Адаптер над window.registryAPI (адреса регистратуры + кэш записей).
 */
export const registryService = {
  getAddresses: (): Promise<RegistryAddress[]> => window.registryAPI.getAddresses(),
  saveAddresses: (addresses: RegistryAddress[]) =>
    window.registryAPI.saveAddresses(addresses),
  getCachedAppointments: (): Promise<CachedRegistryAppointment[]> =>
    window.registryAPI.getCachedAppointments(),
  saveCachedAppointments: (appointments: CachedRegistryAppointment[]) =>
    window.registryAPI.saveCachedAppointments(appointments),
} satisfies RegistryAPI;