import { useState, useEffect, useCallback } from "react";
import type { Appointment, PatientFormData } from "../types";
import { toApiDate } from "../utils/date";
import { getDepartment } from "../utils/patient";

/**
 * Этап 3.3/3.4: данные загружаются через IPC-мост window.registryAPI
 * (см. electron/registryIpc.ts), который работает с центральным API.
 * Локальный HTTP-сервер Registry удалён на этапе 3.4.
 */
function getRegistryApi(): NonNullable<Window["registryAPI"]> {
  if (!window.registryAPI) {
    throw new Error("registryAPI недоступен: приложение запущено вне Electron");
  }
  return window.registryAPI;
}

/**
 * Хук записей регистратуры.
 *
 * @param date           выбранная дата (DD.MM.YYYY) — для списка записей и модалки;
 * @param calendarMonth  месяц, отображаемый в календаре (0..11);
 * @param calendarYear   год, отображаемый в календаре.
 *
 * Записи за месяц календаря (`allAppointments`) нужны для подсчёта занятости
 * дней в календаре, поэтому они загружаются по `calendarMonth`/`calendarYear`,
 * а не по месяцу выбранной даты. Записи выбранной даты (`appointments`)
 * загружаются отдельно, чтобы список записей справа не зависел от того,
 * какой месяц открыт в календаре.
 */
export function useAppointments(
  date: string,
  calendarMonth: number,
  calendarYear: number
) {
  // Записи за отображаемый месяц календаря (для подсчёта занятости в календаре)
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  // Записи на выбранную дату (для списка записей и модалки)
  const [selectedAppointments, setSelectedAppointments] = useState<
    Appointment[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем записи за отображаемый месяц календаря и за выбранную дату
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const api = getRegistryApi();
      const apiDate = toApiDate(date);
      const [monthData, dayData] = await Promise.all([
        api.getAppointmentsByMonth(calendarMonth, calendarYear),
        api.getAppointmentsByDate(apiDate),
      ]);
      setAllAppointments(monthData);
      setSelectedAppointments(dayData);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Ошибка загрузки записей";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [date, calendarMonth, calendarYear]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Записи для выбранной даты
  const appointments = selectedAppointments;

  const createAppointment = async (
    data: PatientFormData
  ): Promise<boolean> => {
    try {
      const api = getRegistryApi();
      await api.createAppointment(
        {
          last_name: data.lastName,
          first_name: data.firstName,
          middle_name: data.middleName,
          date_of_birth: data.dateOfBirth,
          department: getDepartment(),
        },
        toApiDate(date),
        data.studies
      );
      await fetchAppointments();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Ошибка создания записи";
      setError(msg);
      return false;
    }
  };

  const updateAppointment = async (
    id: string,
    data: PatientFormData
  ): Promise<boolean> => {
    try {
      const api = getRegistryApi();
      await api.updateAppointment(
        id,
        data.studies,
        {
          last_name: data.lastName,
          first_name: data.firstName,
          middle_name: data.middleName,
          date_of_birth: data.dateOfBirth,
        }
      );
      await fetchAppointments();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Ошибка обновления записи";
      setError(msg);
      return false;
    }
  };

  const removeAppointment = async (id: string): Promise<boolean> => {
    try {
      const api = getRegistryApi();
      await api.deleteAppointment(id);
      await fetchAppointments();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Ошибка удаления записи";
      setError(msg);
      return false;
    }
  };

  return {
    appointments,
    allAppointments,
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    removeAppointment,
  };
}
