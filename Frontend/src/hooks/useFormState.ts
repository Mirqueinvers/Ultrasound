// src/hooks/useFormState.ts
import { useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';  // ← type-only импорт!

export const useFormState = <T>(
  defaultState: T, 
  value?: T
): [T, Dispatch<SetStateAction<T>>] => {
  return useState<T>({
    ...defaultState,
    ...(value || {}),
  });
};
