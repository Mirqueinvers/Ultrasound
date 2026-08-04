import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Settings, RefreshCw, WifiOff, User, Stethoscope } from "lucide-react";
import type {
  CachedRegistryAppointment,
  RegistryAddress,
} from "../../../electron/preload";

const REGISTRY_PORT = 3456;

interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string;
  date_of_birth: string;
}

export interface PatientSelectData {
  fullName: string;
  dateOfBirth: string;
  studies: string[];
}

interface Appointment {
  id: number;
  patient_id: number;
  appointment_date: string;
  studies: string[];
  department?: string;
  created_at: string;
  patient?: Patient;
  // Локальная метка источника (какая регистратура предоставила запись)
  _sourceName?: string;
  _fromCache?: boolean;
}

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

const RegistryPanel: React.FC<RegistryPanelProps> = ({ onPatientSelect }) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [addresses, setAddresses] = useState<RegistryAddress[]>([]);
  const [newAddressName, setNewAddressName] = useState("");
  const [newAddressIp, setNewAddressIp] = useState("");

  // Загрузка сохраненных адресов из файла (userData)
  useEffect(() => {
    window.registryAPI
      .getAddresses()
      .then((stored) => {
        if (Array.isArray(stored) && stored.length > 0) {
          setAddresses(stored);
        }
      })
      .catch(() => {});
  }, []);

  const persistAddresses = useCallback((updated: RegistryAddress[]) => {
    window.registryAPI.saveAddresses(updated).catch(() => {});
  }, []);

  const fetchAppointments = useCallback(async () => {
    if (addresses.length === 0) {
      setAppointments([]);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    // Записи, сгруппированные по источнику (IP регистратуры)
    const onlineBySource = new Map<string, Appointment[]>();
    const failedSources: string[] = [];
    let lastError: string | null = null;

    for (const addr of addresses) {
      try {
        const res = await fetch(`http://${addr.ip}:${REGISTRY_PORT}/api/appointments?date=${date}`);
        if (!res.ok) {
          lastError = `Ошибка сервера ${addr.name} (${addr.ip}): ${res.status}`;
          failedSources.push(addr.ip);
          continue;
        }
        const data = await res.json();
        // data может быть массивом или объектом {value: [...], Count: ...}
        const items = Array.isArray(data) ? data : (data.value || []);
        onlineBySource.set(addr.ip, items);
      } catch {
        lastError = `Не удалось подключиться к ${addr.name} (${addr.ip})`;
        failedSources.push(addr.ip);
      }
    }

    // Текущий локальный кэш записей регистратур
    const cached = await window.registryAPI
      .getCachedAppointments()
      .catch(() => [] as CachedRegistryAppointment[]);

    // Обновляем кэш свежими данными из успешно опрошенных регистратур:
    // записи из доступных источников перезаписываются актуальными,
    // записи из недоступных источников сохраняются в кэше
    if (onlineBySource.size > 0) {
      const freshEntries: CachedRegistryAppointment[] = [];
      for (const [sourceIp, items] of onlineBySource.entries()) {
        const sourceName = addresses.find((a) => a.ip === sourceIp)?.name ?? sourceIp;
        for (const appt of items) {
          freshEntries.push({
            sourceIp,
            sourceName,
            appointment: appt,
            cachedAt: new Date().toISOString(),
          });
        }
      }

      const merged: CachedRegistryAppointment[] = [];
      const keySet = new Set<string>();

      // Сохраняем старые записи только из источников, которые сейчас недоступны
      for (const entry of cached) {
        if (!onlineBySource.has(entry.sourceIp)) {
          const key = `${entry.sourceIp}:${entry.appointment.id}`;
          if (!keySet.has(key)) {
            keySet.add(key);
            merged.push(entry);
          }
        }
      }
      // Добавляем свежие записи из доступных источников
      for (const entry of freshEntries) {
        const key = `${entry.sourceIp}:${entry.appointment.id}`;
        if (!keySet.has(key)) {
          keySet.add(key);
          merged.push(entry);
        }
      }

      await window.registryAPI.saveCachedAppointments(merged).catch(() => {});
    }

    // Итоговый список на экран: online-записи + записи из кэша для недоступных источников
    const finalAppointments: Appointment[] = [];

    // Проставляем метку источника для online-записей
    for (const [sourceIp, items] of onlineBySource.entries()) {
      const sourceName = addresses.find((a) => a.ip === sourceIp)?.name ?? sourceIp;
      for (const appt of items) {
        finalAppointments.push({
          ...appt,
          _sourceName: sourceName,
          _fromCache: false,
        });
      }
    }

    // Добавляем записи из локального кэша для недоступных источников
    if (failedSources.length > 0) {
      const cachedForDate = cached
        .filter(
          (c) =>
            c.appointment &&
            c.appointment.appointment_date === date &&
            failedSources.includes(c.sourceIp),
        )
        .map((c) => ({
          ...c.appointment,
          _sourceName: c.sourceName || c.sourceIp,
          _fromCache: true,
        }));
      finalAppointments.push(...cachedForDate);
    }

    if (finalAppointments.length === 0 && lastError) {
      setError(lastError);
    }

    setAppointments(finalAppointments);
    setLoading(false);
  }, [date, addresses]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleAddAddress = () => {
    // Очистка ввода: убираем IP:, http://, слэши и порт :3456, оставляем только IP
    const cleanedIp = newAddressIp
      .replace(/^IP\s*:\s*/i, "")
      .replace(/^http:\/\//i, "")
      .replace(/\/+$/, "")
      .replace(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/, "$1")
      .trim();
    if (!cleanedIp) return;
    if (addresses.some((a) => a.ip === cleanedIp)) return;
    const name = newAddressName.trim() || cleanedIp;
    const updated = [...addresses, { name, ip: cleanedIp }];
    setAddresses(updated);
    persistAddresses(updated);
    setNewAddressName("");
    setNewAddressIp("");
  };

  const handleRemoveAddress = (addr: RegistryAddress) => {
    const updated = addresses.filter((a) => a.ip !== addr.ip);
    setAddresses(updated);
    persistAddresses(updated);
  };

  const handleCloseSettings = () => {
    setShowSettings(false);
  };

  const handlePatientClick = useCallback(
    (appt: Appointment) => {
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
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
            title="Настройки подключения"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Нет подключенных регистратур */}
      {addresses.length === 0 && (
        <div className="flex items-center gap-3 p-4 mb-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-500">
          <WifiOff size={20} className="shrink-0" />
          <div>
            <p className="font-medium text-sm">Подключенных регистратур нет</p>
            <p className="text-xs mt-0.5 opacity-80">
              Добавьте IP-адрес регистратуры в настройках
            </p>
          </div>
          <button
            onClick={() => setShowSettings(true)}
            className="ml-auto text-xs font-medium text-slate-600 underline hover:no-underline"
          >
            Настроить
          </button>
        </div>
      )}

      {/* Ошибка подключения */}
      {error && addresses.length > 0 && (
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
      {loading && !error && addresses.length > 0 && (
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
          {appointments.map((appt, index) => (
            <div
              key={`${appt._sourceName ?? "unknown"}:${appt.id}:${index}`}
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
                    {appt._fromCache && (
                      <span
                        className="text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full border border-amber-200"
                        title="Данные из локального кэша, регистратура сейчас недоступна"
                      >
                        💾 из кэша
                      </span>
                    )}
                    {appt._sourceName && (
                      <span
                        className="text-xs bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full border border-slate-200"
                        title={`Источник: ${appt._sourceName}`}
                      >
                        🖥 {appt._sourceName}
                      </span>
                    )}
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

      {/* Модалка настроек */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
              Настройки подключения
            </h3>

            <label className="block text-sm font-medium text-slate-600 mb-2">
              Подключенные регистратуры:
            </label>

            {/* Список адресов */}
            <div className="space-y-2 mb-4">
              {addresses.length === 0 && (
                <p className="text-sm text-slate-400">
                  Список пуст. Добавьте IP-адрес регистратуры.
                </p>
              )}
              {addresses.map((addr) => (
                <div
                  key={addr.ip}
                  className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-700 truncate">{addr.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{addr.ip}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveAddress(addr)}
                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md p-1 transition-all duration-200 shrink-0"
                    title="Удалить"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Добавление нового адреса */}
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Название
            </label>
            <input
              type="text"
              value={newAddressName}
              onChange={(e) => setNewAddressName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddAddress()}
              placeholder="Поликлиника №1"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200 mb-3"
            />
            <label className="block text-sm font-medium text-slate-600 mb-1">
              IP-адрес
            </label>
            <div className="flex items-center gap-2 mb-4">
              <input
                type="text"
                value={newAddressIp}
                onChange={(e) => setNewAddressIp(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddAddress()}
                placeholder="192.168.1.100"
                className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200"
              />
              <button
                onClick={handleAddAddress}
                className="px-3 py-2 text-sm font-medium text-white bg-medical-500 hover:bg-medical-600 rounded-lg transition-all duration-200 shrink-0"
              >
                Добавить
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Порт {REGISTRY_PORT} подставляется автоматически
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleCloseSettings}
                className="px-4 py-2 text-sm font-medium text-white bg-medical-500 hover:bg-medical-600 rounded-lg transition-all duration-200"
              >
                Готово
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegistryPanel;