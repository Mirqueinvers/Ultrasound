// src/hooks/organs/useTestis.ts
import { useOrganForm } from "../useOrganForm";
import { useOrganVolume } from "../useOrganVolume";
import {
  defaultTestisState,
  defaultSingleTestisState,
} from "../../types/defaultStates/organs/testis";
import type {
  SingleTestisProtocol,
  TestisProtocol,
} from "../../types/organs/testis";

const VOLUME_COEFFICIENT = 0.523;

/**
 * Специфика одной стороны яичка (правое/левое):
 * форма + авто-расчёт объёма + useConclusion (rightTestis/leftTestis).
 * Используется компонентом TestisSide (стал презентационным).
 */
export const useTestisSide = (
  side: "right" | "left",
  value?: SingleTestisProtocol | null,
  onChange?: (val: SingleTestisProtocol) => void,
) => {
  const organKey = side === "right" ? "rightTestis" : "leftTestis";

  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultSingleTestisState,
    organKey,
    onChange,
  });

  useOrganVolume({
    length: form.length,
    width: form.width,
    depth: form.depth,
    volume: form.volume,
    coefficient: VOLUME_COEFFICIENT,
    onVolumeChange: (volume) => {
      if (volume !== form.volume) {
        commit({ ...form, volume });
      }
    },
  });

  return { form, setForm, updateField, commit };
};

/**
 * Специфика протокола яичек целиком:
 * контейнер из двух сторон (right/left) + updateRight/updateLeft.
 * Используется компонентом Testis (стал презентационным).
 */
export const useTestis = (
  value?: TestisProtocol,
  onChange?: (value: TestisProtocol) => void,
) => {
  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultTestisState,
    organKey: null,
    onChange,
  });

  const updateRight = (right: SingleTestisProtocol) => {
    commit({ ...form, rightTestis: right });
  };

  const updateLeft = (left: SingleTestisProtocol) => {
    commit({ ...form, leftTestis: left });
  };

  return { form, setForm, updateField, updateRight, updateLeft };
};