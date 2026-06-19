import { Check } from "lucide-react";
import { STUDIES_LIST } from "../constants";
import { capitalizeFirstLetter } from "../utils/string";
import type { Appointment, Doctor } from "../types";
import DatePickerField from "./DatePickerField";

interface AppointmentModalProps {
  editingAppointment: Appointment | null;
  lastName: string;
  firstName: string;
  middleName: string;
  dateOfBirth: string;
  selectedStudies: string[];
  todayDoctors: Doctor[];
  appointmentsCount: number;
  onLastNameChange: (val: string) => void;
  onFirstNameChange: (val: string) => void;
  onMiddleNameChange: (val: string) => void;
  onDateOfBirthChange: (val: string) => void;
  onToggleStudy: (study: string) => void;
  onClose: () => void;
  onSave: () => void;
  onDelete: () => void;
}

export default function AppointmentModal({
  editingAppointment,
  lastName,
  firstName,
  middleName,
  dateOfBirth,
  selectedStudies,
  todayDoctors,
  appointmentsCount,
  onLastNameChange,
  onFirstNameChange,
  onMiddleNameChange,
  onDateOfBirthChange,
  onToggleStudy,
  onClose,
  onSave,
  onDelete,
}: AppointmentModalProps) {
  return (
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
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
          className="space-y-4"
        >
          {/* ФИО в одной строке */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Фамилия
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => onLastNameChange(capitalizeFirstLetter(e.target.value))}
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
                onChange={(e) => onFirstNameChange(capitalizeFirstLetter(e.target.value))}
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
                onChange={(e) => onMiddleNameChange(capitalizeFirstLetter(e.target.value))}
                className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md"
              />
            </div>
          </div>

          {/* Дата рождения */}
          <div className="w-1/3">
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Дата рождения
            </label>
            <DatePickerField
              value={dateOfBirth}
              onChange={onDateOfBirthChange}
              placeholder="дд.мм.гггг"
            />
          </div>

          {/* Информация о врачах */}
          {!editingAppointment && todayDoctors.length > 0 && (
            <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
              <p className="text-xs font-medium text-sky-700 mb-1">Сегодня принимают:</p>
              <div className="flex flex-wrap gap-1.5">
                {todayDoctors.map((doc) => {
                  const isFull = appointmentsCount >= doc.maxPatientsPerDay;
                  return (
                    <span
                      key={doc.id}
                      className={`text-xs px-2 py-0.5 rounded-full border ${
                        isFull
                          ? "bg-amber-50 text-amber-600 border-amber-200"
                          : "bg-emerald-50 text-emerald-600 border-emerald-200"
                      }`}
                    >
                      {doc.name} {isFull ? "(занято)" : `(${doc.maxPatientsPerDay - appointmentsCount} мест)`}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

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
                    onChange={() => onToggleStudy(study)}
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
              onClick={onDelete}
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
                onClick={onClose}
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
  );
}