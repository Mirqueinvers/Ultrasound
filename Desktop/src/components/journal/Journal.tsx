import React, { useEffect, useMemo, useState } from "react";
import { PatientCard } from "@/components/common/PatientCard";
import { EditPatientModal } from "@/components/journal/EditPatientModal";
import PrintSavedModal from "@/components/print/PrintSavedModal";
import ExportModal from "@/components/journal/ExportModal";
import DatePickerField from "@/components/common/DatePickerField";
import type { JournalEntry, Patient, Research } from "@/types";

const formatPatientName = (patient: Patient) =>
  `${patient.last_name} ${patient.first_name}${patient.middle_name ? ` ${patient.middle_name}` : ""}`;

const parseRuDate = (value?: string | null): Date | null => {
  if (!value) return null;

  const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;

  const [, dayString, monthString, yearString] = match;
  const day = parseInt(dayString, 10);
  const month = parseInt(monthString, 10) - 1;
  const year = parseInt(yearString, 10);
  const parsedDate = new Date(year, month, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month ||
    parsedDate.getDate() !== day
  ) {
    return null;
  }

  return parsedDate;
};

const formatDateRu = (value: string) => {
  if (!value) return "";

  const parsedDate = parseRuDate(value) ?? new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;

  return parsedDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

/** Конвертирует "гггг-мм-дд" в "дд.мм.гггг" */
const isoToRu = (iso: string): string => {
  if (!iso) return "";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  return `${match[3]}.${match[2]}.${match[1]}`;
};

/** Конвертирует "дд.мм.гггг" в "гггг-мм-дд" */
const ruToIso = (ru: string): string => {
  if (!ru) return "";
  const match = ru.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return ru;
  return `${match[3]}-${match[2]}-${match[1]}`;
};

type FailedExport = {
  researchId: number;
  patientName: string;
  researchDate: string;
};

const Journal: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [printResearchId, setPrintResearchId] = useState<number | null>(null);
  const [isPrintSavedOpen, setIsPrintSavedOpen] = useState(false);

  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);

  const [failedExports, setFailedExports] = useState<FailedExport[]>([]);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const totalResearches = useMemo(
    () => entries.reduce(
      (count, entry) => count + entry.researches.reduce(
        (sum, r) => sum + ((r as any).study_types?.length ?? 0), 0
      ), 0
    ),
    [entries],
  );

  const handleDeleteResearch = async (researchId: number) => {
    try {
      await window.researchAPI.delete(researchId);

      setEntries((prevEntries) =>
        prevEntries
          .map((entry) => ({
            ...entry,
            researches: entry.researches.filter(
              (research) => research.id !== researchId,
            ),
          }))
          .filter((entry) => entry.researches.length > 0),
      );
    } catch (error) {
      console.error("Ошибка удаления исследования", error);
    }
  };

  const openProtocol = (researchId: number) => {
    setPrintResearchId(researchId);
    setIsPrintSavedOpen(true);
  };

  const openEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setIsEditPatientOpen(true);
  };

  const handleSavePatient = async (updatedPatient: Patient) => {
    try {
      await window.patientAPI.update({
        id: updatedPatient.id,
        lastName: updatedPatient.last_name,
        firstName: updatedPatient.first_name,
        middleName: updatedPatient.middle_name ?? null,
        dateOfBirth: updatedPatient.date_of_birth,
      });

      setEntries((prevEntries) =>
        prevEntries.map((entry) =>
          entry.patient.id === updatedPatient.id
            ? { ...entry, patient: updatedPatient }
            : entry,
        ),
      );

      setIsEditPatientOpen(false);
      setEditingPatient(null);
    } catch (error) {
      console.error("Ошибка сохранения пациента", error);
    }
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (!window.confirm("Удалить пациента и все его исследования?")) {
      return;
    }

    try {
      await window.patientAPI.delete(patient.id);

      setEntries((prevEntries) =>
        prevEntries.filter((entry) => entry.patient.id !== patient.id),
      );

      setIsEditPatientOpen(false);
      setEditingPatient(null);
    } catch (error) {
      console.error("Ошибка удаления пациента", error);
    }
  };

  const loadData = async (targetDate: string) => {
    setLoading(true);

    try {
      const result = await window.journalAPI.getByDate(targetDate);
      setEntries(result);
    } catch (error) {
      console.error("Ошибка загрузки журнала", error);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyFailedExports = async () => {
    if (failedExports.length === 0) return;

    const text = failedExports
      .map(
        ({ patientName, researchDate, researchId }) =>
          `${patientName} | ${formatDateRu(researchDate)} | researchId=${researchId}`,
      )
      .join("\n");

    try {
      await navigator.clipboard.writeText(text);
      window.alert("Список пропущенных исследований скопирован.");
    } catch (error) {
      console.error("Ошибка копирования списка пропущенных исследований", error);
      window.alert("Не удалось скопировать список. Попробуйте еще раз.");
    }
  };

  useEffect(() => {
    void loadData(date);
  }, [date]);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {entries.length > 0 ? (
          <div className="text-xs text-slate-500">
            Пациентов:{" "}
            <span className="font-medium text-slate-700">{entries.length}</span>
            {" · "}
            Исследований:{" "}
            <span className="font-medium text-slate-700">{totalResearches}</span>
          </div>
        ) : (
          <div />
        )}

        <div className="flex flex-1 items-center justify-center">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <span>Дата</span>
            <DatePickerField
              value={isoToRu(date)}
              onChange={(val) => setDate(ruToIso(val))}
              placeholder="дд.мм.гггг"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => setIsExportModalOpen(true)}
          className="inline-flex items-center justify-center rounded-full p-2 text-slate-400 transition-all hover:bg-sky-50 hover:text-sky-500 active:bg-sky-100"
          title="Экспорт протоколов"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </button>
      </div>

      {failedExports.length > 0 ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-amber-900">
                Часть исследований не удалось экспортировать
              </div>
              <p className="mt-1 text-xs text-amber-800">
                Ниже список пропущенных протоколов для быстрого поиска в журнале.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleCopyFailedExports()}
              className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-white px-4 py-2 text-sm font-medium text-amber-900 shadow-sm transition hover:bg-amber-100"
            >
              <span className="i-ph-copy-duotone text-base" />
              <span>Скопировать список</span>
            </button>
          </div>

          <ul className="mt-3 space-y-2 text-sm text-amber-950">
            {failedExports.map(({ researchId, patientName, researchDate }) => (
              <li
                key={researchId}
                className="rounded-lg border border-amber-200 bg-white px-3 py-2"
              >
                <span className="font-medium">{patientName}</span>
                {" · "}
                <span>{formatDateRu(researchDate)}</span>
                {" · "}
                <code className="rounded bg-amber-100 px-1.5 py-0.5 text-xs text-amber-950">
                  researchId={researchId}
                </code>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="flex-1 overflow-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-3">
        {loading ? (
          <div className="flex items-center justify-center rounded-lg bg-white/60 p-6 text-sm text-slate-500 shadow-sm">
            Загрузка данных за выбранную дату...
          </div>
        ) : null}

        {!loading && entries.length === 0 ? (
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
        ) : null}

        {!loading && entries.length > 0 ? (
          <ul className="space-y-3">
            {entries.map(({ patient, researches }) => (
              <li key={patient.id}>
                <PatientCard
                  patient={patient}
                  researches={researches as Research[]}
                  onOpenProtocol={openProtocol}
                  onEditPatient={() => openEditPatient(patient)}
                  onDeleteResearch={handleDeleteResearch}
                  formatPatientName={formatPatientName}
                  formatDateRu={formatDateRu}
                />
              </li>
            ))}
          </ul>
        ) : null}
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

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => {
          setIsExportModalOpen(false);
          setFailedExports([]);
        }}
        journalDate={date}
      />
    </div>
  );
};

export default Journal;