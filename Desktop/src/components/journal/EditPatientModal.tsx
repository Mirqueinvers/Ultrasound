// Frontend/src/components/journal/EditPatientModal.tsx
import React, { useEffect, useState } from "react";
import type { Patient } from "@/types";
import DatePickerField from "@/components/common/DatePickerField";

interface Props {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export const EditPatientModal: React.FC<Props> = ({
  isOpen,
  patient,
  onClose,
  onSave,
  onDelete,
}) => {
  const [form, setForm] = useState<Patient>({
    id: 0,
    last_name: "",
    first_name: "",
    middle_name: "",
    date_of_birth: "",
    created_at: "",
    updated_at: "",
  });

  useEffect(() => {
    if (isOpen && patient) {
      setForm({
        ...patient,
        middle_name: patient.middle_name ?? "",
      });
    }
  }, [isOpen, patient]);

  if (!isOpen || !patient) return null;

  const handleChange =
    (field: keyof Patient) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const handleDeleteClick = () => {
    onDelete(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Шапка */}
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
              <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-sm font-semibold text-slate-800">
              Редактирование пациента
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

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Фамилия */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Фамилия
            </label>
            <input
              type="text"
              value={form.last_name}
              onChange={handleChange("last_name")}
              required
              className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md"
            />
          </div>

          {/* Имя */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Имя
            </label>
            <input
              type="text"
              value={form.first_name}
              onChange={handleChange("first_name")}
              required
              className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md"
            />
          </div>

          {/* Отчество */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Отчество
            </label>
            <input
              type="text"
              value={form.middle_name ?? ""}
              onChange={handleChange("middle_name")}
              className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md"
            />
          </div>

          {/* Дата рождения */}
          <div>
            <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Дата рождения
            </label>
            <DatePickerField
              value={form.date_of_birth}
              onChange={(val) => setForm((prev) => ({ ...prev, date_of_birth: val }))}
              placeholder="дд.мм.гггг"
            />
          </div>

          {/* Кнопки */}
          <div className="flex items-center justify-between gap-2 pt-2">
            <button
              type="button"
              onClick={handleDeleteClick}
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
                className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm ring-1 ring-sky-500/70 transition-all hover:-translate-y-[1px] hover:bg-sky-500 hover:shadow-md active:translate-y-0 active:shadow-sm"
              >
                Сохранить
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
