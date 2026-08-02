// src/hooks/organs/useSpleen.ts
import { useOrganForm } from "../useOrganForm";
import { defaultSpleenState } from "../../types/defaultStates/organs/spleen";
import type { SpleenProtocol } from "../../types/organs/spleen";

/**
 * Специфика селезёнки: форма + useConclusion.
 * Используется компонентом Spleen (стал презентационным).
 */
export const useSpleen = (
  value?: SpleenProtocol,
  onChange?: (value: SpleenProtocol) => void,
) => {
  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultSpleenState,
    organKey: "spleen",
    onChange,
  });

  const isSplenectomy = form.position === "спленэктомия";

  return {
    form,
    setForm,
    updateField,
    commit,
    isSplenectomy,
  };
};