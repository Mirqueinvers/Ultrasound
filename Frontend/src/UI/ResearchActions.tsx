// Frontend/src/UI/ResearchActions.tsx
import React from "react";

interface ResearchActionsProps {
  isSaving: boolean;
  hasSelectedStudies: boolean;
  onCancel: () => void;
  onPrint: () => void;
  onSave: () => void;
  onStartNewResearch: () => void;
  isPrintEnabled: boolean;
}

type ConfirmType = "cancel" | "new" | null;

const ConfirmDialog: React.FC<{
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
}> = ({ open, title, message, onConfirm, onClose }) => {
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

export const ResearchActions: React.FC<ResearchActionsProps> = ({
  isSaving,
  hasSelectedStudies,
  onCancel,
  onPrint,
  onSave,
  onStartNewResearch,
  isPrintEnabled,
}) => {
  const [confirmType, setConfirmType] = React.useState<ConfirmType>(null);

  const handleStartNewResearchClick = () => {
    setConfirmType("new");
  };

  const handleCancelClick = () => {
    setConfirmType("cancel");
  };

  const handleCloseDialog = () => {
    setConfirmType(null);
  };

  const handleConfirm = () => {
    if (confirmType === "new") {
      onStartNewResearch();
    } else if (confirmType === "cancel") {
      onCancel();
    }
  };

  const isDialogOpen = confirmType !== null;

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

            <button
              onClick={handleStartNewResearchClick}
              disabled={isSaving}
              className="inline-flex items-center justify-center rounded-full bg-slate-100 px-5 py-2 text-sm font-medium text-slate-800 shadow-sm ring-1 ring-slate-200 transition-all hover:bg-slate-200 hover:ring-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Начать новое исследование
            </button>
          </>
        )}

        <button
          onClick={handleCancelClick}
          disabled={isSaving}
          className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Отменить
        </button>
      </div>

      <ConfirmDialog
        open={isDialogOpen}
        title={
          confirmType === "new"
            ? "Начать новое исследование?"
            : "Отменить текущее исследование?"
        }
        message="Несохранённые изменения будут потеряны."
        onConfirm={handleConfirm}
        onClose={handleCloseDialog}
      />
    </>
  );
};

export default ResearchActions;
