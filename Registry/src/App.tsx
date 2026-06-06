import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Plus, Pencil, Trash2, X, Check, Search } from "lucide-react";

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

const inputClass =
  "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all duration-200";
const labelClass = "block text-sm font-medium text-slate-600 mb-1";
const btnClass =
  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

export default function App() {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
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
      const res = await fetch(`http://localhost:3456/api/appointments?date=${date}`);
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
          body: JSON.stringify({ studies: selectedStudies }),
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
            appointmentDate: date,
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
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={24} className="text-blue-600" />
          <h1 className="text-xl font-semibold text-slate-800">Регистратура УЗИ</h1>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={openAddModal}
            className={`${btnClass} bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2`}
          >
            <Plus size={16} />
            Добавить запись
          </button>
        </div>
      </header>

      {/* Список записей */}
      <main className="p-6">
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
                          className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-100"
                        >
                          {study}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4 shrink-0">
                    <button
                      onClick={() => openEditModal(appt)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Редактировать"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(appt.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
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
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-800">
                {editingAppointment ? "Редактировать запись" : "Новая запись"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className={labelClass}>Фамилия *</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={inputClass}
                    placeholder="Иванов"
                  />
                </div>
                <div>
                  <label className={labelClass}>Имя *</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={inputClass}
                    placeholder="Иван"
                  />
                </div>
                <div>
                  <label className={labelClass}>Отчество</label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(e.target.value)}
                    className={inputClass}
                    placeholder="Иванович"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Дата рождения *</label>
                <input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Исследования *</label>
                <div className="grid grid-cols-2 gap-2 mt-1 max-h-48 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  {STUDIES_LIST.map((study) => (
                    <label
                      key={study}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                        selectedStudies.includes(study)
                          ? "bg-blue-50 text-blue-700 border border-blue-200"
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
                        <Check size={14} className="text-blue-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 border-2 border-slate-300 rounded shrink-0" />
                      )}
                      {study}
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button
                onClick={() => setShowModal(false)}
                className={`${btnClass} text-slate-600 hover:bg-slate-100`}
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={!lastName || !firstName || !dateOfBirth || selectedStudies.length === 0}
                className={`${btnClass} bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-2`}
              >
                <Check size={16} />
                {editingAppointment ? "Сохранить" : "Добавить"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
