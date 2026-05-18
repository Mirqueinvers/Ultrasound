import {
  createEmptyGallbladderConcretionDraft,
  createEmptyGallbladderPolypDraft,
  type ObpDraft,
  type LiverDraft,
  type GallbladderDraft,
  type GallbladderConcretionDraft,
  type GallbladderPolypDraft,
  type PancreasDraft,
  type SpleenDraft,
} from "../../shared/obpDraft";
import { normalizeObpDraft } from "../../protocols";
import type { MobileStudiesDataMap } from "../../protocols/types";
import { getDesktopStudyKey } from "../../sync/adapters";

type SendStudiesPatch = (message: {
  mode: "set";
  studyType: string;
  value: unknown;
}) => void;

export type ObpDraftActions = {
  updateObpLiverField: (field: keyof LiverDraft, value: string) => void;
  updateObpGallbladderField: (field: keyof GallbladderDraft, value: string) => void;
  updateObpPancreasField: (field: keyof PancreasDraft, value: string) => void;
  updateObpSpleenField: (field: keyof SpleenDraft, value: string) => void;
  updateObpFreeFluidField: (field: "freeFluid" | "freeFluidDetails", value: string) => void;
  updateObpConclusionField: (value: string) => void;
  updateObpRecommendationsField: (value: string) => void;
  updateObpGallbladderConcretionsList: (nextList: GallbladderConcretionDraft[]) => void;
  updateObpGallbladderPolypsList: (nextList: GallbladderPolypDraft[]) => void;
  addObpGallbladderConcretion: () => void;
  addObpGallbladderPolyp: () => void;
};

export function useObpDraftActions({
  studiesData,
  sendStudiesPatch,
}: {
  studiesData: MobileStudiesDataMap;
  sendStudiesPatch: SendStudiesPatch;
}): ObpDraftActions {
  const obpDesktopKey = getDesktopStudyKey("obp");

  const updateObpLiverField = (field: keyof LiverDraft, value: string) => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    const nextLiver: LiverDraft = {
      ...currentObp.liver,
      [field]: value,
    };

    if (field === "rightLobeAP" || field === "rightLobeCCR") {
      const ap =
        parseFloat(field === "rightLobeAP" ? value : currentObp.liver.rightLobeAP) || 0;
      const ccr =
        parseFloat(field === "rightLobeCCR" ? value : currentObp.liver.rightLobeCCR) || 0;
      nextLiver.rightLobeTotal = ap > 0 && ccr > 0 ? (ccr + ap).toString() : "";
    }

    if (field === "leftLobeAP" || field === "leftLobeCCR") {
      const ap =
        parseFloat(field === "leftLobeAP" ? value : currentObp.liver.leftLobeAP) || 0;
      const ccr =
        parseFloat(field === "leftLobeCCR" ? value : currentObp.liver.leftLobeCCR) || 0;
      nextLiver.leftLobeTotal = ap > 0 && ccr > 0 ? (ccr + ap).toString() : "";
    }

    const nextObp: ObpDraft = {
      ...currentObp,
      liver: nextLiver,
    };

    sendStudiesPatch({
      mode: "set",
      studyType: obpDesktopKey,
      value: nextObp,
    });
  };

  const updateObpGallbladderField = (field: keyof GallbladderDraft, value: string) => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    const nextGallbladder: GallbladderDraft = {
      ...currentObp.gallbladder,
      [field]: value,
    };

    const nextObp: ObpDraft = {
      ...currentObp,
      gallbladder: nextGallbladder,
    };

    sendStudiesPatch({
      mode: "set",
      studyType: obpDesktopKey,
      value: nextObp,
    });
  };

  const updateObpPancreasField = (field: keyof PancreasDraft, value: string) => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    const nextObp: ObpDraft = {
      ...currentObp,
      pancreas: {
        ...currentObp.pancreas,
        [field]: value,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: obpDesktopKey,
      value: nextObp,
    });
  };

  const updateObpSpleenField = (field: keyof SpleenDraft, value: string) => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    const nextObp: ObpDraft = {
      ...currentObp,
      spleen: {
        ...currentObp.spleen,
        [field]: value,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: obpDesktopKey,
      value: nextObp,
    });
  };

  const updateObpFreeFluidField = (field: "freeFluid" | "freeFluidDetails", value: string) => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    const nextObp: ObpDraft = {
      ...currentObp,
      [field]: value,
    };

    sendStudiesPatch({
      mode: "set",
      studyType: obpDesktopKey,
      value: nextObp,
    });
  };

  const updateObpConclusionField = (value: string) => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    const nextObp: ObpDraft = {
      ...currentObp,
      conclusion: value,
    };

    sendStudiesPatch({
      mode: "set",
      studyType: obpDesktopKey,
      value: nextObp,
    });
  };

  const updateObpRecommendationsField = (value: string) => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    const nextObp: ObpDraft = {
      ...currentObp,
      recommendations: value,
    };

    sendStudiesPatch({
      mode: "set",
      studyType: obpDesktopKey,
      value: nextObp,
    });
  };

  const updateObpGallbladderConcretionsList = (
    nextList: GallbladderConcretionDraft[],
  ) => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    const nextObp: ObpDraft = {
      ...currentObp,
      gallbladder: {
        ...currentObp.gallbladder,
        concretionsList: nextList,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: obpDesktopKey,
      value: nextObp,
    });
  };

  const updateObpGallbladderPolypsList = (
    nextList: GallbladderPolypDraft[],
  ) => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    const nextObp: ObpDraft = {
      ...currentObp,
      gallbladder: {
        ...currentObp.gallbladder,
        polypsList: nextList,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: obpDesktopKey,
      value: nextObp,
    });
  };

  const addObpGallbladderConcretion = () => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    updateObpGallbladderConcretionsList([
      ...currentObp.gallbladder.concretionsList,
      createEmptyGallbladderConcretionDraft(),
    ]);
  };

  const addObpGallbladderPolyp = () => {
    const currentObp = normalizeObpDraft(studiesData[obpDesktopKey]);
    updateObpGallbladderPolypsList([
      ...currentObp.gallbladder.polypsList,
      createEmptyGallbladderPolypDraft(),
    ]);
  };

  return {
    updateObpLiverField,
    updateObpGallbladderField,
    updateObpPancreasField,
    updateObpSpleenField,
    updateObpFreeFluidField,
    updateObpConclusionField,
    updateObpRecommendationsField,
    updateObpGallbladderConcretionsList,
    updateObpGallbladderPolypsList,
    addObpGallbladderConcretion,
    addObpGallbladderPolyp,
  };
}
