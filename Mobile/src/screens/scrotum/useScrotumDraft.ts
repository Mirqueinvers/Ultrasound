import { useCallback, useEffect, useState } from "react";
import { Keyboard } from "react-native";

import {
  createEmptyScrotumDraft,
  createEmptySingleTestisDraft,
  type ScrotumDraft,
  type SingleTestisDraft,
} from "../../shared/scrotumDraft";
import { type EditorState, computeVolume } from "./scrotumFieldConfigs";

export function useScrotumDraft(
  value: ScrotumDraft,
  onChange: (value: ScrotumDraft) => void,
) {
  const [form, setForm] = useState<ScrotumDraft>(value ?? createEmptyScrotumDraft());
  const [editorState, setEditorState] = useState<EditorState>(null);

  useEffect(() => {
    setForm(value ?? createEmptyScrotumDraft());
  }, [value]);

  const updateForm = useCallback(
    (updater: (current: ScrotumDraft) => ScrotumDraft) => {
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
    setTimeout(() => setEditorState(config), 0);
  }, []);

  const closeEditor = useCallback(() => setEditorState(null), []);

  const saveEditor = useCallback(
    (nextValue: string) => {
      editorState?.onSave(nextValue);
      closeEditor();
    },
    [editorState, closeEditor],
  );

  const updateTestisField = useCallback(
    (side: "right" | "left", field: keyof SingleTestisDraft, nextValue: string) => {
      updateForm((current) => {
        const currentPair = current.testis;
        const target = side === "right" ? currentPair.rightTestis : currentPair.leftTestis;
        const base = target ?? createEmptySingleTestisDraft();
        const nextTestis: SingleTestisDraft = {
          ...base,
          [field]: nextValue,
        };

        if (field === "length" || field === "width" || field === "depth") {
          nextTestis.volume = computeVolume(
            field === "length" ? nextValue : nextTestis.length,
            field === "width" ? nextValue : nextTestis.width,
            field === "depth" ? nextValue : nextTestis.depth,
          );
        }

        if (field === "capsule" && nextValue !== "изменена") {
          nextTestis.capsuleText = "";
        }

        if (field === "echotexture" && nextValue !== "неоднородная") {
          nextTestis.echotextureText = "";
        }

        if (field === "mediastinum" && nextValue !== "изменена") {
          nextTestis.mediastinumText = "";
        }

        if (field === "appendage" && nextValue !== "изменен") {
          nextTestis.appendageText = "";
        }

        if (field === "fluidAmount" && nextValue !== "увеличено") {
          nextTestis.fluidAmountText = "";
        }

        return {
          ...current,
          testis: {
            ...currentPair,
            [side === "right" ? "rightTestis" : "leftTestis"]: nextTestis,
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
    updateTestisField,
  };
}
