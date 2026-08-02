// src/hooks/organs/useProstate.ts
import { useOrganForm } from "../useOrganForm";
import { useOrganVolume } from "../useOrganVolume";
import { defaultProstateState } from "../../types/defaultStates/organs/prostate";
import type { ProstateProtocol } from "../../types/organs/prostate";

const VOLUME_COEFFICIENT = 0.523;
const POSITION_NORMAL = "обычное";

/**
 * Специфика простаты:
 * форма + авто-расчёт объёма (только при «обычное»).
 * Используется компонентом Prostate (стал презентационным).
 */
export const useProstate = (
  value?: ProstateProtocol,
  onChange?: (value: ProstateProtocol) => void,
) => {
  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultProstateState,
    organKey: "prostate",
    onChange,
  });

  const position = form.position || POSITION_NORMAL;
  const isPresent = position === POSITION_NORMAL;

  useOrganVolume({
    length: form.length,
    width: form.width,
    depth: form.apDimension,
    volume: form.volume,
    coefficient: VOLUME_COEFFICIENT,
    enabled: isPresent,
    onVolumeChange: (volume) => {
      if (volume && volume !== form.volume) {
        commit({ ...form, volume });
      }
    },
  });

  return {
    form,
    setForm,
    updateField,
    commit,
    position,
    isPresent,
  };
};

export const PROSTATE_OPTIONS = {
  positionNormal: POSITION_NORMAL,
} as const;