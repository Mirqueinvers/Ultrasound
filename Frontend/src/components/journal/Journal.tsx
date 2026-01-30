// // Frontend/src/components/Journal.tsx
import React, { useEffect, useState } from "react";
import PrintSavedModal from "@/components/print/PrintSavedModal";
import { PatientCard } from "@/components/common/PatientCard";
import { EditPatientModal } from "@/components/journal/EditPatientModal";
import type { Patient, Research, JournalEntry } from "@/types";

declare global {
  interface Window {
    journalAPI: {
      getByDate: (date: string) => Promise<JournalEntry[]>;
    };
  }
}


const formatPatientName = (p: Patient) =>
  `${p.last_name} ${p.first_name}${p.middle_name ? ` ${p.middle_name}` : ""}`;

// парсер дат dd.MM.yyyy
const parseRuDate = (value?: string | null): Date | null => {
  if (!value) return null;
  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;

  const [, dayStr, monthStr, yearStr] = match;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1;
  const year = parseInt(yearStr, 10);

  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) {
    return null;
  }

  return d;
};

const formatDateRu = (value: string) => {
  if (!value) return "";
  const d = parseRuDate(value) ?? new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const Journal: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedPatientIds, setExpandedPatientIds] = useState<number[]>([]);
  const [printResearchId, setPrintResearchId] = useState<number | null>(null);
  const [isPrintSavedOpen, setIsPrintSavedOpen] = useState(false);

  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);

  const toggleExpanded = (patientId: number) => {
    setExpandedPatientIds((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId],
    );
  };

  const openProtocol = (researchId: number) => {
    setPrintResearchId(researchId);
    setIsPrintSavedOpen(true);
  };

  const openEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsEditPatientOpen(true);
  };

  const handleSavePatient = async (updated: Patient) => {
    try {
      await window.patientAPI.update({
        id: updated.id,
        lastName: updated.last_name,
        firstName: updated.first_name,
        middleName: updated.middle_name ?? null,
        dateOfBirth: updated.date_of_birth,
      });

      setEntries((prev) =>
        prev.map((entry) =>
          entry.patient.id === updated.id ? { ...entry, patient: updated } : entry,
        ),
      );

      setIsEditPatientOpen(false);
      setEditingPatient(null);
    } catch (e) {
      console.error("Ошибка сохранения пациента", e);
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (!window.confirm("Удалить пациента и все его исследования?")) return;

    try {
      await window.patientAPI.delete(patient.id);

      setEntries((prev) =>
        prev.filter((entry) => entry.patient.id !== patient.id),
      );

      setIsEditPatientOpen(false);
      setEditingPatient(null);
    } catch (e) {
      console.error("Ошибка удаления пациента", e);
    }
  };

  const loadData = async (d: string) => {
    setLoading(true);
    try {
      const result = await window.journalAPI.getByDate(d);
      setEntries(result);
    } catch (e) {
      console.error("Ошибка загрузки журнала", e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(date);
  }, [date]);

  return (
    <div className="flex h-full flex-col gap-4">
      {/* Заголовок и фильтры */}
      <div className="flex items-center justify-between gap-3">
        {entries.length > 0 ? (
          <div className="text-xs text-slate-500">
            Пациентов:{" "}
            <span className="font-medium text-slate-700">
              {entries.length}
            </span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex flex-1 items-center justify-center">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <span>Дата</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-0"
            />
          </label>
        </div>

        <div />
      </div>

      {/* Контейнер списка */}
      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-3">
        {loading && (
          <div className="flex items-center justify-center rounded-lg bg-white/60 p-6 text-sm text-slate-500 shadow-sm">
            Загрузка данных за выбранную дату…
          </div>
        )}

        {!loading && entries.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              <div className="mb-1 text-base font-medium text-slate-700">
                Нет пациентов за эту дату
              </div>
              <div className="text-xs text-slate-400">
                Выберите другую дату, чтобы посмотреть журнал.
              </div>
            </div>
          </div>
        )}

        {!loading && entries.length > 0 && (
          <ul className="space-y-3">
            {entries.map(({ patient, researches }) => {
              const isExpanded = expandedPatientIds.includes(patient.id);

              return (
                <li key={patient.id}>
                  <PatientCard
                    patient={patient}
                    researches={researches as Research[]}
                    isExpanded={isExpanded}
                    onToggle={() => toggleExpanded(patient.id)}
                    onOpenProtocol={openProtocol}
                    onEditPatient={() => openEditPatient(patient)}
                    formatPatientName={formatPatientName}
                    formatDateRu={formatDateRu}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <PrintSavedModal
        isOpen={isPrintSavedOpen}
        onClose={() => {
          setIsPrintSavedOpen(false);
          setPrintResearchId(null);
        }}
        researchId={printResearchId}
      />

      <EditPatientModal
        isOpen={isEditPatientOpen}
        patient={editingPatient}
        onClose={() => {
          setIsEditPatientOpen(false);
          setEditingPatient(null);
        }}
        onSave={handleSavePatient}
        onDelete={handleDeletePatient}
      />
    </div>
  );
};

export default Journal;
