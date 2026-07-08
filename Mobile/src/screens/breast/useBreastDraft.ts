import { useEffect, useState } from "react";
import { Keyboard } from "react-native";

import {
  createEmptyBreastNodeDraft,
  type BreastNodeDraft,
  type BreastProtocolDraft,
  type BreastSideDraft,
  type BreastStudyDraft,
} from "../../shared/breastDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import {
  type EditorState,
  computeCycleDay,
} from "./breastFieldConfigs";

export function useBreastDraft(
  value: BreastStudyDraft,
  onChange: (value: BreastStudyDraft) => void,
) {
  const [form, setForm] = useState<BreastStudyDraft>(value);
  const [editorState, setEditorState] = useState<EditorState>(null);

  useEffect(() => {
    setForm(value);
  }, [value]);

  const updateForm = (updater: (current: BreastStudyDraft) => BreastStudyDraft) => {
    setForm((current) => {
      const next = updater(current);
      onChange(next);
      return next;
    });
  };

  const updateBreastField = <K extends keyof BreastProtocolDraft>(
    field: K,
    nextValue: BreastProtocolDraft[K],
  ) => {
    updateForm((current) => {
      const nextBreast: BreastProtocolDraft = {
        ...current.breast,
        [field]: nextValue,
      };

      if (field === "lastMenstruationDate") {
        nextBreast.cycleDay = computeCycleDay(String(nextValue));
      }

      return {
        ...current,
        breast: nextBreast,
      };
    });
  };

  const updateSideField = (
    side: "right" | "left",
    field: keyof BreastSideDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const sourceSide = side === "right" ? current.breast.rightBreast : current.breast.leftBreast;
      const nextSide: BreastSideDraft = {
        ...sourceSide,
        [field]: nextValue,
      };

      if (field === "volumeFormations" && isNormalizedMatch(nextValue, "не определяются")) {
        nextSide.nodesList = [];
      }

      return {
        ...current,
        breast: {
          ...current.breast,
          [side === "right" ? "rightBreast" : "leftBreast"]: nextSide,
        },
      };
    });
  };

  const addNode = (side: "right" | "left") => {
    updateForm((current) => {
      const sourceSide = side === "right" ? current.breast.rightBreast : current.breast.leftBreast;
      const nextNode = {
        ...createEmptyBreastNodeDraft(),
        number: sourceSide.nodesList.length + 1,
      };

      return {
        ...current,
        breast: {
          ...current.breast,
          [side === "right" ? "rightBreast" : "leftBreast"]: {
            ...sourceSide,
            nodesList: [...sourceSide.nodesList, nextNode],
          },
        },
      };
    });
  };

  const updateNodeField = (
    side: "right" | "left",
    index: number,
    field: keyof BreastNodeDraft,
    nextValue: string,
  ) => {
    updateForm((current) => {
      const sourceSide = side === "right" ? current.breast.rightBreast : current.breast.leftBreast;
      const nextNodes = sourceSide.nodesList.map((node, nodeIndex) =>
        nodeIndex === index ? { ...node, [field]: nextValue } : node,
      );

      return {
        ...current,
        breast: {
          ...current.breast,
          [side === "right" ? "rightBreast" : "leftBreast"]: {
            ...sourceSide,
            nodesList: nextNodes,
          },
        },
      };
    });
  };

  const removeNode = (side: "right" | "left", index: number) => {
    updateForm((current) => {
      const sourceSide = side === "right" ? current.breast.rightBreast : current.breast.leftBreast;
      const nextNodes = sourceSide.nodesList
        .filter((_, nodeIndex) => nodeIndex !== index)
        .map((node, nodeIndex) => ({ ...node, number: nodeIndex + 1 }));

      return {
        ...current,
        breast: {
          ...current.breast,
          [side === "right" ? "rightBreast" : "leftBreast"]: {
            ...sourceSide,
            nodesList: nextNodes,
          },
        },
      };
    });
  };

  const openEditor = (config: NonNullable<EditorState>) => {
    Keyboard.dismiss();
    setTimeout(() => {
      setEditorState(config);
    }, 0);
  };

  const closeEditor = () => setEditorState(null);

  const saveEditor = (nextValue: string) => {
    editorState?.onSave(nextValue);
    closeEditor();
  };

  return {
    form,
    editorState,
    updateForm,
    updateBreastField,
    updateSideField,
    addNode,
    updateNodeField,
    removeNode,
    openEditor,
    closeEditor,
    saveEditor,
  };
}
