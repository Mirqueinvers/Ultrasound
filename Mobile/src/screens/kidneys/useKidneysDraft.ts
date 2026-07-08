import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Keyboard } from "react-native";

import {
  createEmptyKidneyConcrementDraft,
  createEmptyKidneyCystDraft,
  createEmptyKidneyDraft,
  createEmptyUrinaryBladderDraft,
  type KidneyConcrementDraft,
  type KidneyCystDraft,
  type KidneyDraft,
  type KidneyStudyDraft,
  type UrinaryBladderDraft,
} from "../../shared/kidneyDraft";
import {
  BLADDER_NUMERIC_FIELDS,
  KIDNEY_NUMERIC_FIELDS,
  type EditorState,
  formatNumberInput,
} from "./kidneysFieldConfigs";

export type KidneysProducer = (current: KidneyStudyDraft) => KidneyStudyDraft;

export function useKidneysDraft(
  value: KidneyStudyDraft,
  onChange: (value: KidneyStudyDraft) => void,
) {
  const [form, setForm] = useState<KidneyStudyDraft>(value);
  const [editorState, setEditorState] = useState<EditorState>(null);
  const localDirtyRef = useRef(false);

  useEffect(() => {
    if (!localDirtyRef.current) {
      setForm(value);
    }
  }, [value]);

  const hasAnyKidneyData = useMemo(
    () =>
      Boolean(
        form.rightKidney ||
          form.leftKidney ||
          form.urinaryBladder ||
          form.conclusion.trim() ||
          form.recommendations.trim(),
      ),
    [form],
  );

  const updateStudy = useCallback(
    (producer: KidneysProducer) => {
      localDirtyRef.current = true;
      setForm((current) => {
        const next = producer(current);
        onChange(next);
        return next;
      });
    },
    [onChange],
  );

  const ensureKidney = useCallback(
    (study: KidneyStudyDraft, side: "rightKidney" | "leftKidney"): KidneyDraft =>
      study[side] ?? createEmptyKidneyDraft(),
    [],
  );

  const ensureBladder = useCallback(
    (study: KidneyStudyDraft): UrinaryBladderDraft =>
      study.urinaryBladder ?? createEmptyUrinaryBladderDraft(),
    [],
  );

  const updateKidneyField = useCallback(
    (side: "rightKidney" | "leftKidney", field: keyof KidneyDraft, rawValue: string) => {
      updateStudy((current) => {
        const currentKidney = ensureKidney(current, side);
        const value = KIDNEY_NUMERIC_FIELDS.has(field)
          ? formatNumberInput(rawValue)
          : rawValue;
        const nextKidney: KidneyDraft = {
          ...currentKidney,
          [field]: value,
        };

        if (field === "position" && value === "обычное") {
          nextKidney.positionText = "";
        }

        if (field === "parenchymaConcrements" && value === "не определяются") {
          nextKidney.parenchymaConcrementslist = [];
        }

        if (field === "parenchymaCysts" && value === "не определяются") {
          nextKidney.parenchymaCystslist = [];
          nextKidney.parenchymaMultipleCysts = false;
          nextKidney.parenchymaMultipleCystsSize = "";
        }

        if (field === "parenchymaPathologicalFormations" && value === "не определяются") {
          nextKidney.parenchymaPathologicalFormationsText = "";
        }

        if (field === "pcsMicroliths" && value === "не определяются") {
          nextKidney.pcsMicrolithsSize = "";
        }

        if (field === "pcsConcrements" && value === "не определяются") {
          nextKidney.pcsConcrementslist = [];
        }

        if (field === "pcsCysts" && value === "не определяются") {
          nextKidney.pcsCystslist = [];
          nextKidney.pcsMultipleCysts = false;
          nextKidney.pcsMultipleCystsSize = "";
        }

        if (field === "pcsPathologicalFormations" && value === "не определяются") {
          nextKidney.pcsPathologicalFormationsText = "";
        }

        if (field === "adrenalArea" && value === "не изменена") {
          nextKidney.adrenalAreaText = "";
        }

        return {
          ...current,
          [side]: nextKidney,
        };
      });
    },
    [updateStudy, ensureKidney],
  );

  const updateKidneyListItem = useCallback(
    (
      side: "rightKidney" | "leftKidney",
      listKey:
        | "parenchymaConcrementslist"
        | "parenchymaCystslist"
        | "pcsConcrementslist"
        | "pcsCystslist",
      index: number,
      field: keyof KidneyConcrementDraft | keyof KidneyCystDraft,
      rawValue: string,
    ) => {
      updateStudy((current) => {
        const currentKidney = ensureKidney(current, side);
        const nextList = [...currentKidney[listKey]];
        const currentItem = nextList[index];
        if (!currentItem) {
          return current;
        }

        nextList[index] = {
          ...currentItem,
          [field]: rawValue,
        };

        return {
          ...current,
          [side]: {
            ...currentKidney,
            [listKey]: nextList,
          },
        };
      });
    },
    [updateStudy, ensureKidney],
  );

  const updateKidneyCystSize = useCallback(
    (
      side: "rightKidney" | "leftKidney",
      listKey: "parenchymaCystslist" | "pcsCystslist",
      index: number,
      nextFirst?: string,
      nextSecond?: string,
    ) => {
      updateStudy((current) => {
        const currentKidney = ensureKidney(current, side);
        const nextList = [...currentKidney[listKey]];
        const currentItem = nextList[index];
        if (!currentItem) {
          return current;
        }

        const [currentFirst = "", currentSecond = ""] = currentItem.size.split("x");
        const resolvedFirst = nextFirst ?? currentFirst;
        const resolvedSecond = nextSecond ?? currentSecond;
        nextList[index] = {
          ...currentItem,
          size: `${resolvedFirst}${resolvedSecond ? `x${resolvedSecond}` : ""}`,
        };

        return {
          ...current,
          [side]: {
            ...currentKidney,
            [listKey]: nextList,
          },
        };
      });
    },
    [updateStudy, ensureKidney],
  );

  const addKidneyListItem = useCallback(
    (
      side: "rightKidney" | "leftKidney",
      listKey:
        | "parenchymaConcrementslist"
        | "parenchymaCystslist"
        | "pcsConcrementslist"
        | "pcsCystslist",
    ) => {
      const nextItem =
        listKey === "parenchymaConcrementslist" || listKey === "pcsConcrementslist"
          ? createEmptyKidneyConcrementDraft()
          : createEmptyKidneyCystDraft();

      updateStudy((current) => {
        const currentKidney = ensureKidney(current, side);
        return {
          ...current,
          [side]: {
            ...currentKidney,
            [listKey]: [...currentKidney[listKey], nextItem],
          },
        };
      });
    },
    [updateStudy, ensureKidney],
  );

  const removeKidneyListItem = useCallback(
    (
      side: "rightKidney" | "leftKidney",
      listKey:
        | "parenchymaConcrementslist"
        | "parenchymaCystslist"
        | "pcsConcrementslist"
        | "pcsCystslist",
      index: number,
    ) => {
      updateStudy((current) => {
        const currentKidney = ensureKidney(current, side);
        return {
          ...current,
          [side]: {
            ...currentKidney,
            [listKey]: currentKidney[listKey].filter((_, itemIndex) => itemIndex !== index),
          },
        };
      });
    },
    [updateStudy, ensureKidney],
  );

  const toggleMultipleCysts = useCallback(
    (
      side: "rightKidney" | "leftKidney",
      key: "parenchymaMultipleCysts" | "pcsMultipleCysts",
    ) => {
      updateStudy((current) => {
        const currentKidney = ensureKidney(current, side);
        const nextValue = !currentKidney[key];
        return {
          ...current,
          [side]: {
            ...currentKidney,
            [key]: nextValue,
            ...(nextValue
              ? {}
              : {
                  [key === "parenchymaMultipleCysts"
                    ? "parenchymaMultipleCystsSize"
                    : "pcsMultipleCystsSize"]: "",
                }),
          },
        };
      });
    },
    [updateStudy, ensureKidney],
  );

  const updateBladderField = useCallback(
    (field: keyof UrinaryBladderDraft, rawValue: string) => {
      updateStudy((current) => {
        const currentBladder = ensureBladder(current);
        const value = BLADDER_NUMERIC_FIELDS.has(field)
          ? formatNumberInput(rawValue)
          : rawValue;
        const nextBladder: UrinaryBladderDraft = {
          ...currentBladder,
          [field]: value,
        };

        if (field === "length" || field === "width" || field === "depth") {
          const length = parseFloat(field === "length" ? value : currentBladder.length || "0");
          const width = parseFloat(field === "width" ? value : currentBladder.width || "0");
          const depth = parseFloat(field === "depth" ? value : currentBladder.depth || "0");
          nextBladder.volume =
            length > 0 && width > 0 && depth > 0
              ? ((length * width * depth * 0.523) / 1000).toFixed(0)
              : "";
        }

        if (field === "residualLength" || field === "residualWidth" || field === "residualDepth") {
          const length = parseFloat(
            field === "residualLength" ? value : currentBladder.residualLength || "0",
          );
          const width = parseFloat(
            field === "residualWidth" ? value : currentBladder.residualWidth || "0",
          );
          const depth = parseFloat(
            field === "residualDepth" ? value : currentBladder.residualDepth || "0",
          );
          nextBladder.residualVolume =
            length > 0 && width > 0 && depth > 0
              ? ((length * width * depth * 0.523) / 1000).toFixed(0)
              : "";
        }

        if (field === "contents" && value === "однородное") {
          nextBladder.contentsText = "";
        }

        return {
          ...current,
          urinaryBladder: nextBladder,
        };
      });
    },
    [updateStudy, ensureBladder],
  );

  const openEditor = useCallback((config: EditorState) => {
    Keyboard.dismiss();
    setEditorState(config);
  }, []);

  const closeEditor = useCallback(() => setEditorState(null), []);

  const saveEditor = useCallback(
    (nextValue: string) => {
      if (!editorState) {
        return;
      }

      editorState.onSave(nextValue);
      setEditorState(null);
    },
    [editorState],
  );

  return {
    form,
    editorState,
    hasAnyKidneyData,

    updateStudy,
    ensureKidney,
    ensureBladder,
    updateKidneyField,
    updateKidneyListItem,
    updateKidneyCystSize,
    addKidneyListItem,
    removeKidneyListItem,
    toggleMultipleCysts,
    updateBladderField,

    openEditor,
    closeEditor,
    saveEditor,
  };
}
