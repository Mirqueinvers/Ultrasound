import React, { useEffect, useMemo, useState } from "react";
import { PatientCard } from "@/components/common/PatientCard";
import { EditPatientModal } from "@/components/journal/EditPatientModal";
import { JournalExportRenderer } from "@/components/journal/JournalExportRenderer";
import PrintSavedModal from "@/components/print/PrintSavedModal";
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

type ExportMode = "date" | "period";

type FailedExport = {
  researchId: number;
  patientName: string;
  researchDate: string;
};

type ExportResearchMeta = Record<
  number,
  {
    patientName: string;
    researchDate: string;
  }
>;

const Journal: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedPatientIds, setExpandedPatientIds] = useState<number[]>([]);
  const [printResearchId, setPrintResearchId] = useState<number | null>(null);
  const [isPrintSavedOpen, setIsPrintSavedOpen] = useState(false);

  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);
  const [isEditPatientOpen, setIsEditPatientOpen] = useState(false);

  const [exportMode, setExportMode] = useState<ExportMode>("date");
  const [exportStartDate, setExportStartDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [exportEndDate, setExportEndDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [isPreparingExport, setIsPreparingExport] = useState(false);
  const [exportResearchIds, setExportResearchIds] = useState<number[]>([]);
  const [exportResearchMeta, setExportResearchMeta] =
    useState<ExportResearchMeta>({});
  const [exportFileName, setExportFileName] = useState("uzi-protocols.html");
  const [failedExports, setFailedExports] = useState<FailedExport[]>([]);
  const [doctorNames, setDoctorNames] = useState<string[]>([]);
  const [selectedDoctorName, setSelectedDoctorName] = useState("");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const totalResearches = useMemo(
    () => entries.reduce((count, entry) => count + entry.researches.length, 0),
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

  const toggleExpanded = (patientId: number) => {
    setExpandedPatientIds((prevIds) =>
      prevIds.includes(patientId)
        ? prevIds.filter((id) => id !== patientId)
        : [...prevIds, patientId],
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

  const handleExport = async () => {
    const startDate = exportMode === "date" ? date : exportStartDate;
    const endDate = exportMode === "date" ? date : exportEndDate;

    if (!startDate || !endDate) {
      window.alert("Выберите даты для экспорта.");
      return;
    }

    if (startDate > endDate) {
      window.alert("Дата начала периода не может быть позже даты окончания.");
      return;
    }

    setIsPreparingExport(true);

    try {
      const exportEntries =
        startDate === endDate
          ? await window.journalAPI.getByDate(startDate)
          : await window.journalAPI.getByPeriod(startDate, endDate);

      const filteredEntries = exportEntries
        .map((entry) => ({
          ...entry,
          researches: entry.researches.filter((research) =>
            selectedDoctorName
              ? (research.doctor_name ?? "").trim() === selectedDoctorName
              : true,
          ),
        }))
        .filter((entry) => entry.researches.length > 0);

      const researchIds = filteredEntries.flatMap((entry) =>
        entry.researches.map((research) => research.id),
      );

      if (researchIds.length === 0) {
        window.alert(
          selectedDoctorName
            ? "За выбранный диапазон у этого врача исследований не найдено."
            : "За выбранный диапазон исследований не найдено.",
        );
        return;
      }

      const researchMeta = filteredEntries.reduce<ExportResearchMeta>(
        (accumulator, entry) => {
          const patientName = formatPatientName(entry.patient);

          entry.researches.forEach((research) => {
            accumulator[research.id] = {
              patientName,
              researchDate: research.research_date,
            };
          });

          return accumulator;
        },
        {},
      );

      const suffix =
        startDate === endDate ? startDate : `${startDate}_to_${endDate}`;
      const doctorSuffix = selectedDoctorName
        ? `-${selectedDoctorName
            .toLocaleLowerCase("ru-RU")
            .replace(/[^a-zа-я0-9]+/gi, "-")
            .replace(/^-+|-+$/g, "")}`
        : "";

      setFailedExports([]);
      setExportResearchMeta(researchMeta);
      setExportFileName(`uzi-protocols-${suffix}${doctorSuffix}.html`);
      setExportResearchIds(researchIds);
    } catch (error) {
      console.error("Ошибка подготовки экспорта", error);
      window.alert("Не удалось подготовить экспорт.");
    } finally {
      setIsPreparingExport(false);
    }
  };

  useEffect(() => {
    void loadData(date);
  }, [date]);

  useEffect(() => {
    let isCancelled = false;

    async function loadDoctorNames() {
      try {
        const items = await window.journalAPI.getDoctorNames();

        if (!isCancelled) {
          setDoctorNames(items);
        }
      } catch (error) {
        console.error("Не удалось загрузить список врачей", error);

        if (!isCancelled) {
          setDoctorNames([]);
        }
      }
    }

    void loadDoctorNames();

    return () => {
      isCancelled = true;
    };
  }, []);

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
                    onDeleteResearch={handleDeleteResearch}
                    formatPatientName={formatPatientName}
                    formatDateRu={formatDateRu}
                  />
                </li>
              );
            })}
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

      {/* Модалка экспорта */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-800">Экспорт протоколов</h2>
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col gap-1 text-sm text-slate-700">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Режим
                </span>
                <select
                  value={exportMode}
                  onChange={(event) =>
                    setExportMode(event.target.value as ExportMode)
                  }
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="date">За выбранную дату</option>
                  <option value="period">За период</option>
                </select>
              </label>

              {exportMode === "period" ? (
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1 text-sm text-slate-700">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      С
                    </span>
                    <DatePickerField
                      value={isoToRu(exportStartDate)}
                      onChange={(val) => setExportStartDate(ruToIso(val))}
                      placeholder="дд.мм.гггг"
                    />
                  </label>

                  <label className="flex flex-1 flex-col gap-1 text-sm text-slate-700">
                    <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                      По
                    </span>
                    <DatePickerField
                      value={isoToRu(exportEndDate)}
                      onChange={(val) => setExportEndDate(ruToIso(val))}
                      placeholder="дд.мм.гггг"
                    />
                  </label>
                </div>
              ) : null}

              <label className="flex flex-col gap-1 text-sm text-slate-700">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Врач
                </span>
                <select
                  value={selectedDoctorName}
                  onChange={(event) => setSelectedDoctorName(event.target.value)}
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Все врачи</option>
                  {doctorNames.map((doctorName) => (
                    <option key={doctorName} value={doctorName}>
                      {doctorName}
                    </option>
                  ))}
                </select>
              </label>

              <p className="text-xs text-slate-500">
                Экспорт собирает готовые печатные версии исследований в один HTML-файл
                с сохранением оформления. При выборе врача выгрузятся только его
                исследования.
              </p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsExportModalOpen(false);
                  void handleExport();
                }}
                disabled={isPreparingExport}
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-sky-500/70 transition-all hover:-translate-y-[1px] hover:bg-sky-500 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <span className="i-ph-export-duotone text-base" />
                <span>
                  {isPreparingExport ? "Готовлю экспорт..." : "Экспортировать"}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      {exportResearchIds.length > 0 ? (
        <JournalExportRenderer
          researchIds={exportResearchIds}
          fileName={exportFileName}
          researchMeta={exportResearchMeta}
          onComplete={(result) => {
            setExportResearchIds([]);
            setExportResearchMeta({});
            setExportFileName("uzi-protocols.html");
            setFailedExports(result?.failedResearches ?? []);
          }}
        />
      ) : null}
    </div>
  );
};

export default Journal;
