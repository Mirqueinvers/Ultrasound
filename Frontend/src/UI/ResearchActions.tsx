// Frontend/src/UI/ResearchActions.tsx
import React from "react";

interface ResearchActionsProps {
  isSaving: boolean;
  hasSelectedStudies: boolean;
  onCancel: () => void;
  onPrint: () => void;
  onSave: () => void;
}

export const ResearchActions: React.FC<ResearchActionsProps> = ({
  isSaving,
  hasSelectedStudies,
  onCancel,
  onPrint,
  onSave,
}) => (
  <div className="mt-8 ml-10 flex flex-wrap items-center gap-3">
    {hasSelectedStudies && (
      <>
        <button
          onClick={onSave}
          disabled={isSaving}
          className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold shadow-sm transition-all ${
            isSaving
              ? "bg-emerald-300 text-emerald-50 cursor-not-allowed"
              : "bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md"
          }`}
        >
          {isSaving ? "Сохранение..." : "Сохранить исследование"}
        </button>

        <button
          onClick={onPrint}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-5 py-2 text-sm font-medium text-indigo-700 shadow-sm ring-1 ring-indigo-100 transition-all hover:bg-indigo-100 hover:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Печать
        </button>
      </>
    )}

    <button
      onClick={onCancel}
      disabled={isSaving}
      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      Отменить
    </button>
  </div>
);
