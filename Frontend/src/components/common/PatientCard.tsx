// // Frontend/src/components/common/PatientCard.tsx

import React from "react";
import type { Patient, Research } from "@/types";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  title,
  message,
  onConfirm,
  onClose,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <h3 className="mb-2 text-base font-semibold text-slate-900">
          {title}
        </h3>
        <p className="mb-4 text-sm text-slate-700">{message}</p>

        <div className="mt-2 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            Отмена
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
          >
            Да
          </button>
        </div>
      </div>
    </div>
  );
};

export interface PatientCardProps {
  patient: Patient;
  researches: Research[];
  isExpanded: boolean;
  onToggle: () => void;
  onOpenProtocol: (researchId: number) => void;
  onEditPatient?: () => void;
  onDeleteResearch?: (researchId: number) => void;
  formatPatientName: (p: Patient) => string;
  formatDateRu: (value: string) => string;
}

export const PatientCard: React.FC<PatientCardProps> = ({
  patient,
  researches,
  isExpanded,
  onToggle,
  onOpenProtocol,
  onEditPatient,
  onDeleteResearch,
  formatPatientName,
  formatDateRu,
}) => {
  const totalResearches = researches.length;
  const omsCount = researches.filter((r) => r.payment_type === "oms").length;
  const paidCount = totalResearches - omsCount;

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [researchToDelete, setResearchToDelete] = React.useState<number | null>(null);

  const handleDeleteResearchClick = (researchId: number) => {
    setResearchToDelete(researchId);
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (researchToDelete && onDeleteResearch) {
      onDeleteResearch(researchToDelete);
    }
    setResearchToDelete(null);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setResearchToDelete(null);
  };

  return (
    <div className="rounded-xl bg-white shadow-sm ring-1 ring-slate-200/80 transition-shadow hover:shadow-md">
      {/* Кликабельная шапка карточки */}
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-4 py-3"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold uppercase text-sky-700">
            {patient.last_name?.[0]}
            {patient.first_name?.[0]}
          </div>

          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-semibold text-slate-900">
                {formatPatientName(patient)}
              </span>

              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-600">
                {totalResearches} исслед.
              </span>
            </div>

            <div className="mt-0.5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
              <span>
                Дата рождения:{" "}
                <span className="font-medium text-slate-700">
                  {formatDateRu(patient.date_of_birth)}
                </span>
              </span>
              {totalResearches > 0 && (
                <>
                  <span className="h-3 w-px bg-slate-200" />
                  <span>
                    ОМС:{" "}
                    <span className="font-medium text-emerald-600">
                      {omsCount}
                    </span>
                  </span>
                  <span>
                    Платно:{" "}
                    <span className="font-medium text-sky-600">
                      {paidCount}
                    </span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <svg
            className={`h-3 w-3 transform text-slate-500 transition-transform ${
              isExpanded ? "rotate-180" : ""
            }`}
            viewBox="0 0 16 16"
            aria-hidden="true"
          >
            <path
              d="M4 6l4 4 4-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </button>

      {/* Кнопка редактирования — снаружи, не внутри <button> */}
      {onEditPatient && (
        <div className="px-4 pb-2 pt-1">
          <button
            type="button"
            onClick={onEditPatient}
            className="text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline"
          >
            Редактировать пациента
          </button>
        </div>
      )}

      {isExpanded && researches.length > 0 && (
        <div className="border-t border-slate-100 bg-slate-50/60 px-4 py-3 text-sm">
          <ul className="space-y-2">
            {researches.map((r) => (
              <li
                key={r.id}
                className="flex flex-col gap-2 rounded-lg bg-white px-3 py-2.5 text-xs text-slate-700 shadow-sm ring-1 ring-slate-200/70 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                      Врач:
                    </span>
                    <span className="text-xs text-slate-900">
                      {r.doctor_name || "—"}
                    </span>
                  </div>

                  {r.study_types && r.study_types.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1">
                      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Исследования:
                      </span>
                      <span className="text-[11px] text-slate-700">
                        {r.study_types.join(", ")}
                      </span>
                    </div>
                  )}

                  {r.notes && (
                    <div className="mt-0.5 max-w-xl text-[11px] text-slate-500">
                      Заметки: {r.notes}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => onOpenProtocol(r.id)}
                      className="mt-1 self-start text-[11px] font-medium text-sky-600 hover:text-sky-700 hover:underline"
                    >
                      Посмотреть протокол исследования
                    </button>
                    {onDeleteResearch && (
                      <button
                        type="button"
                        onClick={() => handleDeleteResearchClick(r.id)}
                        className="mt-1 self-start text-[11px] font-medium text-red-600 hover:text-red-700 hover:underline"
                      >
                        Удалить исследование
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                  <span
                    className={`rounded-full border px-2 py-0.5 font-medium ${
                      r.payment_type === "oms"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-sky-200 bg-sky-50 text-sky-700"
                    }`}
                  >
                    {r.payment_type === "oms" ? "ОМС" : "Платно"}
                  </span>
                  <span className="h-3 w-px bg-slate-200" />
                  <span className="font-medium text-slate-700">
                    {formatDateRu(r.research_date)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={isDeleteDialogOpen}
        title="Удалить исследование?"
        message="Это действие нельзя отменить. Исследование будет безвозвратно удалено."
        onConfirm={handleConfirmDelete}
        onClose={handleCloseDeleteDialog}
      />
    </div>
  );
};
