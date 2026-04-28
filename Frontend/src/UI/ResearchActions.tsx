import React from "react";

interface ResearchActionsProps {
  isSaving: boolean;
  hasSelectedStudies: boolean;
  onClear: () => void;
  onPrint: () => void;
  onSave: () => void;
  isPrintEnabled: boolean;
}

export const ResearchActions: React.FC<ResearchActionsProps> = ({
  isSaving,
  hasSelectedStudies,
  onClear,
  onPrint,
  onSave,
  isPrintEnabled,
}) => {
  const [isClearConfirmOpen, setIsClearConfirmOpen] = React.useState(false);

  return (
    <>
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
              disabled={isSaving || !isPrintEnabled}
              className="inline-flex items-center justify-center rounded-full bg-indigo-50 px-5 py-2 text-sm font-medium text-indigo-700 shadow-sm ring-1 ring-indigo-100 transition-all hover:bg-indigo-100 hover:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Печать
            </button>
          </>
        )}

        <button
          onClick={() => setIsClearConfirmOpen(true)}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Очистить
        </button>
      </div>

      {isClearConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="mb-2 text-base font-semibold text-slate-900">
              Очистить текущее исследование?
            </h3>
            <p className="mb-4 text-sm text-slate-700">
              Несохранённые изменения будут потеряны.
            </p>

            <div className="mt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsClearConfirmOpen(false)}
                className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Отмена
              </button>
              <button
                type="button"
                onClick={() => {
                  onClear();
                  setIsClearConfirmOpen(false);
                }}
                className="rounded-full bg-rose-600 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-rose-700"
              >
                Да
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ResearchActions;
