import { useEffect, useMemo, useState, type RefObject, type SetStateAction } from "react";

import { type TabKey } from "../components/TabBar";
import { getProtocolManifestById, type ProtocolId, type ProtocolManifest } from "../shared/protocols";
import {
  applySyncMessage,
  createInitialMobileSnapshot,
  createEmptyStudyDraft,
  type StudyDraft,
} from "../shared/syncHelpers";
import {
  createSyncTimestamp,
  type MobileSyncSnapshot,
  type MobileSyncWireMessage,
} from "../shared/mobileSync";
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
} from "../shared/obpDraft";
import { type KidneyStudyDraft } from "../shared/kidneyDraft";
import { type OmtFemaleDraft } from "../shared/omtFemaleDraft";
import { type OmtMaleDraft } from "../shared/omtMaleDraft";
import { type ThyroidStudyDraft } from "../shared/thyroidDraft";
import { type BreastStudyDraft } from "../shared/breastDraft";
import { type LymphNodesStudyDraft } from "../shared/lymphNodesDraft";
import { type ScrotumDraft } from "../shared/scrotumDraft";
import { normalizeObpDraft } from "../protocols/obp/normalize";
import {
  createEmptyStudyDataByDesktopKey,
  getDesktopStudyKey,
  getProtocolIdFromDesktopKey,
  normalizeIncomingStudyData,
} from "../sync/adapters";
import { type MobileProtocolId } from "../protocols/registry";

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

function buildStudiesData(snapshot: MobileSyncSnapshot): Record<string, MobileStudyData> {
  const result: Record<string, MobileStudyData> = {};

  Object.entries(snapshot.studiesData).forEach(([studyType, value]) => {
    result[studyType] = normalizeIncomingStudyData(studyType, value) as MobileStudyData;
  });

  return result;
}

function getDraftReviewIssues(snapshot: MobileSyncSnapshot): string[] {
  const issues: string[] = [];

  if (!snapshot.header.patientFullName.trim()) {
    issues.push("Patient full name");
  }

  if (!snapshot.header.patientDateOfBirth.trim()) {
    issues.push("Date of birth");
  }

  if (!snapshot.header.researchDate.trim()) {
    issues.push("Study date");
  }

  if (snapshot.selection.selectedStudies.length === 0) {
    issues.push("Select at least one protocol");
  }

  return issues;
}

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
  const [focusedProtocolId, setFocusedProtocolIdState] = useState<ProtocolId | null>(null);

  const applyLocalSnapshot = (updater: SetStateAction<MobileSyncSnapshot>) => {
    setSnapshot(updater);
  };

  const selectedProtocolManifests = useMemo(() => {
    return snapshot.selection.selectedStudies
      .map((label) => {
        const protocolId = getProtocolIdFromDesktopKey(label);
        return protocolId ? getProtocolManifestById(protocolId) : null;
      })
      .filter((manifest): manifest is ProtocolManifest => Boolean(manifest));
  }, [snapshot.selection.selectedStudies]);

  const activeProtocolManifest = useMemo(() => {
    if (focusedProtocolId) {
      const focused = getProtocolManifestById(focusedProtocolId);
      if (focused) {
        return focused;
      }
    }

    return selectedProtocolManifests[0] ?? null;
  }, [focusedProtocolId, selectedProtocolManifests]);

  useEffect(() => {
    if (snapshot.selection.selectedStudies.length === 0) {
      if (focusedProtocolId !== null) {
        setFocusedProtocolIdState(null);
      }
      return;
    }

    if (!focusedProtocolId) {
      return;
    }

    const focused = getProtocolManifestById(focusedProtocolId);
    if (
      !focused ||
      !snapshot.selection.selectedStudies.includes(focused.selectionLabel)
    ) {
      const nextSelected = snapshot.selection.selectedStudies[0];
      const nextProtocolId = nextSelected ? getProtocolIdFromDesktopKey(nextSelected) : null;
      const nextManifest = nextProtocolId ? getProtocolManifestById(nextProtocolId) : null;
      const nextFocusedId = nextManifest?.id ?? null;
      setFocusedProtocolIdState(nextFocusedId);
    }
  }, [focusedProtocolId, snapshot.selection.selectedStudies]);

  const reviewIssues = useMemo(() => getDraftReviewIssues(snapshot), [snapshot]);
  const canSaveDraft = connected && snapshot.session.isDraftActive && reviewIssues.length === 0;

  const studiesData = useMemo(() => buildStudiesData(snapshot), [snapshot.studiesData]);

  const handleWireMessage = (message: MobileSyncWireMessage) => {
    applyLocalSnapshot((current) => applySyncMessage(current, message));

    if (message.type === "sync:snapshot") {
      setSessionId(message.state.session.sessionId);
      if (message.state.session.activeStudyLabel) {
        const nextProtocolId = getProtocolIdFromDesktopKey(message.state.session.activeStudyLabel);
        const nextManifest = nextProtocolId ? getProtocolManifestById(nextProtocolId) : null;
        if (nextManifest) {
          setFocusedProtocolIdState(nextManifest.id);
        }
      }

      return;
    }

    if (message.type === "sync:command") {
      if (message.command === "draft:saved") {
        setSaveState("saved");
        return;
      }

      if (message.command === "draft:print") {
        return;
      }
    }
  };

  useEffect(() => {
    wireMessageHandlerRef.current = handleWireMessage;
    return () => {
      if (wireMessageHandlerRef.current === handleWireMessage) {
        wireMessageHandlerRef.current = null;
      }
    };
  }, [handleWireMessage, wireMessageHandlerRef]);

  const requestDraftSession = (studyLabel?: string) => {
    emitWireMessage({
      type: "sync:command",
      command: "draft:create",
      studyLabel: studyLabel?.trim() || undefined,
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });

    setSaveState("idle");
  };

  const closeDraftSession = () => {
    emitWireMessage({
      type: "sync:command",
      command: "draft:close",
      origin: "mobile",
      updatedAt: createSyncTimestamp(),
    });

    setSaveState("idle");
  };

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

  const updateStudyByProtocolId = <T,>(protocolId: MobileProtocolId, value: T) => {
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

  const resetDraft = () => {
    const nextSnapshot = createInitialMobileSnapshot();
    setSnapshot(nextSnapshot);
    setSessionId(null);
    closeDraftSession();
    setFocusedProtocolIdState(null);
    setActiveTab("connect");
    setSaveState("idle");
  };

  const toggleProtocol = (manifest: ProtocolManifest) => {
    const label = manifest.selectionLabel;
    const isSelected = snapshot.selection.selectedStudies.includes(label);
    const nextSelectedStudies = isSelected
      ? snapshot.selection.selectedStudies.filter((study) => study !== label)
      : [...snapshot.selection.selectedStudies, label];
    const nextFocusLabel = isSelected
      ? nextSelectedStudies[0] ?? ""
      : label;

    setSaveState("idle");

    if (!snapshot.session.isDraftActive) {
      requestDraftSession(label);
    }

    sendSelectionPatch({
      selectedStudy: nextSelectedStudies[nextSelectedStudies.length - 1] ?? "",
      selectedStudies: nextSelectedStudies,
      isMultiSelectMode: nextSelectedStudies.length > 1,
    });

    if (isSelected) {
      sendStudiesPatch({
        mode: "remove",
        studyType: label,
      });
    } else if (!studiesData[label]) {
      sendStudiesPatch({
        mode: "set",
        studyType: label,
        value: createEmptyStudyDataByDesktopKey(label),
      });
    }

    if (nextSelectedStudies.length === 0) {
      setFocusedProtocolIdState(null);
      return;
    }

    const nextProtocolId = getProtocolIdFromDesktopKey(nextFocusLabel);
    const nextFocusedManifest = nextProtocolId ? getProtocolManifestById(nextProtocolId) : null;
    const nextFocusedId = nextFocusedManifest?.id ?? null;
    setFocusedProtocolIdState(nextFocusedId);
  };

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

  const obpDesktopKey = getDesktopStudyKey("obp");

  const updateObpLiverField = (
    field: keyof LiverDraft,
    value: string,
  ) => {
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

  const updateObpGallbladderField = (
    field: keyof GallbladderDraft,
    value: string,
  ) => {
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
    snapshot,
    applyLocalSnapshot,
    selectedProtocolManifests,
    activeProtocolManifest,
    focusedProtocolId,
    setFocusedProtocolId: setFocusedProtocolIdState,
    reviewIssues,
    canSaveDraft,
    studiesData,
    buildStudiesData,
    getDraftReviewIssues,
    sendSelectionPatch,
    sendHeaderPatch,
    sendStudiesPatch,
    updateStudyByProtocolId,
    updateHeaderField,
    updateGeneralNote,
    updateSectionNote,
    toggleProtocol,
    requestDraftSession,
    closeDraftSession,
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


