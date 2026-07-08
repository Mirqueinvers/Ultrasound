import { useCallback, useEffect, useState } from "react";

import {
  createEmptyLymphNodeDraft,
  type LymphNodeDraft,
  type LymphNodeRegionDraft,
  type LymphNodesStudyDraft,
} from "../../shared/lymphNodesDraft";
import { useFieldEditor } from "../../hooks/useFieldEditor";

export function useLymphNodesDraft(
  value: LymphNodesStudyDraft,
  onChange: (value: LymphNodesStudyDraft) => void,
) {
  const [form, setForm] = useState<LymphNodesStudyDraft>(value);
  const { editorState, openEditor, closeEditor, saveEditor } = useFieldEditor();

  useEffect(() => {
    setForm(value);
  }, [value]);

  const updateForm = useCallback(
    (updater: (current: LymphNodesStudyDraft) => LymphNodesStudyDraft) => {
      setForm((current) => {
        const next = updater(current);
        onChange(next);
        return next;
      });
    },
    [onChange],
  );

  const updateRegionField = useCallback(
    (
      regionKey: keyof LymphNodesStudyDraft["lymphNodes"],
      field: keyof LymphNodeRegionDraft,
      nextValue: string,
    ) => {
      updateForm((current) => {
        const sourceRegion = current.lymphNodes[regionKey];
        const nextRegion: LymphNodeRegionDraft = {
          ...sourceRegion,
          [field]: nextValue,
        };

        if (field === "detected" && nextValue === "not_detected") {
          nextRegion.nodes = [];
        }

        return {
          ...current,
          lymphNodes: {
            ...current.lymphNodes,
            [regionKey]: nextRegion,
          },
        };
      });
    },
    [updateForm],
  );

  const addNode = useCallback(
    (regionKey: keyof LymphNodesStudyDraft["lymphNodes"], side: "left" | "right") => {
      updateForm((current) => {
        const sourceRegion = current.lymphNodes[regionKey];
        const nextNode: LymphNodeDraft = {
          ...createEmptyLymphNodeDraft(),
          id: `${Date.now()}-${Math.random()}`,
          side,
        };

        return {
          ...current,
          lymphNodes: {
            ...current.lymphNodes,
            [regionKey]: {
              ...sourceRegion,
              detected: "detected",
              nodes: [...sourceRegion.nodes, nextNode],
            },
          },
        };
      });
    },
    [updateForm],
  );

  const updateNodeField = useCallback(
    (
      regionKey: keyof LymphNodesStudyDraft["lymphNodes"],
      index: number,
      field: keyof LymphNodeDraft,
      nextValue: string,
    ) => {
      updateForm((current) => {
        const sourceRegion = current.lymphNodes[regionKey];
        const nextNodes = sourceRegion.nodes.map((node, nodeIndex) =>
          nodeIndex === index ? { ...node, [field]: nextValue } : node,
        );

        return {
          ...current,
          lymphNodes: {
            ...current.lymphNodes,
            [regionKey]: {
              ...sourceRegion,
              nodes: nextNodes,
            },
          },
        };
      });
    },
    [updateForm],
  );

  const removeNode = useCallback(
    (regionKey: keyof LymphNodesStudyDraft["lymphNodes"], index: number) => {
      updateForm((current) => {
        const sourceRegion = current.lymphNodes[regionKey];
        const nextNodes = sourceRegion.nodes.filter((_, nodeIndex) => nodeIndex !== index);

        return {
          ...current,
          lymphNodes: {
            ...current.lymphNodes,
            [regionKey]: {
              ...sourceRegion,
              nodes: nextNodes,
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
    updateRegionField,
    addNode,
    updateNodeField,
    removeNode,
  };
}
