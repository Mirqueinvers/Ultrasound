import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export const useFieldUpdate = <T extends Record<string, any>>(
  form: T,
  setForm: Dispatch<SetStateAction<T>>,
  onChange?: (value: T) => void
) => {
  return useCallback((field: keyof T, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    onChange?.(updated);
  }, [form, setForm, onChange]);
};
