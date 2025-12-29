import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export const useListManager = <T>(
  list: T[],
  form: any,
  setForm: Dispatch<SetStateAction<any>>,
  onChange: any,
  listKey: string
) => {
  const addItem = useCallback((newItem: T) => {
    const updated = { ...form, [listKey]: [...list, newItem] };
    setForm(updated);
    onChange?.(updated);
  }, [list, form, setForm, onChange, listKey]);

  const updateItem = useCallback((
    index: number,
    field: keyof T,
    val: string
  ) => {
    const updatedList = list.map((item: T, i: number) =>
      i === index ? { ...item, [field]: val } : item
    );
    const updated = { ...form, [listKey]: updatedList };
    setForm(updated);
    onChange?.(updated);
  }, [list, form, setForm, onChange, listKey]);

  const removeItem = useCallback((index: number) => {
    const updatedList = list.filter((_: any, i: number) => i !== index);
    const updated = { ...form, [listKey]: updatedList };
    setForm(updated);
    onChange?.(updated);
  }, [list, form, setForm, onChange, listKey]);

  return { addItem, updateItem, removeItem };
};
