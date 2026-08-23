import React, { useState, useEffect, useCallback } from "react";
import { Calendar, RefreshCw, User, Stethoscope } from "lucide-react";
import { registryService } from "@services";
import { getTodayIso } from "@/utils/date";
import type {
  RegistryAppointment,
} from "../../../electron/preload";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  if (dateStr.includes(".")) return dateStr; // уже DD.MM.YYYY
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

function calculateAge(dateOfBirth: string): string {
  if (!dateOfBirth) return "";
  const birth = new Date(dateOfBirth);
  if (isNaN(birth.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age} ${getAgeWord(age)}`;
}

function getAgeWord(age: number): string {
  if (age % 10 === 1 && age % 100 !== 11) return "год";
  if (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20)) return "года";
  return "лет";
}

interface RegistryPanelProps {
  onPatientSelect?: (data: PatientSelectData) => void;
}

export interface PatientSelectData {
  fullName: string;
  dateOfBirth: string;
  studies: string[];
}

const RegistryPanel: React.FC<RegistryPanelProps> = ({ onPatientSelect }) => {
  const [date, setDate] = useState(getTodayIso());
  const [appointments, setAppointments] = useState<RegistryAppointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const items = await registryService.getAppointmentsByDate(date);
      setAppointments(items);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось получить записи с сервера"
      );
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handlePatientClick = useCallback(
    (appt: RegistryAppointment) => {
      if (!onPatientSelect || !appt.patient) return;
      const fullName = `${appt.patient.last_name} ${appt.patient.first_name} ${appt.patient.middle_name}`.trim();
      onPatientSelect({
        fullName,
        dateOfBirth: appt.patient.date_of_birth || "",
        studies: appt.studies,
      });
    },
    [onPatientSelect],
  );

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Шапка */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar size={24} className="text-medical-500" />
          <h2 className="text-lg font-semibold text-slate-800">Запись пациентов</h2>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200"
          />
          <button
            onClick={fetchAppointments}
            className="p-2 text-slate-400 hover:text-medical-600 hover:bg-medical-50 rounded-lg transition-all duration-200"
            title="Обновить"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Ошибка подключения к серверу */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
          <span className="text-sm">{error}</span>
          <button
            onClick={fetchAppointments}
            className="ml-auto text-xs font-medium text-amber-700 underline hover:no-underline"
          >
            Повторить
          </button>
        </div>
      )}

      {/* Загрузка */}
      {loading && !error && (
        <div className="flex items-center justify-center py-12">
          <RefreshCw size={24} className="animate-spin text-medical-400" />
          <span className="ml-3 text-sm text-slate-500">Загрузка...</span>
        </div>
      )}

      {/* Нет записей */}
      {!loading && !error && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Calendar size={48} className="mb-4 opacity-50" />
          <p className="text-base font-medium">Нет записей на {formatDate(date)}</p>
          <p className="text-sm mt-1">Пациенты не записаны на этот день</p>
        </div>
      )}

      {appointments.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Записей на {formatDate(date)}: <strong>{appointments.length}</strong>
          </p>
          {appointments.map((appt) => (
            <div
              key={appt.id}
              onClick={() => handlePatientClick(appt)}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-medical-50 flex items-center justify-center shrink-0">
                  <User size={20} className="text-medical-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base font-medium text-slate-800">
                      {appt.patient?.last_name} {appt.patient?.first_name}{" "}
                      {appt.patient?.middle_name}
                    </span>
                    {appt.patient?.date_of_birth && (
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                        {formatDate(appt.patient.date_of_birth)}, {calculateAge(appt.patient.date_of_birth)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                    <Stethoscope size={14} className="text-slate-400 shrink-0" />
                    {appt.studies.map((study) => (
                      <span
                        key={study}
                        className="text-xs bg-medical-50 text-medical-700 px-2.5 py-1 rounded-full border border-medical-100"
                      >
                        {study}
                      </span>
                    ))}
                    {appt.department && (
                      <span className="text-xs bg-sky-50 text-sky-600 px-2.5 py-1 rounded-full border border-sky-200 ml-auto">
                        🏥 {appt.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RegistryPanel;