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

export function useAppointments(date: string) {
  const [allAppointments, setAllAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Загружаем записи за месяц, соответствующий выбранной дате
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const api = getRegistryApi();
      const parts = date.split(".");
      if (parts.length === 3) {
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);
        const data = await api.getAppointmentsByMonth(month, year);
        setAllAppointments(data);
      } else {
        setAllAppointments([]);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Ошибка загрузки записей";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Фильтруем записи для выбранной даты
  const appointments = allAppointments.filter((a) => {
    const apiDate = toApiDate(date);
    return a.appointment_date === apiDate;
  });

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
