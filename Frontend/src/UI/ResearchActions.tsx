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
  <div className="mt-6 flex gap-3">
    <button
      onClick={onCancel}
      disabled={isSaving}
      className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Отменить
    </button>

    {hasSelectedStudies && (
      <>
        <button
          onClick={onPrint}
          disabled={isSaving}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Печать
        </button>

        <button
          onClick={onSave}
          disabled={isSaving}
          className={`px-4 py-2 rounded transition-colors font-medium ${
            isSaving
              ? "bg-slate-400 text-slate-200 cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {isSaving ? "Сохранение..." : "Сохранить исследование"}
        </button>
      </>
    )}
  </div>
);
