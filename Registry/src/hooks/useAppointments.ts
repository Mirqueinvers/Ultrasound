import { useState, useEffect, useCallback } from "react";
import type { Appointment, PatientFormData } from "../types";
import { toApiDate } from "../utils/date";
import { getDepartment } from "../utils/patient";
import {
  fetchAppointmentsByDate,
  createAppointment as apiCreate,
  updateAppointment as apiUpdate,
  deleteAppointment as apiDelete,
} from "../services/api";

export function useAppointments(date: string) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiDate = toApiDate(date);
      const data = await fetchAppointmentsByDate(apiDate);
      setAppointments(data);
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

  const createAppointment = async (
    data: PatientFormData
  ): Promise<boolean> => {
    try {
      await apiCreate({
        ...data,
        appointmentDate: toApiDate(date),
        department: getDepartment(),
      });
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
    id: number,
    data: PatientFormData
  ): Promise<boolean> => {
    try {
      await apiUpdate(id, data);
      await fetchAppointments();
      return true;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Ошибка обновления записи";
      setError(msg);
      return false;
    }
  };

  const removeAppointment = async (id: number): Promise<boolean> => {
    try {
      await apiDelete(id);
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
    loading,
    error,
    fetchAppointments,
    createAppointment,
    updateAppointment,
    removeAppointment,
  };
}