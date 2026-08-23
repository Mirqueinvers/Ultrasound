import type {
  RegistryAPI,
  RegistryAppointment,
} from "../../../electron/preload";

/**
 * Адаптер над window.registryAPI (записи регистратуры из центральной БД).
 * Этап 2.6: кэш registry_appointments удалён — записи читаются напрямую с API.
 */
export const registryService = {
  getAppointmentsByDate: (date: string): Promise<RegistryAppointment[]> =>
    window.registryAPI.getAppointmentsByDate(date),
} satisfies RegistryAPI;
