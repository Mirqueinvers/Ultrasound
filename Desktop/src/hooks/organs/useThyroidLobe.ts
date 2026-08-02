// src/hooks/organs/useThyroidLobe.ts
import { useCallback } from "react";
import { useOrganForm } from "../useOrganForm";
import { useOrganVolume } from "../useOrganVolume";
import { useListManager } from "../useListManager";
import { defaultThyroidLobeState } from "../../types/defaultStates/organs/thyroid";
import type {
  ThyroidLobeProtocol,
  ThyroidNode,
} from "../../types/organs/thyroid";

const DEFAULT_NODE_ECHOGENICITY = "изоэхогенный";
const DEFAULT_NODE_ECHOSTRUCTURE = "однородная";
const DEFAULT_NODE_CONTOUR = "четкий ровный";
const DEFAULT_NODE_ORIENTATION = "горизонтальная";
const DEFAULT_NODE_BLOOD_FLOW = "не изменен";
const VOLUME_FORMATIONS_NONE = "не определяются";
const VOLUME_FORMATIONS_PRESENT = "определяются";

const THYROID_VOLUME_COEFFICIENT = 0.479;

/**
 * Специфика доли щитовидной железы:
 * форма + авто-расчёт объёма (коэф. 0.479) + список узлов (nodesList).
 * Используется компонентом ThyroidLobe (стал презентационным).
 */
export const useThyroidLobe = (
  side: "left" | "right",
  value?: ThyroidLobeProtocol,
  onChange?: (value: ThyroidLobeProtocol) => void,
) => {
  const organKey = side === "left" ? "leftThyroidLobe" : "rightThyroidLobe";

  const { form, setForm, updateField, commit } = useOrganForm({
    value,
    defaults: defaultThyroidLobeState,
    organKey,
    onChange,
    mergeLists: (v) => ({
      nodesList: v?.nodesList || [],
    }),
  });

  useOrganVolume({
    length: form.length,
    width: form.width,
    depth: form.depth,
    volume: form.volume,
    coefficient: THYROID_VOLUME_COEFFICIENT,
    onVolumeChange: (volume) => {
      if (volume !== form.volume) {
        commit({ ...form, volume });
      }
    },
  });

  const nodesManager = useListManager(
    form.nodesList,
    form,
    setForm,
    "nodesList",
    onChange,
  );

  const addNode = useCallback(() => {
    const newNode: ThyroidNode = {
      number: form.nodesList.length + 1,
      size1: "",
      size2: "",
      echogenicity: DEFAULT_NODE_ECHOGENICITY,
      echostructure: DEFAULT_NODE_ECHOSTRUCTURE,
      contour: DEFAULT_NODE_CONTOUR,
      orientation: DEFAULT_NODE_ORIENTATION,
      bloodFlow: DEFAULT_NODE_BLOOD_FLOW,
      comment: "",
      echogenicFoci: "",
    };
    nodesManager.addItem(newNode);
  }, [form.nodesList.length, nodesManager]);

  /** Очистка узлов при «не определяются» */
  const updateSelect = useCallback(
    (field: keyof ThyroidLobeProtocol, val: string) => {
      const draft: ThyroidLobeProtocol = { ...form, [field]: val };

      if (field === "volumeFormations" && val === VOLUME_FORMATIONS_NONE) {
        draft.nodesList = [];
      }

      commit(draft);
    },
    [form, commit],
  );

  const removeNode = useCallback(
    (index: number) => {
      const updatedNodes = form.nodesList
        .filter((_, i) => i !== index)
        .map((n, i) => ({ ...n, number: i + 1 }));
      commit({ ...form, nodesList: updatedNodes });
    },
    [form, commit],
  );

  return {
    form,
    updateField,
    commit,
    updateSelect,
    nodesManager,
    addNode,
    removeNode,
  };
};

export const THYROID_OPTIONS = {
  none: VOLUME_FORMATIONS_NONE,
  present: VOLUME_FORMATIONS_PRESENT,
} as const;
