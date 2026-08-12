import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export const useFieldUpdate = <T extends object>(
  form: T,
  setForm: Dispatch<SetStateAction<T>>,
  onChange?: (value: T) => void
) => {
  return useCallback((field: keyof T, val: string) => {
    const updated = { ...form, [field]: val } as T;
    setForm(updated);
    onChange?.(updated);
  }, [form, setForm, onChange]);
};
