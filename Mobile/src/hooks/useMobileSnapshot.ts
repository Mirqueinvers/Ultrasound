import { useMemo, useState, type RefObject, type SetStateAction } from "react";

import { type TabKey } from "../components/TabBar";
import { type BreastStudyDraft } from "../shared/breastDraft";
import { createEmptyStudyDraft, createInitialMobileSnapshot, type StudyDraft } from "../shared/syncHelpers";
import { type MobileSyncSnapshot, type MobileSyncWireMessage, createSyncTimestamp } from "../shared/mobileSync";
import { type KidneyStudyDraft } from "../shared/kidneyDraft";
import { type LymphNodesStudyDraft } from "../shared/lymphNodesDraft";
import { type OmtFemaleDraft } from "../shared/omtFemaleDraft";
import { type OmtMaleDraft } from "../shared/omtMaleDraft";
import { type ObpDraft } from "../shared/obpDraft";
import { type ScrotumDraft } from "../shared/scrotumDraft";
import { type ThyroidStudyDraft } from "../shared/thyroidDraft";
import { useObpDraftActions } from "../protocols/obp/useObpDraftActions";
import { buildStudiesData } from "./mobileSnapshot/buildStudiesData";
import { getDraftReviewIssues } from "./mobileSnapshot/reviewIssues";
import { useProtocolSelection } from "./mobileSnapshot/useProtocolSelection";
import { useSnapshotSync } from "./mobileSnapshot/useSnapshotSync";
import { getDesktopStudyKey, normalizeIncomingStudyData } from "../sync/adapters";

 type SaveState = "idle" | "requested" | "saved";

type MobileStudyData =
  | StudyDraft
  | ObpDraft
  | KidneyStudyDraft
  | ScrotumDraft
  | OmtFemaleDraft
  | OmtMaleDraft
  | ThyroidStudyDraft
  | BreastStudyDraft
  | LymphNodesStudyDraft;

type UseMobileSnapshotOptions = {
  connected: boolean;
  emitWireMessage: (message: MobileSyncWireMessage) => void;
  setActiveTab: (value: SetStateAction<TabKey>) => void;
  setSaveState: (value: SetStateAction<SaveState>) => void;
  saveState: SaveState;
  setConnectionError: (value: string) => void;
  setSessionId: (value: SetStateAction<string | null>) => void;
  wireMessageHandlerRef: RefObject<((message: MobileSyncWireMessage) => void) | null>;
};

export function useMobileSnapshot({
  connected,
  emitWireMessage,
  setActiveTab,
  setSaveState,
  saveState,
  setConnectionError,
  setSessionId,
  wireMessageHandlerRef,
}: UseMobileSnapshotOptions) {
  const [snapshot, setSnapshot] = useState<MobileSyncSnapshot>(createInitialMobileSnapshot());

  const applyLocalSnapshot = (updater: SetStateAction<MobileSyncSnapshot>) => {
    setSnapshot(updater);
  };

  const studiesData = useMemo(
    () => buildStudiesData(snapshot) as Record<string, MobileStudyData>,
    [snapshot.studiesData],
  );
  const reviewIssues = useMemo(() => getDraftReviewIssues(snapshot), [snapshot]);
  const canSaveDraft = connected && snapshot.session.isDraftActive && reviewIssues.length === 0;

  const sendSelectionPatch = (patch: Partial<MobileSyncSnapshot["selection"]>) => {
    setSnapshot((current) => ({
      ...current,
      selection: {
        ...current.selection,
        ...patch,
      },
    }));
    setSaveState((current) => (current === "saved" ? "idle" : current));

    emitWireMessage({
      type: "sync:update",
      fragment: "selection",
      data: patch,
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const sendHeaderPatch = (patch: Partial<MobileSyncSnapshot["header"]>) => {
    setSnapshot((current) => ({
      ...current,
      header: {
        ...current.header,
        ...patch,
      },
    }));
    setSaveState((current) => (current === "saved" ? "idle" : current));

    emitWireMessage({
      type: "sync:update",
      fragment: "header",
      data: patch,
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const sendStudiesPatch = (
    message:
      | {
          mode: "replace";
          studiesData: Record<string, unknown>;
        }
      | {
          mode: "set";
          studyType: string;
          value: unknown;
        }
      | {
          mode: "remove";
          studyType: string;
        },
  ) => {
    setSnapshot((current) => {
      if (message.mode === "replace") {
        return {
          ...current,
          studiesData: { ...message.studiesData },
        };
      }

      if (message.mode === "set") {
        return {
          ...current,
          studiesData: {
            ...current.studiesData,
            [message.studyType]: message.value,
          },
        };
      }

      const nextStudiesData = { ...current.studiesData };
      delete nextStudiesData[message.studyType];
      return {
        ...current,
        studiesData: nextStudiesData,
      };
    });
    setSaveState((current) => (current === "saved" ? "idle" : current));

    emitWireMessage({
      type: "sync:update",
      fragment: "studiesData",
      data: message,
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const updateStudyByProtocolId = <T,>(protocolId: string, value: T) => {
    const studyType = getDesktopStudyKey(protocolId);
    sendStudiesPatch({
      mode: "set",
      studyType,
      value: normalizeIncomingStudyData(studyType, value),
    });
  };

  const requestDesktopSave = () => {
    if (!connected) {
      setConnectionError("Connect to the desktop host first.");
      return;
    }

    if (!canSaveDraft) {
      setConnectionError("Fill in the required fields before saving.");
      return;
    }

    setConnectionError("");
    setSaveState("requested");
    emitWireMessage({
      type: "sync:command",
      command: "draft:save",
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const requestDesktopPrint = () => {
    if (!connected) {
      setConnectionError("Connect to the desktop host first.");
      return;
    }

    if (saveState !== "saved") {
      setConnectionError("Save the draft on the desktop first.");
      return;
    }

    setConnectionError("");
    emitWireMessage({
      type: "sync:command",
      command: "draft:print",
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const requestDesktopClear = () => {
    if (!connected) {
      setConnectionError("Connect to the desktop host first.");
      return;
    }

    setConnectionError("");
    setSaveState("idle");
    emitWireMessage({
      type: "sync:command",
      command: "draft:clear",
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });
  };

  const { focusedProtocolId, setFocusedProtocolId, selectedProtocolManifests, activeProtocolManifest, toggleProtocol } =
    useProtocolSelection({
      snapshot,
      studiesData,
      emitWireMessage,
      sendSelectionPatch,
      sendStudiesPatch,
      setSaveState,
    });

  const { closeDraftSession } = useSnapshotSync({
    emitWireMessage,
    setSaveState,
    setSessionId,
    setFocusedProtocolId,
    applyLocalSnapshot,
    wireMessageHandlerRef,
  });

  const resetDraft = () => {
    const nextSnapshot = createInitialMobileSnapshot();
    setSnapshot(nextSnapshot);
    setSessionId(null);
    closeDraftSession();
    setActiveTab("connect");
    setSaveState("idle");
  };

  const {
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
  } = useObpDraftActions({
    studiesData,
    sendStudiesPatch,
  });

  const updateSectionNote = (
    protocolLabel: string,
    sectionDesktopKey: string,
    value: string,
  ) => {
    const currentDraft =
      (studiesData[protocolLabel] as StudyDraft | undefined) ?? createEmptyStudyDraft();
    const nextDraft: StudyDraft = {
      general: currentDraft.general,
      sections: {
        ...currentDraft.sections,
        [sectionDesktopKey]: value,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: protocolLabel,
      value: nextDraft,
    });
  };

  const updateGeneralNote = (protocolLabel: string, value: string) => {
    const currentDraft =
      (studiesData[protocolLabel] as StudyDraft | undefined) ?? createEmptyStudyDraft();
    const nextDraft: StudyDraft = {
      general: value,
      sections: {
        ...currentDraft.sections,
      },
    };

    sendStudiesPatch({
      mode: "set",
      studyType: protocolLabel,
      value: nextDraft,
    });
  };

  const updateHeaderField = (
    key: keyof MobileSyncSnapshot["header"],
    value: string,
  ) => {
    sendHeaderPatch({ [key]: value } as Partial<MobileSyncSnapshot["header"]>);
  };

  return {
    snapshot,
    selectedProtocolManifests,
    activeProtocolManifest,
    focusedProtocolId,
    setFocusedProtocolId,
    reviewIssues,
    canSaveDraft,
    studiesData,
    updateStudyByProtocolId,
    updateHeaderField,
    updateGeneralNote,
    updateSectionNote,
    toggleProtocol,
    requestDesktopSave,
    requestDesktopPrint,
    requestDesktopClear,
    resetDraft,
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
