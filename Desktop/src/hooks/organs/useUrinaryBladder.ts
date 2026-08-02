// src/hooks/organs/useUrinaryBladder.ts
import { useCallback } from "react";
import { useOrganForm } from "../useOrganForm";
import { useOrganVolume } from "../useOrganVolume";
import { defaultUrinaryBladderState } from "../../types/defaultStates/organs/urinaryBladder";
import type { UrinaryBladderProtocol } from "../../types/organs/urinarybladder";

const VOLUME_COEFFICIENT = 0.523;
const VOLUME_PRECISION = 0; // мочевой пузырь — целые мл
const CONTENT_HOMOGENEOUS = "однородное";

/**
 * Специфика мочевого пузыря:
 * форма + два авто-расчёта объёма (основной и остаточной мочи, precision 0)
 * + очистка описания содержимого при «однородное».
 * Используется компонентом UrinaryBladder (стал презентационным).
 */
export const useUrinaryBladder = (
  value?: UrinaryBladderProtocol,
  onChange?: (value: UrinaryBladderProtocol) => void,
) => {
  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultUrinaryBladderState,
    organKey: null,
    onChange,
  });

  // Объём основного пузыря
  useOrganVolume({
    length: form.length,
    width: form.width,
    depth: form.depth,
    volume: form.volume,
    coefficient: VOLUME_COEFFICIENT,
    precision: VOLUME_PRECISION,
    onVolumeChange: (volume) => {
      if (volume !== form.volume) {
        commit({ ...form, volume });
      }
    },
  });

  // Объём остаточной мочи
  useOrganVolume({
    length: form.residualLength,
    width: form.residualWidth,
    depth: form.residualDepth,
    volume: form.residualVolume,
    coefficient: VOLUME_COEFFICIENT,
    precision: VOLUME_PRECISION,
    onVolumeChange: (volume) => {
      if (volume !== form.residualVolume) {
        commit({ ...form, residualVolume: volume });
      }
    },
  });

  /** Спец-логика: очистка описания содержимого при «однородное» */
  const updateContents = useCallback(
    (field: keyof UrinaryBladderProtocol, val: string) => {
      const draft: UrinaryBladderProtocol = { ...form, [field]: val };

      if (field === "contents" && val === CONTENT_HOMOGENEOUS) {
        draft.contentsText = "";
      }

      commit(draft);
    },
    [form, commit],
  );

  return {
    form,
    setForm,
    updateField,
    commit,
    updateContents,
  };
};

export const URINARY_BLADDER_OPTIONS = {
  contentHomogeneous: CONTENT_HOMOGENEOUS,
} as const;