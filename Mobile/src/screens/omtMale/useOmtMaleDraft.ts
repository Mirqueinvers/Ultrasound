import { useCallback, useEffect, useState } from "react";
import { Keyboard } from "react-native";

import { createEmptyOmtMaleDraft, type OmtMaleDraft, type ProstateDraft } from "../../shared/omtMaleDraft";
import { type UrinaryBladderDraft } from "../../shared/omtFemaleDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import { type EditorState, computeProstateVolume } from "./omtMaleFieldConfigs";

export function useOmtMaleDraft(
  value: OmtMaleDraft,
  onChange: (value: OmtMaleDraft) => void,
) {
  const [form, setForm] = useState<OmtMaleDraft>(value ?? createEmptyOmtMaleDraft());
  const [editorState, setEditorState] = useState<EditorState>(null);

  useEffect(() => {
    setForm(value ?? createEmptyOmtMaleDraft());
  }, [value]);

  const updateForm = useCallback(
    (updater: (current: OmtMaleDraft) => OmtMaleDraft) => {
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

  const updateProstateField = useCallback(
    (field: keyof ProstateDraft, nextValue: string) => {
      updateForm((current) => {
        const prostate = current.prostate;
        const nextProstate: ProstateDraft = { ...prostate, [field]: nextValue };

        if (field === "length" || field === "width" || field === "apDimension") {
          nextProstate.volume = computeProstateVolume(
            field === "length" ? nextValue : nextProstate.length,
            field === "width" ? nextValue : nextProstate.width,
            field === "apDimension" ? nextValue : nextProstate.apDimension,
          );
        }

        if (field === "echotexture" && !isNormalizedMatch(nextValue, "неоднородная")) {
          nextProstate.echotextureText = "";
        }

        if (field === "bladderProtrusion" && !isNormalizedMatch(nextValue, "выступает")) {
          nextProstate.bladderProtrusionMm = "";
        }

        if (field === "pathologicLesions" && !isNormalizedMatch(nextValue, "определяются")) {
          nextProstate.pathologicLesionsText = "";
        }

        return { ...current, prostate: nextProstate };
      });
    },
    [updateForm],
  );

  const updateBladderField = useCallback(
    (field: keyof UrinaryBladderDraft, nextValue: string) => {
      updateForm((current) => {
        const bladder = current.urinaryBladder;
        const nextBladder: UrinaryBladderDraft = { ...bladder, [field]: nextValue };

        if (field === "length" || field === "width" || field === "depth") {
          const length = parseFloat(field === "length" ? nextValue : bladder.length || "0");
          const width = parseFloat(field === "width" ? nextValue : bladder.width || "0");
          const depth = parseFloat(field === "depth" ? nextValue : bladder.depth || "0");
          if (length > 0 && width > 0 && depth > 0) {
            nextBladder.volume = ((length * width * depth * 0.523) / 1000).toFixed(0);
          } else {
            nextBladder.volume = "";
          }
        }

        if (field === "residualLength" || field === "residualWidth" || field === "residualDepth") {
          const length = parseFloat(field === "residualLength" ? nextValue : bladder.residualLength || "0");
          const width = parseFloat(field === "residualWidth" ? nextValue : bladder.residualWidth || "0");
          const depth = parseFloat(field === "residualDepth" ? nextValue : bladder.residualDepth || "0");
          if (length > 0 && width > 0 && depth > 0) {
            nextBladder.residualVolume = ((length * width * depth * 0.523) / 1000).toFixed(0);
          } else {
            nextBladder.residualVolume = "";
          }
        }

        if (field === "residualStatus" && !isNormalizedMatch(nextValue, "определяется")) {
          nextBladder.residualLength = "";
          nextBladder.residualWidth = "";
          nextBladder.residualDepth = "";
          nextBladder.residualVolume = "";
        }

        if (field === "contents" && !isNormalizedMatch(nextValue, "неоднородное")) {
          nextBladder.contentsText = "";
        }

        return { ...current, urinaryBladder: nextBladder };
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
    updateProstateField,
    updateBladderField,
  };
}
