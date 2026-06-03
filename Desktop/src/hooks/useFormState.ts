// src/hooks/useFormState.ts
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";

export const useFormState = <T>(
  defaultState: T,
): [T, Dispatch<SetStateAction<T>>] => {
  return useState<T>(defaultState);
};
