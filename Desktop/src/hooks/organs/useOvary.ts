// src/hooks/organs/useOvary.ts
import { useCallback } from "react";
import { useOrganForm } from "../useOrganForm";
import { useOrganVolume } from "../useOrganVolume";
import { useListManager } from "../useListManager";
import { defaultOvaryState } from "../../types/defaultStates/organs/ovary";
import type { OvaryCyst, OvaryProtocol } from "../../types/organs/ovary";

const VOLUME_COEFFICIENT = 0.523;
const POSITION_NORMAL = "обычное";
const POSITION_NOT_VISIBLE = "не визуализируется";

const EMPTY_CYST: OvaryCyst = { size: "" };

/**
 * Специфика яичника (левый/правый):
 * форма + авто-расчёт объёма (только при «обычное») + список кист.
 * Используется компонентом Ovary (стал презентационным).
 */
export const useOvary = (
  side: "left" | "right",
  value?: OvaryProtocol,
  onChange?: (value: OvaryProtocol) => void,
) => {
  const organName = side === "left" ? "leftOvary" : "rightOvary";

  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultOvaryState,
    organKey: organName,
    onChange,
    mergeLists: (v) => ({
      cystsList: v?.cystsList || [],
    }),
  });

  const position = form.position || POSITION_NORMAL;
  const isVisible = position === POSITION_NORMAL;

  useOrganVolume({
    length: form.length,
    width: form.width,
    depth: form.thickness,
    volume: form.volume,
    coefficient: VOLUME_COEFFICIENT,
    enabled: isVisible,
    onVolumeChange: (volume) => {
      if (volume && volume !== form.volume) {
        commit({ ...form, volume });
      }
    },
  });

  const cystsManager = useListManager(
    form.cystsList,
    form,
    setForm,
    "cystsList",
    onChange,
  );

  const addCyst = useCallback(() => {
    cystsManager.addItem(EMPTY_CYST);
  }, [cystsManager]);

  /** Обновление "size" кисты в формате "10x15" */
  const updateCystSize = useCallback(
    (index: number, part: "size1" | "size2", value: string) => {
      const [size1, size2] = form.cystsList[index]?.size.split("x") ?? ["", ""];

      const newSize =
        part === "size1"
          ? value + (size2 ? `x${size2}` : "")
          : size1 + (value ? `x${value}` : "");

      cystsManager.updateItem(index, "size", newSize);
    },
    [form.cystsList, cystsManager],
  );

  return {
    form,
    setForm,
    updateField,
    commit,
    position,
    isVisible,
    cystsManager,
    addCyst,
    updateCystSize,
  };
};

export const OVARY_OPTIONS = {
  positionNormal: POSITION_NORMAL,
  positionNotVisible: POSITION_NOT_VISIBLE,
} as const;