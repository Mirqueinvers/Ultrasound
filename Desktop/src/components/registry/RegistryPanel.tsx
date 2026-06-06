import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Settings, RefreshCw, WifiOff, User, Stethoscope } from "lucide-react";

interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string;
  date_of_birth: string;
}

interface Appointment {
  id: number;
  patient_id: number;
  appointment_date: string;
  studies: string[];
  created_at: string;
  patient?: Patient;
}

const REGISTRY_ADDRESS_KEY = "registry_address";

function getRegistryAddress(): string {
  return localStorage.getItem(REGISTRY_ADDRESS_KEY) || "localhost:3456";
}

function setRegistryAddress(address: string) {
  localStorage.setItem(REGISTRY_ADDRESS_KEY, address);
}

function formatDate(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

function calculateAge(dateOfBirth: string): string {
  const birth = new Date(dateOfBirth);
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

const RegistryPanel: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [address, setAddress] = useState(getRegistryAddress());
  const [settingsInput, setSettingsInput] = useState(address);

  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://${address}/api/appointments?date=${date}`);
      if (!res.ok) {
        throw new Error(`Ошибка сервера: ${res.status}`);
      }
      const data = await res.json();
      setAppointments(data);
    } catch (err: any) {
      setError(err.message || "Не удалось подключиться к регистратуре");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [date, address]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleSaveSettings = () => {
    // Очищаем ввод: убираем префикс "IP:", лишние пробелы
    const cleaned = settingsInput
      .replace(/^IP\s*:\s*/i, "")
      .replace(/^http:\/\//i, "")
      .replace(/\/+$/, "")
      .trim();
    setRegistryAddress(cleaned);
    setAddress(cleaned);
    setShowSettings(false);
  };

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
          <button
            onClick={() => {
              setSettingsInput(address);
              setShowSettings(true);
            }}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
            title="Настройки подключения"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Ошибка подключения */}
      {error && (
        <div className="flex items-center gap-3 p-4 mb-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-700">
          <WifiOff size={20} className="shrink-0" />
          <div>
            <p className="font-medium text-sm">Регистратура не подключена</p>
            <p className="text-xs mt-0.5 opacity-80">{error}</p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="ml-auto text-xs font-medium text-amber-700 underline hover:no-underline"
          >
            Настроить
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

      {/* Список записей */}
      {!loading && !error && appointments.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <Calendar size={48} className="mb-4 opacity-50" />
          <p className="text-base font-medium">Нет записей на {formatDate(date)}</p>
          <p className="text-sm mt-1">Пациенты не записаны на этот день</p>
        </div>
      )}

      {!loading && appointments.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Записей на {formatDate(date)}: <strong>{appointments.length}</strong>
          </p>
          {appointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow duration-200"
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
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full shrink-0">
                      {formatDate(appt.patient?.date_of_birth || "")},{" "}
                      {calculateAge(appt.patient?.date_of_birth || "")}
                    </span>
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
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Модалка настроек */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Настройки подключения
            </h3>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Адрес регистратуры (IP:порт)
            </label>
            <input
              type="text"
              value={settingsInput}
              onChange={(e) => setSettingsInput(e.target.value)}
              placeholder="192.168.1.100:3456"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200 mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveSettings}
                className="px-4 py-2 text-sm font-medium text-white bg-medical-500 hover:bg-medical-600 rounded-lg transition-all duration-200"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistryPanel;
