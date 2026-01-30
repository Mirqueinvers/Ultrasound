// // Frontend/src/components/journal/EditPatientModal.tsx
import React, { useEffect, useState } from "react";
import type { Patient } from "@/types";

interface Props {
  isOpen: boolean;
  patient: Patient | null;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  onDelete: (patient: Patient) => void; // ← добавили
}

const dobToInput = (dob: string | undefined) => {
  if (!dob) return "";
  const [dd, mm, yyyy] = dob.split(".");
  if (!dd || !mm || !yyyy) return "";
  return `${yyyy}-${mm}-${dd}`;
};

const inputToDob = (value: string) => {
  if (!value) return "";
  const [yyyy, mm, dd] = value.split("-");
  if (!dd || !mm || !yyyy) return "";
  return `${dd}.${mm}.${yyyy}`;
};

export const EditPatientModal: React.FC<Props> = ({
  isOpen,
  patient,
  onClose,
  onSave,
  onDelete,
}) => {
  const [form, setForm] = useState<Patient | null>(patient);

  useEffect(() => {
    if (isOpen) {
      setForm(patient);
    }
  }, [isOpen, patient]);

  if (!isOpen || !form) return null;

  const handleChange =
    (field: keyof Patient) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm({ ...form, [field]: e.target.value });
    };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDob = inputToDob(e.target.value);
    setForm({ ...form, date_of_birth: newDob });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
  };

  const handleDeleteClick = () => {
    onDelete(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-md rounded-lg bg-white p-4 shadow-lg">
        <h2 className="mb-3 text-sm font-semibold text-slate-800">
          Редактирование пациента
        </h2>
        <form onSubmit={handleSubmit} className="space-y-2 text-sm">
          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Фамилия
            </label>
            <input
              className="w-full rounded border px-2 py-1 text-sm"
              value={form.last_name}
              onChange={handleChange("last_name")}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Имя
            </label>
            <input
              className="w-full rounded border px-2 py-1 text-sm"
              value={form.first_name}
              onChange={handleChange("first_name")}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Отчество
            </label>
            <input
              className="w-full rounded border px-2 py-1 text-sm"
              value={form.middle_name ?? ""}
              onChange={handleChange("middle_name")}
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-slate-600">
              Дата рождения
            </label>
            <input
              type="date"
              className="w-full rounded border px-2 py-1 text-sm"
              value={dobToInput(form.date_of_birth)}
              onChange={handleDobChange}
            />
          </div>

          <div className="mt-3 flex justify-between gap-2">
            <button
              type="button"
              onClick={handleDeleteClick}
              className="rounded border border-red-300 px-3 py-1 text-xs text-red-600 hover:bg-red-50"
            >
              Удалить пациента
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded border border-slate-300 px-3 py-1 text-xs text-slate-700"
              >
                Отмена
              </button>
              <button
                type="submit"
                className="rounded bg-sky-600 px-3 py-1 text-xs text-white"
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
