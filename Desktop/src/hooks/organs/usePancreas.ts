// src/hooks/organs/usePancreas.ts
import { useOrganForm } from "../useOrganForm";
import { defaultPancreasState } from "../../types/defaultStates/organs/pancreas";
import type { PancreasProtocol } from "../../types/organs/pancreas";

/**
 * Специфика поджелудочной железы: форма + useConclusion.
 * Используется компонентом Pancreas (стал презентационным).
 */
export const usePancreas = (
  value?: PancreasProtocol,
  onChange?: (value: PancreasProtocol) => void,
) => {
  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultPancreasState,
    organKey: "pancreas",
    onChange,
  });

  return {
    form,
    setForm,
    updateField,
    commit,
  };
};