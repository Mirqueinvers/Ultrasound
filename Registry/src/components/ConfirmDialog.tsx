import { AlertTriangle, X } from "lucide-react";

interface ConfirmDialogProps {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  title,
  message,
  confirmLabel = "Удалить",
  cancelLabel = "Отмена",
  variant = "danger",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmStyles =
    variant === "danger"
      ? "bg-red-600 hover:bg-red-500 text-white ring-1 ring-red-500/70"
      : "bg-amber-600 hover:bg-amber-500 text-white ring-1 ring-amber-500/70";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800">{title}</h3>
            <p className="text-sm text-slate-500 mt-1">{message}</p>
          </div>
          <button
            onClick={onCancel}
            className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2 mt-5">
          <button
            onClick={onCancel}
            className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold shadow-sm transition-all hover:-translate-y-[1px] hover:shadow-md active:translate-y-0 active:shadow-sm ${confirmStyles}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}