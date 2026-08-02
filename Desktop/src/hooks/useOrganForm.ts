// src/hooks/useOrganForm.ts
import { useCallback, useEffect, useMemo, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";
import { useFormState } from "./useFormState";
import { useConclusion } from "./useConclusion";

// T — любой объект протокола органа (SingleTestisProtocol, TestisProtocol и т.д.)
export interface UseOrganFormOptions<T extends object> {
  /** Значение из пропсов (value) */
  value?: T | null;
  /** Дефолтное состояние органа (defaultState) */
  defaults: T;
  /** Ключ органа для useConclusion (например "rightTestis"). null = не подписываться */
  organKey: string | null;
  onChange?: (value: T) => void;
  /** Доп. слияние списков (nodesList, myomaNodesList и т.п.) */
  mergeLists?: (value?: T | null) => Partial<T>;
}

export interface UseOrganFormResult<T extends object> {
  form: T;
  setForm: Dispatch<SetStateAction<T>>;
  updateField: (field: keyof T, val: string) => void;
  /** setForm + onChange одной операцией (для вычислений/спец-логики) */
  commit: (draft: T) => void;
  /** Слияние value с дефолтами (для переиспользования) */
  mergeValue: (value?: T | null) => T;
}

/**
 * Общий хук формы органа: value → form, sync с value, updateField, useConclusion.
 * Заменяет ручной паттерн:
 *   initialValue = {...defaults, ...value}
 *   const [form, setForm] = useFormState(initialValue)
 *   useEffect(() => setForm(initialValue), [initialValue])
 *   const updateField = useFieldUpdate(form, setForm, onChange)
 *   useConclusion(setForm, organKey)
 */
export const useOrganForm = <T extends object>({
  value,
  defaults,
  organKey,
  onChange,
  mergeLists,
}: UseOrganFormOptions<T>): UseOrganFormResult<T> => {
  const mergeValue = useCallback(
    (v?: T | null): T => ({
      ...defaults,
      ...(v || {}),
      ...(mergeLists?.(v) || {}),
    }),
    [defaults, mergeLists],
  );

  // initialValue пересоздаётся только при изменении value/mergeValue
  const initialValue = useMemo(() => mergeValue(value), [value, mergeValue]);
  const [form, setForm] = useFormState<T>(initialValue);

  // Sync value → form по reference (как в KidneyCommon), без пересоздания на каждый render
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;
    setForm(mergeValue(value));
  }, [value, mergeValue, setForm]);

  const updateField = useCallback(
    (field: keyof T, val: string) => {
      const updated = { ...form, [field]: val } as T;
      setForm(updated);
      onChange?.(updated);
    },
    [form, setForm, onChange],
  );

  // organKey=null → useConclusion сам пропустит подписку
  useConclusion(setForm, organKey);

  const commit = useCallback(
    (draft: T) => {
      setForm(draft);
      onChange?.(draft);
    },
    [setForm, onChange],
  );

  return { form, setForm, updateField, commit, mergeValue };
};