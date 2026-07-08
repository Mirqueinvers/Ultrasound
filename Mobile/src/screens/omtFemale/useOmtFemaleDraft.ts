import { useCallback, useEffect, useState } from "react";

import {
  createEmptyOvaryCystDraft,
  createEmptyOvaryDraft,
  createEmptyUterusDraft,
  createEmptyUterusNodeDraft,
  createEmptyUrinaryBladderDraft,
  type OmtFemaleDraft,
  type OvaryCystDraft,
  type OvaryDraft,
  type UterusDraft,
  type UterusNodeDraft,
  type UrinaryBladderDraft,
} from "../../shared/omtFemaleDraft";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import { useFieldEditor } from "../../hooks/useFieldEditor";
import {
  computeCycleDay,
  computeVolume,
} from "./omtFemaleFieldConfigs";

export function useOmtFemaleDraft(
  value: OmtFemaleDraft,
  onChange: (value: OmtFemaleDraft) => void,
) {
  const [form, setForm] = useState<OmtFemaleDraft>(value);
  const { editorState, openEditor, closeEditor, saveEditor } = useFieldEditor();

  useEffect(() => {
    setForm(value);
  }, [value]);

  const updateForm = useCallback(
    (updater: (current: OmtFemaleDraft) => OmtFemaleDraft) => {
      setForm((current) => {
        const next = updater(current);
        onChange(next);
        return next;
      });
    },
    [onChange],
  );

  const updateUterusField = useCallback(
    (field: keyof UterusDraft, nextValue: string) => {
      updateForm((current) => {
        const source = current.uterus;
        const next: UterusDraft = { ...source, [field]: nextValue };

        if (field === "lastMenstruationDate") {
          next.cycleDay = computeCycleDay(nextValue);
        }

        if (["length", "width", "apDimension"].includes(field)) {
          next.volume = computeVolume(
            field === "length" ? nextValue : next.length,
            field === "width" ? nextValue : next.width,
            field === "apDimension" ? nextValue : next.apDimension,
          );
        }

        if (field === "myomaNodesPresence" && isNormalizedMatch(nextValue, "не определяются")) {
          next.myomaNodesList = [];
        }

        if (field === "uterineCavity" && !isNormalizedMatch(nextValue, "расширена")) {
          next.uterineCavityText = "";
        }

        if (field === "cervicalCanal" && !isNormalizedMatch(nextValue, "расширен")) {
          next.cervicalCanalText = "";
        }

        if (field === "freeFluid" && !isNormalizedMatch(nextValue, "определяется")) {
          next.freeFluidText = "";
        }

        if (field === "myometriumStructure" && !isNormalizedMatch(nextValue, "неоднородная")) {
          next.myometriumStructureText = "";
        }

        if (field === "cervixEchostructure" && !isNormalizedMatch(nextValue, "неоднородная")) {
          next.cervixEchostructureText = "";
        }

        if (field === "endometriumStructure" && !isNormalizedMatch(nextValue, "неоднородная")) {
          // no clear text field for this
        }

        return { ...current, uterus: next };
      });
    },
    [updateForm],
  );

  const updateOvaryField = useCallback(
    (side: "left" | "right", field: keyof OvaryDraft, nextValue: string) => {
      updateForm((current) => {
        const source = side === "right" ? current.rightOvary : current.leftOvary;
        const ovary = source ?? createEmptyOvaryDraft();
        const next: OvaryDraft = { ...ovary, [field]: nextValue };

        if (field === "position" && !isNormalizedMatch(nextValue, "обычное")) {
          // keep as is
        }

        if (field === "cysts" && !isNormalizedMatch(nextValue, "определяются")) {
          next.cystsList = [];
        }

        if (field === "formations" && !isNormalizedMatch(nextValue, "определяются")) {
          next.formationsText = "";
        }

        return {
          ...current,
          [side === "right" ? "rightOvary" : "leftOvary"]: next,
        };
      });
    },
    [updateForm],
  );

  const updateBladderField = useCallback(
    (field: keyof UrinaryBladderDraft, nextValue: string) => {
      updateForm((current) => {
        const source = current.urinaryBladder ?? createEmptyUrinaryBladderDraft();
        const next: UrinaryBladderDraft = { ...source, [field]: nextValue };

        if (["length", "width", "depth"].includes(field)) {
          const l = parseFloat(field === "length" ? nextValue : source.length || "0");
          const w = parseFloat(field === "width" ? nextValue : source.width || "0");
          const d = parseFloat(field === "depth" ? nextValue : source.depth || "0");
          next.volume = l > 0 && w > 0 && d > 0 ? ((l * w * d * 0.523) / 1000).toFixed(0) : "";
        }

        if (field === "residualStatus" && !isNormalizedMatch(nextValue, "определяется")) {
          next.residualLength = "";
          next.residualWidth = "";
          next.residualDepth = "";
          next.residualVolume = "";
        }

        if (field === "contents" && !isNormalizedMatch(nextValue, "неоднородное")) {
          next.contentsText = "";
        }

        return { ...current, urinaryBladder: next };
      });
    },
    [updateForm],
  );

  const addMyomaNode = useCallback(() => {
    updateForm((current) => {
      const nodes = current.uterus.myomaNodesList;
      const nextNode = { ...createEmptyUterusNodeDraft(), number: nodes.length + 1 };
      return {
        ...current,
        uterus: { ...current.uterus, myomaNodesList: [...nodes, nextNode] },
      };
    });
  }, [updateForm]);

  const updateMyomaNode = useCallback(
    (index: number, field: keyof UterusNodeDraft, nextValue: string) => {
      updateForm((current) => {
        const nodes = current.uterus.myomaNodesList.map((n, i) =>
          i === index ? { ...n, [field]: nextValue } : n,
        );
        return { ...current, uterus: { ...current.uterus, myomaNodesList: nodes } };
      });
    },
    [updateForm],
  );

  const removeMyomaNode = useCallback(
    (index: number) => {
      updateForm((current) => {
        const nodes = current.uterus.myomaNodesList
          .filter((_, i) => i !== index)
          .map((n, i) => ({ ...n, number: i + 1 }));
        return { ...current, uterus: { ...current.uterus, myomaNodesList: nodes } };
      });
    },
    [updateForm],
  );

  const addOvaryCyst = useCallback(
    (side: "left" | "right") => {
      updateForm((current) => {
        const source = side === "right" ? current.rightOvary : current.leftOvary;
        const ovary = source ?? createEmptyOvaryDraft();
        const next = { ...ovary, cystsList: [...ovary.cystsList, createEmptyOvaryCystDraft()] };
        return {
          ...current,
          [side === "right" ? "rightOvary" : "leftOvary"]: next,
        };
      });
    },
    [updateForm],
  );

  const updateOvaryCyst = useCallback(
    (side: "left" | "right", index: number, first?: string, second?: string) => {
      updateForm((current) => {
        const source = side === "right" ? current.rightOvary : current.leftOvary;
        const ovary = source ?? createEmptyOvaryDraft();
        const cysts = [...ovary.cystsList];
        const item = cysts[index];
        if (!item) return current;

        const [curFirst = "", curSecond = ""] = item.size.split("x");
        cysts[index] = {
          ...item,
          size: `${first ?? curFirst}${(second ?? curSecond) ? `x${second ?? curSecond}` : ""}`,
        };

        return { ...current, [side === "right" ? "rightOvary" : "leftOvary"]: { ...ovary, cystsList: cysts } };
      });
    },
    [updateForm],
  );

  const removeOvaryCyst = useCallback(
    (side: "left" | "right", index: number) => {
      updateForm((current) => {
        const source = side === "right" ? current.rightOvary : current.leftOvary;
        const ovary = source ?? createEmptyOvaryDraft();
        return {
          ...current,
          [side === "right" ? "rightOvary" : "leftOvary"]: {
            ...ovary,
            cystsList: ovary.cystsList.filter((_, i) => i !== index),
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
    updateUterusField,
    updateOvaryField,
    updateBladderField,
    addMyomaNode,
    updateMyomaNode,
    removeMyomaNode,
    addOvaryCyst,
    updateOvaryCyst,
    removeOvaryCyst,
  };
}
