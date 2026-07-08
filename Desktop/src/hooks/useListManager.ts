import { useCallback } from 'react';
import type { Dispatch, SetStateAction } from 'react';

export const useListManager = <T, F>(
  list: T[],
  form: F,
  setForm: Dispatch<SetStateAction<F>>,
  onChange?: (data: F) => void,
  listKey: keyof F
) => {
  const addItem = useCallback((newItem: T) => {
    const updated = { ...form, [listKey]: [...list, newItem] as unknown as F[keyof F] };
    setForm(updated as F);
    onChange?.(updated as F);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, form, setForm, onChange, listKey]);

  const updateItem = useCallback((
    index: number,
    field: keyof T,
    val: string | number
  ) => {
    const updatedList = list.map((item: T, i: number) =>
      i === index ? { ...item, [field]: val } : item
    );
    const updated = { ...form, [listKey]: updatedList as unknown as F[keyof F] };
    setForm(updated as F);
    onChange?.(updated as F);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, form, setForm, onChange, listKey]);

  const removeItem = useCallback((index: number) => {
    const updatedList = list.filter((_item: T, i: number) => i !== index);
    const updated = { ...form, [listKey]: updatedList as unknown as F[keyof F] };
    setForm(updated as F);
    onChange?.(updated as F);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list, form, setForm, onChange, listKey]);

  return { addItem, updateItem, removeItem };
};
