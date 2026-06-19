import { useState, useCallback, useRef } from "react";
import type { ToastData, ToastType } from "../components/Toast";

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const idRef = useRef(0);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}