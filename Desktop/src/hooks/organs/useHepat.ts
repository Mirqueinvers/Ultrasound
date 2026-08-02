// src/hooks/organs/useHepat.ts
import { useCallback } from "react";
import { useOrganForm } from "../useOrganForm";
import { defaultLiverState } from "../../types/defaultStates/organs/liver";
import type { LiverProtocol } from "../../types/organs/hepat";

/**
 * Специфика печени: форма + useConclusion + автоподстановка
 * rightLobeTotal = ККР + ПЗР (правая доля) и leftLobeTotal (левая доля).
 * Используется компонентом Hepat (стал презентационным).
 */
export const useHepat = (
  value?: LiverProtocol,
  onChange?: (value: LiverProtocol) => void,
) => {
  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultLiverState,
    organKey: "liver",
    onChange,
  });

  const updateFieldWithTotals = useCallback(
    (field: keyof LiverProtocol, val: string) => {
      const updated: LiverProtocol = { ...form, [field]: val };

      if (field === "rightLobeAP" || field === "rightLobeCCR") {
        const ap =
          parseFloat(field === "rightLobeAP" ? val : form.rightLobeAP) || 0;
        const ccr =
          parseFloat(field === "rightLobeCCR" ? val : form.rightLobeCCR) || 0;

        updated.rightLobeTotal = ap > 0 && ccr > 0 ? (ccr + ap).toString() : "";
      }

      if (field === "leftLobeAP" || field === "leftLobeCCR") {
        const ap =
          parseFloat(field === "leftLobeAP" ? val : form.leftLobeAP) || 0;
        const ccr =
          parseFloat(field === "leftLobeCCR" ? val : form.leftLobeCCR) || 0;

        updated.leftLobeTotal = ap > 0 && ccr > 0 ? (ccr + ap).toString() : "";
      }

      commit(updated);
    },
    [form, commit],
  );

  return {
    form,
    setForm,
    updateField,
    updateFieldWithTotals,
    commit,
  };
};