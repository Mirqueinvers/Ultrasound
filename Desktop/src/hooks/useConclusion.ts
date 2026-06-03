import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export const useConclusion = <T>(
  setForm: Dispatch<SetStateAction<T>>,  // ← Generic T
  organ: string
) => {
  useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ: eventOrgan } = event.detail;
      if (eventOrgan === organ) {
        setForm((prev: T) => ({  // ← Типизировано prev: T
          ...prev,
          conclusion: (prev as any).conclusion  // ← Безопасный доступ
            ? (prev as any).conclusion + ((prev as any).conclusion.endsWith(".") ? " " : ". ") + text
            : text,
        }));
      }
    };

    window.addEventListener("add-conclusion-text", handleAddText as EventListener);
    return () => window.removeEventListener("add-conclusion-text", handleAddText as EventListener);
  }, [setForm, organ]);
};
