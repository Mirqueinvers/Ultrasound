import { useCallback, useState } from "react";
import { isNormalizedMatch } from "../../shared/normalizeSelectValue";
import { createEmptyGallbladderConcretionDraft, createEmptyGallbladderPolypDraft } from "../../shared/obpDraft";
import type {
  GallbladderConcretionDraft,
  GallbladderDraft,
  GallbladderPolypDraft,
  LiverDraft,
  ObpDraft,
  PancreasDraft,
  SpleenDraft,
} from "../../shared/obpDraft";

export function useObpDraft(
  incomingObpDraft: ObpDraft,
  onUpdateLiverField: (field: keyof LiverDraft, value: string) => void,
  onUpdateGallbladderField: (field: keyof GallbladderDraft, value: string) => void,
  onUpdateGallbladderConcretionsList: (nextList: GallbladderConcretionDraft[]) => void,
  onUpdateGallbladderPolypsList: (nextList: GallbladderPolypDraft[]) => void,
  onAddGallbladderConcretion: () => void,
  onAddGallbladderPolyp: () => void,
  onUpdatePancreasField: (field: keyof PancreasDraft, value: string) => void,
  onUpdateSpleenField: (field: keyof SpleenDraft, value: string) => void,
  onUpdateFreeFluidField: (field: "freeFluid" | "freeFluidDetails", value: string) => void,
  onUpdateConclusionField: (value: string) => void,
  onUpdateRecommendationsField: (value: string) => void,
) {
  const [draft, setDraft] = useState<ObpDraft>(incomingObpDraft);

  const updateDraft = useCallback(
    (producer: (current: ObpDraft) => ObpDraft) => {
      setDraft((current) => producer(current));
    },
    [],
  );

  const activeGallbladder = draft.gallbladder;
  const isCholecystectomy = isNormalizedMatch(activeGallbladder.position, "холецистэктомия");
  const activePancreas = draft.pancreas;
  const activeSpleen = draft.spleen;
  const hasLiverFocalLesions = isNormalizedMatch(draft.liver.focalLesionsPresence, "определяются");
  const hasGallbladderConcretions = isNormalizedMatch(activeGallbladder.concretions, "определяются");
  const hasGallbladderPolyps = isNormalizedMatch(activeGallbladder.polyps, "определяются");
  const hasPancreasPathologicalFormations =
    isNormalizedMatch(activePancreas.pathologicalFormations, "определяются");
  const hasSpleenPathologicalFormations =
    isNormalizedMatch(activeSpleen.pathologicalFormations, "определяются");

  const updateLiverFieldValue = useCallback(
    (field: keyof LiverDraft, value: string) => {
      updateDraft((current) => ({
        ...current,
        liver: { ...current.liver, [field]: value },
      }));
      onUpdateLiverField(field, value);
    },
    [updateDraft, onUpdateLiverField],
  );

  const updateGallbladderFieldValue = useCallback(
    (field: keyof GallbladderDraft, value: string) => {
      updateDraft((current) => ({
        ...current,
        gallbladder: { ...current.gallbladder, [field]: value },
      }));
      onUpdateGallbladderField(field, value);
    },
    [updateDraft, onUpdateGallbladderField],
  );

  const updateGallbladderConcretions = useCallback(
    (nextList: GallbladderConcretionDraft[]) => {
      updateDraft((current) => ({
        ...current,
        gallbladder: { ...current.gallbladder, concretionsList: nextList },
      }));
      onUpdateGallbladderConcretionsList(nextList);
    },
    [updateDraft, onUpdateGallbladderConcretionsList],
  );

  const updateGallbladderPolyps = useCallback(
    (nextList: GallbladderPolypDraft[]) => {
      updateDraft((current) => ({
        ...current,
        gallbladder: { ...current.gallbladder, polypsList: nextList },
      }));
      onUpdateGallbladderPolypsList(nextList);
    },
    [updateDraft, onUpdateGallbladderPolypsList],
  );

  const handleAddGallbladderConcretion = useCallback(() => {
    updateGallbladderConcretions([
      ...activeGallbladder.concretionsList,
      createEmptyGallbladderConcretionDraft(),
    ]);
    onAddGallbladderConcretion();
  }, [updateGallbladderConcretions, activeGallbladder.concretionsList, onAddGallbladderConcretion]);

  const handleAddGallbladderPolyp = useCallback(() => {
    updateGallbladderPolyps([
      ...activeGallbladder.polypsList,
      createEmptyGallbladderPolypDraft(),
    ]);
    onAddGallbladderPolyp();
  }, [updateGallbladderPolyps, activeGallbladder.polypsList, onAddGallbladderPolyp]);

  const updatePancreasFieldValue = useCallback(
    (field: keyof PancreasDraft, value: string) => {
      updateDraft((current) => ({
        ...current,
        pancreas: { ...current.pancreas, [field]: value },
      }));
      onUpdatePancreasField(field, value);
    },
    [updateDraft, onUpdatePancreasField],
  );

  const updateSpleenFieldValue = useCallback(
    (field: keyof SpleenDraft, value: string) => {
      updateDraft((current) => ({
        ...current,
        spleen: { ...current.spleen, [field]: value },
      }));
      onUpdateSpleenField(field, value);
    },
    [updateDraft, onUpdateSpleenField],
  );

  const updateFreeFluidFieldValue = useCallback(
    (field: "freeFluid" | "freeFluidDetails", value: string) => {
      updateDraft((current) => ({ ...current, [field]: value }));
      onUpdateFreeFluidField(field, value);
    },
    [updateDraft, onUpdateFreeFluidField],
  );

  const updateConclusionFieldValue = useCallback(
    (value: string) => {
      updateDraft((current) => ({ ...current, conclusion: value }));
      onUpdateConclusionField(value);
    },
    [updateDraft, onUpdateConclusionField],
  );

  const updateRecommendationsFieldValue = useCallback(
    (value: string) => {
      updateDraft((current) => ({ ...current, recommendations: value }));
      onUpdateRecommendationsField(value);
    },
    [updateDraft, onUpdateRecommendationsField],
  );

  const updateGallbladderConcretionItem = useCallback(
    (index: number, field: keyof GallbladderConcretionDraft, value: string) => {
      const nextList = activeGallbladder.concretionsList.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );
      updateGallbladderConcretions(nextList);
    },
    [activeGallbladder.concretionsList, updateGallbladderConcretions],
  );

  const updateGallbladderPolypItem = useCallback(
    (index: number, field: keyof GallbladderPolypDraft, value: string) => {
      const nextList = activeGallbladder.polypsList.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      );
      updateGallbladderPolyps(nextList);
    },
    [activeGallbladder.polypsList, updateGallbladderPolyps],
  );

  return {
    draft,
    activeGallbladder,
    isCholecystectomy,
    activePancreas,
    activeSpleen,
    hasLiverFocalLesions,
    hasGallbladderConcretions,
    hasGallbladderPolyps,
    hasPancreasPathologicalFormations,
    hasSpleenPathologicalFormations,
    updateLiverFieldValue,
    updateGallbladderFieldValue,
    updateGallbladderConcretions,
    updateGallbladderPolyps,
    handleAddGallbladderConcretion,
    handleAddGallbladderPolyp,
    updatePancreasFieldValue,
    updateSpleenFieldValue,
    updateFreeFluidFieldValue,
    updateConclusionFieldValue,
    updateRecommendationsFieldValue,
    updateGallbladderConcretionItem,
    updateGallbladderPolypItem,
  };
}