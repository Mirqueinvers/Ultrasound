import { useCallback, useState } from "react";
import { Keyboard } from "react-native";

import {
  createEmptyThyroidNodeDraft,
  createEmptyThyroidStudyDraft,
  type ThyroidDraft,
  type ThyroidLobeDraft,
  type ThyroidNodeDraft,
  type ThyroidStudyDraft,
} from "../../shared/thyroidDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import { type EditorState, computeVolume, computeNodeTiradsCategory } from "./thyroidFieldConfigs";

export function useThyroidDraft(
  value: ThyroidStudyDraft,
  onChange: (value: ThyroidStudyDraft) => void,
) {
  const [form, setForm] = useState<ThyroidStudyDraft>(
    value ?? createEmptyThyroidStudyDraft(),
  );
  const [editorState, setEditorState] = useState<EditorState>(null);

  const updateForm = useCallback(
    (updater: (current: ThyroidStudyDraft) => ThyroidStudyDraft) => {
      setForm((current) => {
        const next = updater(current);
        onChange(next);
        return next;
      });
    },
    [onChange],
  );

  const openEditor = useCallback((config: NonNullable<EditorState>) => {
    Keyboard.dismiss();
    setTimeout(() => {
      setEditorState(config);
    }, 0);
  }, []);

  const closeEditor = useCallback(() => setEditorState(null), []);

  const saveEditor = useCallback(
    (nextValue: string) => {
      editorState?.onSave(nextValue);
      closeEditor();
    },
    [editorState, closeEditor],
  );

  const updateThyroidField = useCallback(
    <K extends keyof ThyroidDraft>(field: K, nextValue: string) => {
      updateForm((current) => ({
        ...current,
        thyroid: {
          ...current.thyroid,
          [field]: nextValue,
        },
      }));
    },
    [updateForm],
  );

  const updateLobeField = useCallback(
    (side: "right" | "left", field: keyof ThyroidLobeDraft, nextValue: string) => {
      updateForm((current) => {
        const sourceLobe = side === "right" ? current.thyroid.rightLobe : current.thyroid.leftLobe;
        const nextLobe: ThyroidLobeDraft = {
          ...sourceLobe,
          [field]: nextValue,
        };

        if (field === "length" || field === "width" || field === "depth") {
          nextLobe.volume = computeVolume(
            field === "length" ? nextValue : nextLobe.length,
            field === "width" ? nextValue : nextLobe.width,
            field === "depth" ? nextValue : nextLobe.depth,
          );
        }

        if (field === "volumeFormations" && isNormalizedMatch(nextValue, "не определяются")) {
          nextLobe.nodesList = [];
        }

        return {
          ...current,
          thyroid: {
            ...current.thyroid,
            [side === "right" ? "rightLobe" : "leftLobe"]: nextLobe,
          },
        };
      });
    },
    [updateForm],
  );

  const addNode = useCallback(
    (side: "right" | "left") => {
      updateForm((current) => {
        const sourceLobe = side === "right" ? current.thyroid.rightLobe : current.thyroid.leftLobe;
        const nextNode = {
          ...createEmptyThyroidNodeDraft(),
          number: sourceLobe.nodesList.length + 1,
        };

        return {
          ...current,
          thyroid: {
            ...current.thyroid,
            [side === "right" ? "rightLobe" : "leftLobe"]: {
              ...sourceLobe,
              nodesList: [...sourceLobe.nodesList, nextNode],
            },
          },
        };
      });
    },
    [updateForm],
  );

  const updateNodeField = useCallback(
    (side: "right" | "left", index: number, field: keyof ThyroidNodeDraft, nextValue: string) => {
      updateForm((current) => {
        const sourceLobe = side === "right" ? current.thyroid.rightLobe : current.thyroid.leftLobe;
        const nextNodes = sourceLobe.nodesList.map((node, nodeIndex) => {
          if (nodeIndex !== index) {
            return node;
          }

          const nextNode: ThyroidNodeDraft = {
            ...node,
            [field]: nextValue,
          };

          return {
            ...nextNode,
            tiradsCategory: computeNodeTiradsCategory(nextNode),
          };
        });

        return {
          ...current,
          thyroid: {
            ...current.thyroid,
            [side === "right" ? "rightLobe" : "leftLobe"]: {
              ...sourceLobe,
              nodesList: nextNodes,
            },
          },
        };
      });
    },
    [updateForm],
  );

  const removeNode = useCallback(
    (side: "right" | "left", index: number) => {
      updateForm((current) => {
        const sourceLobe = side === "right" ? current.thyroid.rightLobe : current.thyroid.leftLobe;
        const nextNodes = sourceLobe.nodesList
          .filter((_, nodeIndex) => nodeIndex !== index)
          .map((node, nodeIndex) => ({ ...node, number: nodeIndex + 1 }));

        return {
          ...current,
          thyroid: {
            ...current.thyroid,
            [side === "right" ? "rightLobe" : "leftLobe"]: {
              ...sourceLobe,
              nodesList: nextNodes,
            },
          },
        };
      });
    },
    [updateForm],
  );

  return {
    form,
    editorState,
    updateForm,
    openEditor,
    closeEditor,
    saveEditor,
    updateThyroidField,
    updateLobeField,
    addNode,
    updateNodeField,
    removeNode,
  };
}
