// src/components/search/SearchSection.tsx

import { useState, useEffect } from "react";
import PrintSavedModal from "@/components/print/PrintSavedModal";
import { PatientCard } from "@/components/common/PatientCard";
import { PatientSearchInput } from "@/UI/PatientSearchInput";
import type { Patient, Research, JournalEntry } from "@/types";

const formatPatientName = (p: Patient) =>
  `${p.last_name} ${p.first_name}${p.middle_name ? ` ${p.middle_name}` : ""}`;

const formatDateRu = (value: string) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [expandedPatientIds, setExpandedPatientIds] = useState<number[]>([]);
  const [printResearchId, setPrintResearchId] = useState<number | null>(null);
  const [isPrintSavedOpen, setIsPrintSavedOpen] = useState(false);

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

  const runSearch = async () => {
    const query = searchQuery.trim();

    if (!query) {
      setEntries([]);
      setExpandedPatientIds([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setExpandedPatientIds([]);
    setHasSearched(true);
    try {
      const result = await window.patientSearchAPI.search(query);
      setEntries(result);
    } catch (e) {
      console.error("Ошибка поиска пациента", e);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setEntries([]);
      setExpandedPatientIds([]);
      setHasSearched(false);
    }
  }, [searchQuery]);

  return (
    <div className="content flex h-full flex-col gap-4 p-8">
      <PatientSearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        onSubmit={runSearch}
      />

      <div className="mt-4 flex-1 w-full overflow-auto rounded-xl border border-slate-200 bg-gradient-to-b from-slate-50 to-slate-100 p-3">
        {loading && (
          <div className="flex items-center justify-center rounded-lg bg-white/60 p-6 text-sm text-slate-500 shadow-sm">
            Поиск пациентов…
          </div>
        )}

        {!loading && !searchQuery.trim() && !hasSearched && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              <div className="mb-1 text-base font-medium text-slate-700">
                Введите данные пациента для поиска
              </div>
              <div className="text-xs text-slate-400">
                Например: «Иванов Иван Иванович», «01.01.1980» или иии01011980.
              </div>
            </div>
          </div>
        )}

        {!loading && hasSearched && searchQuery.trim() && entries.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-sm rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500 shadow-sm">
              <div className="mb-1 text-base font-medium text-slate-700">
                Пациенты не найдены
              </div>
              <div className="text-xs text-slate-400">
                Проверьте корректность ввода или попробуйте другой запрос.
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
    </div>
  );
}
