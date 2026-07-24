import React, { useEffect, useRef, useState } from "react";
import DatePickerField from "@/components/common/DatePickerField";
import { JournalExportRenderer } from "@/components/journal/JournalExportRenderer";
import type { JournalExportRendererApi } from "@/components/journal/JournalExportRenderer";

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

const formatPatientName = (patient: { last_name: string; first_name: string; middle_name?: string }) =>
  `${patient.last_name} ${patient.first_name}${patient.middle_name ? ` ${patient.middle_name}` : ""}`;

const formatDateRu = (value: string) => {
  if (!value) return "";
  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return value;
  return parsedDate.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isoToRu = (iso: string): string => {
  if (!iso) return "";
  const match = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return iso;
  return `${match[3]}.${match[2]}.${match[1]}`;
};

const ruToIso = (ru: string): string => {
  if (!ru) return "";
  const match = ru.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (!match) return ru;
  return `${match[3]}-${match[2]}-${match[1]}`;
};

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  journalDate: string;
}

const ExportModal: React.FC<ExportModalProps> = ({ isOpen, onClose, journalDate }) => {
  const exportRendererRef = useRef<JournalExportRendererApi>(null);

  // Шаг 1: параметры
  const [step, setStep] = useState<"params" | "export">("params");
  const [exportMode, setExportMode] = useState<ExportMode>("date");
  const [exportStartDate, setExportStartDate] = useState(journalDate);
  const [exportEndDate, setExportEndDate] = useState(journalDate);
  const [selectedDoctorName, setSelectedDoctorName] = useState("");
  const [doctorNames, setDoctorNames] = useState<string[]>([]);
  const [isPreparingExport, setIsPreparingExport] = useState(false);

  // Шаг 2: экспорт
  const [exportResearchIds, setExportResearchIds] = useState<number[]>([]);
  const [exportResearchMeta, setExportResearchMeta] = useState<ExportResearchMeta>({});
  const [exportFileName, setExportFileName] = useState("uzi-protocols.html");
  const [failedExports, setFailedExports] = useState<FailedExport[]>([]);

  useEffect(() => {
    let isCancelled = false;

    async function loadDoctorNames() {
      try {
        const items = await window.journalAPI.getDoctorNames();
        if (!isCancelled) {
          setDoctorNames(items);
        }
      } catch {
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

  // Сброс при открытии
  useEffect(() => {
    if (isOpen) {
      setStep("params");
      setExportMode("date");
      setExportStartDate(journalDate);
      setExportEndDate(journalDate);
      setSelectedDoctorName("");
      setFailedExports([]);
      setExportResearchIds([]);
      setExportResearchMeta({});
      setExportFileName("uzi-protocols.html");
    }
  }, [isOpen, journalDate]);

  const handleStartExport = async () => {
    const startDate = exportMode === "date" ? journalDate : exportStartDate;
    const endDate = exportMode === "date" ? journalDate : exportEndDate;

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
      setStep("export");
    } catch (error) {
      console.error("Ошибка подготовки экспорта", error);
      window.alert("Не удалось подготовить экспорт.");
    } finally {
      setIsPreparingExport(false);
    }
  };

  const handleExportComplete = (result?: { failedResearches: FailedExport[] }) => {
    setFailedExports(result?.failedResearches ?? []);
    setExportResearchIds([]);
    setExportResearchMeta({});
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
    } catch {
      window.alert("Не удалось скопировать список. Попробуйте еще раз.");
    }
  };

  const isAllDone =
    !exportRendererRef.current?.isReady &&
    exportResearchIds.length === 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Шапка */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-800">
            {step === "params" ? "Экспорт протоколов" : "Отправка протоколов"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Шаг 1: Параметры экспорта */}
        {step === "params" && (
          <>
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
                onClick={onClose}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => void handleStartExport()}
                disabled={isPreparingExport}
                className="inline-flex items-center gap-2 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-sky-500/70 transition-all hover:-translate-y-[1px] hover:bg-sky-500 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
              >
                <span className="i-ph-export-duotone text-base" />
                <span>
                  {isPreparingExport ? "Готовлю экспорт..." : "Далее"}
                </span>
              </button>
            </div>
          </>
        )}

        {/* Шаг 2: Отправка */}
        {step === "export" && (
          <>
            <div className="flex flex-col gap-4">
              {/* Счётчик протоколов */}
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                  {exportResearchIds.length}
                </span>
                <span>
                  {exportRendererRef.current?.isReady
                    ? "Протоколы готовы к экспорту"
                    : "Подготовка протоколов..."}
                </span>
              </div>

              {/* IP-адрес */}
              <label className="flex flex-col gap-1 text-sm text-slate-700">
                <span className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  IP-адрес MyWorkSpace
                </span>
                <input
                  type="text"
                  value={exportRendererRef.current?.targetIp ?? ""}
                  onChange={(e) => exportRendererRef.current?.setTargetIp(e.target.value)}
                  placeholder="192.168.1.100"
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  disabled={exportRendererRef.current?.networkStatus === "sending"}
                />
              </label>

              {/* Кнопки действий */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => void exportRendererRef.current?.handleSaveToFile()}
                  disabled={!exportRendererRef.current?.isReady}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Сохранить в файл</span>
                </button>

                <button
                  type="button"
                  onClick={() => void exportRendererRef.current?.handleSendOverNetwork()}
                  disabled={!exportRendererRef.current?.isReady || !exportRendererRef.current?.targetIp.trim() || exportRendererRef.current?.networkStatus === "sending"}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm ring-1 ring-sky-500/70 transition-all hover:-translate-y-[1px] hover:bg-sky-500 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {exportRendererRef.current?.networkStatus === "sending" ? (
                    <>
                      <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      <span>Отправка...</span>
                    </>
                  ) : (
                    <>
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                      <span>Отправить по сети</span>
                    </>
                  )}
                </button>
              </div>

              {/* Сообщение о результате отправки */}
              {exportRendererRef.current?.networkMessage ? (
                <span
                  className={`text-xs ${
                    exportRendererRef.current.networkStatus === "error"
                      ? "text-red-600"
                      : exportRendererRef.current.networkStatus === "sent"
                        ? "text-green-600"
                        : "text-slate-500"
                  }`}
                >
                  {exportRendererRef.current.networkMessage}
                </span>
              ) : null}

              {/* Неудавшиеся протоколы */}
              {failedExports.length > 0 && isAllDone && (
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
              )}
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                Закрыть
              </button>
              {!isAllDone && (
                <button
                  type="button"
                  onClick={() => {
                    setExportResearchIds([]);
                    setStep("params");
                  }}
                  className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Назад
                </button>
              )}
            </div>
          </>
        )}

        {/* Скрытый рендерер протоколов (всегда смонтирован когда на шаге export) */}
        {step === "export" && exportResearchIds.length > 0 && (
          <div style={{ display: "none" }}>
            <JournalExportRenderer
              ref={exportRendererRef}
              researchIds={exportResearchIds}
              fileName={exportFileName}
              researchMeta={exportResearchMeta}
              onComplete={handleExportComplete}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportModal;