import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";
import DatePickerField from "./components/DatePickerField";

const STUDIES_LIST = [
  "ОБП",
  "Почки",
  "Органы мошонки",
  "ОМТ (Ж)",
  "ОМТ (М)",
  "Щитовидная железа",
  "Слюнные железы",
  "БЦА",
  "УВНК",
  "Молочные железы",
  "Детская диспансеризация",
  "Мягких тканей",
  "Мочевой пузырь",
  "Плевральные полости",
  "Лимфоузлы",
];

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

function formatDate(dateStr: string): string {
  // Если уже в формате дд.мм.гггг
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

/** Конвертирует дд.мм.гггг в гггг-мм-дд для API */
function toApiDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const [d, m, y] = dateStr.split(".");
  return `${y}-${m}-${d}`;
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

function capitalizeFirstLetter(val: string): string {
  if (!val) return val;
  return val.charAt(0).toUpperCase() + val.slice(1);
}

const inputClass =
  "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all duration-200";
const labelClass = "block text-sm font-medium text-slate-600 mb-1";
const btnClass =
  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

export default function App() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const [date, setDate] = useState(`${dd}.${mm}.${yyyy}`);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Форма
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);

  const fetchAppointments = useCallback(async () => {
    try {
      const apiDate = toApiDate(date);
      const res = await fetch(`http://localhost:3456/api/appointments?date=${apiDate}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch {
      // Сервер может быть не запущен при разработке
    }
  }, [date]);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const openAddModal = () => {
    setEditingAppointment(null);
    setLastName("");
    setFirstName("");
    setMiddleName("");
    setDateOfBirth("");
    setSelectedStudies([]);
    setShowModal(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setLastName(appointment.patient?.last_name || "");
    setFirstName(appointment.patient?.first_name || "");
    setMiddleName(appointment.patient?.middle_name || "");
    setDateOfBirth(appointment.patient?.date_of_birth || "");
    setSelectedStudies(appointment.studies);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!lastName || !firstName || !dateOfBirth || selectedStudies.length === 0) return;

    try {
      if (editingAppointment) {
        await fetch(`http://localhost:3456/api/appointments/${editingAppointment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lastName,
            firstName,
            middleName,
            dateOfBirth: toApiDate(dateOfBirth),
            studies: selectedStudies,
          }),
        });
      } else {
        await fetch("http://localhost:3456/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lastName,
            firstName,
            middleName,
            dateOfBirth,
            appointmentDate: toApiDate(date),
            studies: selectedStudies,
          }),
        });
      }

      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      console.error("Failed to save appointment", err);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:3456/api/appointments/${id}`, {
        method: "DELETE",
      });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to delete appointment", err);
    }
  };

  const toggleStudy = (study: string) => {
    setSelectedStudies((prev) =>
      prev.includes(study) ? prev.filter((s) => s !== study) : [...prev, study]
    );
  };

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}>
      {/* Шапка */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 relative">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-medical-500" />
            <h1 className="text-xl font-semibold text-slate-800">Регистратура УЗИ</h1>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <DatePickerField
              value={date}
              onChange={setDate}
              placeholder="дд.мм.гггг"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={openAddModal}
              className={`${btnClass} bg-medical-500 text-white hover:bg-medical-600 flex items-center gap-2`}
            >
              <Plus size={16} />
              Добавить запись
            </button>
          </div>
        </div>
      </header>

      {/* Список записей */}
      <main className="max-w-6xl mx-auto px-6 py-6">
        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Calendar size={48} className="mb-4 opacity-50" />
            <p className="text-lg font-medium">Нет записей на {formatDate(date)}</p>
            <p className="text-sm mt-1">Нажмите "Добавить запись", чтобы создать новую</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-500 mb-2">
              Записей на {formatDate(date)}: <strong>{appointments.length}</strong>
            </p>
            {appointments.map((appt) => (
              <div
                key={appt.id}
                className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base font-medium text-slate-800">
                        {appt.patient?.last_name} {appt.patient?.first_name}{" "}
                        {appt.patient?.middle_name}
                      </span>
                      <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                        {formatDate(appt.patient?.date_of_birth || "")},{" "}
                        {calculateAge(appt.patient?.date_of_birth || "")}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {appt.studies.map((study) => (
                        <span
                          key={study}
                          className="text-xs bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full border border-emerald-200"
                        >
                          {study}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <button
                      onClick={() => openEditModal(appt)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200 cursor-pointer"
                      title="Редактировать"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(appt.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer"
                      title="Удалить"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Модалка добавления/редактирования */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* Шапка */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
                  <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-800">
                  {editingAppointment ? "Редактирование пациента" : "Новый пациент"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              {/* ФИО в одной строке */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(capitalizeFirstLetter(e.target.value))}
                    required
                    className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(capitalizeFirstLetter(e.target.value))}
                    required
                    className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Отчество
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(capitalizeFirstLetter(e.target.value))}
                    className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md"
                  />
                </div>
              </div>

              {/* Дата рождения — 1/3 ширины как поля ФИО */}
              <div className="w-1/3">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Дата рождения
                </label>
                <DatePickerField
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                  placeholder="дд.мм.гггг"
                />
              </div>

              {/* Исследования */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Исследования
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  {STUDIES_LIST.map((study) => (
                    <label
                      key={study}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                        selectedStudies.includes(study)
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "text-slate-600 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudies.includes(study)}
                        onChange={() => toggleStudy(study)}
                        className="sr-only"
                      />
                      {selectedStudies.includes(study) ? (
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 border-2 border-slate-300 rounded shrink-0" />
                      )}
                      {study}
                    </label>
                  ))}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editingAppointment) {
                      setDeleteConfirmId(editingAppointment.id);
                      setShowModal(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Удалить
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={!lastName || !firstName || !dateOfBirth || selectedStudies.length === 0}
                    className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm ring-1 ring-sky-500/70 transition-all hover:-translate-y-[1px] hover:bg-sky-500 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {editingAppointment ? "Сохранить" : "Добавить"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm диалог удаления */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="mb-2 text-base font-semibold text-slate-900">
              Удалить запись?
            </h3>
            <p className="mb-4 text-sm text-slate-700">
              Это действие нельзя отменить. Запись будет безвозвратно удалена.
            </p>
            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
