// src/hooks/organs/useSalivaryGland.ts
import { useCallback, useEffect } from "react";
import { useOrganForm } from "../useOrganForm";
import { useOrganVolume } from "../useOrganVolume";
import { defaultSalivaryGlandState } from "../../types/defaultStates/organs/salivaryGlands";
import {
  defaultLymphNodeRegionState,
  defaultLymphNodeState,
} from "../../types/organs/lymphNodes";
import type { LymphNodeProtocol } from "../../types/organs/lymphNodes";
import type { SalivaryGlandProtocol } from "../../types/organs/salivaryGlands";

const VOLUME_COEFFICIENT = 0.523;
const DUCTS_DILATED = "расширены";

/**
 * Специфика слюнной железы:
 * форма + объём (только при showDepth) + протоки (очистка ductDiameter)
 * + лимфоузлы (вложенный объект с nodes).
 * Используется компонентом SalivaryGland (стал презентационным).
 */
export const useSalivaryGland = (
  showDepth = true,
  value?: SalivaryGlandProtocol,
  onChange?: (value: SalivaryGlandProtocol) => void,
) => {
  const { form, setForm, updateField, commit, mergeValue } = useOrganForm({
    value,
    defaults: defaultSalivaryGlandState,
    organKey: null,
    onChange,
    mergeLists: (v) => ({
      formationsList: v?.formationsList || [],
      lymphNodes: v?.lymphNodes
        ? {
            ...v.lymphNodes,
            nodes: v.lymphNodes.nodes || [],
          }
        : {
            ...defaultLymphNodeRegionState,
            nodes: [],
          },
    }),
  });

  // Объём слюнной железы: только когда глубина доступна
  useOrganVolume({
    length: form.length,
    width: form.width,
    depth: form.depth,
    volume: form.volume,
    coefficient: VOLUME_COEFFICIENT,
    enabled: showDepth,
    onVolumeChange: (volume) => {
      if (volume !== form.volume) {
        commit({ ...form, volume });
      }
    },
  });

  // Если showDepth=false — сбрасываем объём
  useEffect(() => {
    if (!showDepth && form.volume !== "") {
      commit({ ...form, volume: "" });
    }
    // commit пересоздаётся на каждый render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDepth]);

  const updateLymphNodes = useCallback(
    (draftLymphNodes: SalivaryGlandProtocol["lymphNodes"]) => {
      commit({ ...form, lymphNodes: draftLymphNodes });
    },
    [form, commit],
  );

  const handleLymphNodesDetectionChange = useCallback(
    (detected: "not_detected" | "detected") => {
      updateLymphNodes({
        ...form.lymphNodes,
        detected,
        nodes: detected === "not_detected" ? [] : form.lymphNodes.nodes,
      });
    },
    [form.lymphNodes, updateLymphNodes],
  );

  const handleAddLymphNode = useCallback(() => {
    const newNode: LymphNodeProtocol = {
      ...defaultLymphNodeState,
      id: `${Date.now()}-${Math.random()}`,
      side: "right",
    };
    updateLymphNodes({
      ...form.lymphNodes,
      nodes: [...form.lymphNodes.nodes, newNode],
    });
  }, [form.lymphNodes, updateLymphNodes]);

  const handleUpdateLymphNode = useCallback(
    (index: number) => (field: keyof LymphNodeProtocol, value: string) => {
      const updatedNodes = [...form.lymphNodes.nodes];
      updatedNodes[index] = {
        ...updatedNodes[index],
        [field]: value,
      };
      updateLymphNodes({
        ...form.lymphNodes,
        nodes: updatedNodes,
      });
    },
    [form.lymphNodes, updateLymphNodes],
  );

  const handleDeleteLymphNode = useCallback(
    (index: number) => {
      updateLymphNodes({
        ...form.lymphNodes,
        nodes: form.lymphNodes.nodes.filter((_, i) => i !== index),
      });
    },
    [form.lymphNodes, updateLymphNodes],
  );

  /** Очистка ductDiameter, если протоки не расширены */
  const handleDuctsChange = useCallback(
    (val: string) => {
      const draft: SalivaryGlandProtocol = {
        ...form,
        ducts: val,
        ductDiameter: val === DUCTS_DILATED ? form.ductDiameter : "",
      };
      commit(draft);
    },
    [form, commit],
  );

  return {
    form,
    setForm,
    updateField,
    commit,
    mergeValue,
    handleLymphNodesDetectionChange,
    handleAddLymphNode,
    handleUpdateLymphNode,
    handleDeleteLymphNode,
    handleDuctsChange,
  };
};

export const SALIVARY_GLAND_OPTIONS = {
  ductsDilated: DUCTS_DILATED,
} as const;