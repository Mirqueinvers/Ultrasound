import { useState, useEffect, useCallback } from "react";
import type { Doctor, DoctorFormData } from "../types";
import {
  fetchDoctors as apiFetchDoctors,
  createDoctor as apiCreate,
  updateDoctor as apiUpdate,
  deleteDoctor as apiDelete,
} from "../services/api";
import { getDayOfWeek } from "../utils/date";

export function useDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiFetchDoctors();
      const mapped: Doctor[] = data.map((d: any) => ({
        id: String(d.id),
        name: d.name,
        maxPatientsPerDay: d.max_patients_per_day,
        workDays: JSON.parse(d.work_days || "[1,2,3,4,5]"),
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
      await apiCreate(data);
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
      await apiUpdate(id, data);
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
      await apiDelete(id);
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