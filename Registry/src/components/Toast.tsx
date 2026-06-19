import { useEffect } from "react";
import { CheckCircle, XCircle, AlertCircle, X } from "lucide-react";

export type ToastType = "success" | "error" | "info";

export interface ToastData {
  id: number;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastData;
  onClose: (id: number) => void;
}

const ICONS = {
  success: CheckCircle,
  error: XCircle,
  info: AlertCircle,
};

const STYLES = {
  success: "bg-emerald-50 border-emerald-200 text-emerald-800",
  error: "bg-red-50 border-red-200 text-red-800",
  info: "bg-sky-50 border-sky-200 text-sky-800",
};

const ICON_COLORS = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-sky-500",
};

function ToastItem({ toast, onClose }: ToastProps) {
  const Icon = ICONS[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => onClose(toast.id), 4000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  return (
    <div
      className={`flex items-center gap-2 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300 animate-slide-in ${STYLES[toast.type]}`}
      style={{
        animation: "slideIn 0.3s ease-out",
      }}
    >
      <Icon size={18} className={`shrink-0 ${ICON_COLORS[toast.type]}`} />
      <p className="text-sm font-medium flex-1">{toast.message}</p>
      <button
        onClick={() => onClose(toast.id)}
        className="shrink-0 p-0.5 rounded hover:bg-black/5 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onClose: (id: number) => void;
}

export default function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={onClose} />
      ))}
    </div>
  );
}