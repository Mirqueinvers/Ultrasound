import { useState, useEffect, useCallback } from "react";
import type { Doctor, DoctorFormData } from "../types";
import { getDayOfWeek } from "../utils/date";

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

function parseWorkDays(raw: string): number[] {
  try {
    const parsed: unknown = JSON.parse(raw || "[1,2,3,4,5]");
    if (Array.isArray(parsed)) {
      return parsed.filter((d): d is number => typeof d === "number");
    }
  } catch {
    // Не JSON — используем будни по умолчанию
  }
  return [1, 2, 3, 4, 5];
}

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const api = getRegistryApi();
      const data = await api.getDoctors();
      const mapped: Doctor[] = data.map((d) => ({
        id: d.id,
        name: d.name,
        maxPatientsPerDay: d.max_patients_per_day,
        workDays: parseWorkDays(d.work_days),
      }));
      setDoctors(mapped);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Ошибка загрузки врачей";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const createDoctor = async (data: DoctorFormData): Promise<boolean> => {
    try {
      const api = getRegistryApi();
      await api.createDoctor(data.name, data.maxPatientsPerDay, data.workDays);
      await fetchDoctors();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Ошибка создания врача";
      setError(msg);
      return false;
    }
  };

  const updateDoctor = async (
    id: string,
    data: DoctorFormData
  ): Promise<boolean> => {
    try {
      const api = getRegistryApi();
      await api.updateDoctor(id, data.name, data.maxPatientsPerDay, data.workDays);
      await fetchDoctors();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Ошибка обновления врача";
      setError(msg);
      return false;
    }
  };

  const removeDoctor = async (id: string): Promise<boolean> => {
    try {
      const api = getRegistryApi();
      await api.deleteDoctor(id);
      await fetchDoctors();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Ошибка удаления врача";
      setError(msg);
      return false;
    }
  };

  const getDoctorsForDate = (dateStr: string): Doctor[] => {
    const dayOfWeek = getDayOfWeek(dateStr);
    return doctors.filter((d) => d.workDays.includes(dayOfWeek));
  };

  return {
    doctors,
    loading,
    error,
    fetchDoctors,
    createDoctor,
    updateDoctor,
    removeDoctor,
    getDoctorsForDate,
  };
}
