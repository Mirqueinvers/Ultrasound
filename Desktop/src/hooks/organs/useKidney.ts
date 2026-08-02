// src/hooks/organs/useKidney.ts
import { useCallback } from "react";
import { useOrganForm } from "../useOrganForm";
import { useListManager } from "../useListManager";
import { defaultKidneyState } from "../../types/defaultStates/organs/kidney";
import type {
  Concrement,
  Cyst,
  KidneyProtocol,
} from "../../types/organs/kidney";

const NOT_DETECTED = "не определяются";

const EMPTY_CONCREMENT: Concrement = { size: "", location: "" };
const EMPTY_CYST: Cyst = { size: "", location: "" };

/**
 * Специфика одной почки (левая/правая):
 * форма + 4 списка (конкременты/кисты паренхимы и ЧЛС) + переключение
 * множественных кист + очистка списков при «не определяются».
 * Используется компонентом KidneyCommon (стал презентационным).
 */
export const useKidney = (
  side: "left" | "right",
  value?: KidneyProtocol,
  onChange?: (value: KidneyProtocol) => void,
) => {
  const organKey = side === "left" ? "leftKidney" : "rightKidney";

  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultKidneyState,
    organKey,
    onChange,
    mergeLists: (v) => ({
      parenchymaConcrementslist: v?.parenchymaConcrementslist || [],
      parenchymaCystslist: v?.parenchymaCystslist || [],
      parenchymaMultipleCysts: v?.parenchymaMultipleCysts || false,
      parenchymaMultipleCystsSize: v?.parenchymaMultipleCystsSize || "",
      pcsConcrementslist: v?.pcsConcrementslist || [],
      pcsCystslist: v?.pcsCystslist || [],
      pcsMultipleCysts: v?.pcsMultipleCysts || false,
      pcsMultipleCystsSize: v?.pcsMultipleCystsSize || "",
    }),
  });

  const parenchymaConcrementsManager = useListManager(
    form.parenchymaConcrementslist,
    form,
    setForm,
    "parenchymaConcrementslist",
    onChange,
  );

  const parenchymaCystsManager = useListManager(
    form.parenchymaCystslist,
    form,
    setForm,
    "parenchymaCystslist",
    onChange,
  );

  const pcsConcrementsManager = useListManager(
    form.pcsConcrementslist,
    form,
    setForm,
    "pcsConcrementslist",
    onChange,
  );

  const pcsCystsManager = useListManager(
    form.pcsCystslist,
    form,
    setForm,
    "pcsCystslist",
    onChange,
  );

  /** Очистка списков при «не определяются» + кастомный cleanup */
  const updateSelect = useCallback(
    (
      field: keyof KidneyProtocol,
      val: string,
      cleanup?: (draft: KidneyProtocol) => void,
    ) => {
      const draft: KidneyProtocol = { ...form, [field]: val };

      if (field === "parenchymaConcrements" && val === NOT_DETECTED) {
        draft.parenchymaConcrementslist = [];
      }
      if (field === "parenchymaCysts" && val === NOT_DETECTED) {
        draft.parenchymaCystslist = [];
      }
      if (field === "pcsConcrements" && val === NOT_DETECTED) {
        draft.pcsConcrementslist = [];
      }
      if (field === "pcsCysts" && val === NOT_DETECTED) {
        draft.pcsCystslist = [];
      }

      cleanup?.(draft);
      commit(draft);
    },
    [form, commit],
  );

  const toggleParenchymaMultipleCysts = useCallback(() => {
    const draft: KidneyProtocol = {
      ...form,
      parenchymaMultipleCysts: !form.parenchymaMultipleCysts,
      parenchymaMultipleCystsSize: !form.parenchymaMultipleCysts
        ? form.parenchymaMultipleCystsSize
        : "",
    };
    commit(draft);
  }, [form, commit]);

  const togglePcsMultipleCysts = useCallback(() => {
    const draft: KidneyProtocol = {
      ...form,
      pcsMultipleCysts: !form.pcsMultipleCysts,
      pcsMultipleCystsSize: !form.pcsMultipleCysts
        ? form.pcsMultipleCystsSize
        : "",
    };
    commit(draft);
  }, [form, commit]);

  return {
    form,
    setForm,
    updateField,
    commit,
    updateSelect,
    parenchymaConcrementsManager,
    parenchymaCystsManager,
    pcsConcrementsManager,
    pcsCystsManager,
    addParenchymaConcrement: () =>
      parenchymaConcrementsManager.addItem(EMPTY_CONCREMENT),
    addParenchymaCyst: () => parenchymaCystsManager.addItem(EMPTY_CYST),
    addPcsConcrement: () => pcsConcrementsManager.addItem(EMPTY_CONCREMENT),
    addPcsCyst: () => pcsCystsManager.addItem(EMPTY_CYST),
    toggleParenchymaMultipleCysts,
    togglePcsMultipleCysts,
  };
};

export const KIDNEY_OPTIONS = {
  notDetected: NOT_DETECTED,
} as const;