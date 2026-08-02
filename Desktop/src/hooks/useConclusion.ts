import { useEffect } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export const useConclusion = <T>(
  setForm: Dispatch<SetStateAction<T>> | null,  // ← null = не подписываться
  organ: string | null
) => {
  useEffect(() => {
    if (!setForm || !organ) return;

    const handleAddText = (event: CustomEvent) => {
      const { text, organ: eventOrgan } = event.detail;
      if (eventOrgan === organ) {
        setForm((prev: T) => {
          const prevRecord = prev as Record<string, unknown>;
          const current =
            typeof prevRecord.conclusion === "string" ? prevRecord.conclusion : "";
          const next = current
            ? current + (current.endsWith(".") ? " " : ". ") + text
            : text;
          return { ...prev, conclusion: next } as T;
        });
      }
    };

    window.addEventListener("add-conclusion-text", handleAddText as EventListener);
    return () => window.removeEventListener("add-conclusion-text", handleAddText as EventListener);
  }, [setForm, organ]);
};
