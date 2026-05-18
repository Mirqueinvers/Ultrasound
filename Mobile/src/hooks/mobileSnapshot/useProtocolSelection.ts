import { useEffect, useMemo, useState, type SetStateAction } from "react";

import { type ProtocolManifest, getProtocolManifestById, type ProtocolId } from "../../shared/protocols";
import { createSyncTimestamp, type MobileSyncSnapshot, type MobileSyncWireMessage } from "../../shared/mobileSync";
import { createEmptyStudyDataByDesktopKey, getProtocolIdFromDesktopKey } from "../../sync/adapters";
import type { MobileStudiesDataMap } from "../../protocols/types";

type SaveState = "idle" | "requested" | "saved";
export type DraftMode = "patient" | "protocol";

export function useProtocolSelection({
  snapshot,
  studiesData,
  emitWireMessage,
  sendSelectionPatch,
  sendStudiesPatch,
  setSaveState,
}: {
  snapshot: MobileSyncSnapshot;
  studiesData: MobileStudiesDataMap;
  emitWireMessage: (message: MobileSyncWireMessage) => void;
  sendSelectionPatch: (patch: Partial<MobileSyncSnapshot["selection"]>) => void;
  sendStudiesPatch: (
    message:
      | {
          mode: "replace";
          studiesData: MobileStudiesDataMap;
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
  ) => void;
  setSaveState: (value: SetStateAction<SaveState>) => void;
}) {
  const [focusedProtocolId, setFocusedProtocolIdState] = useState<ProtocolId | null>(null);
  const [activeSectionId, setActiveSectionIdState] = useState<string | null>(null);
  const [activeDraftMode, setActiveDraftModeState] = useState<DraftMode>("patient");

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
    if (!activeProtocolManifest) {
      setActiveSectionIdState(null);
      setActiveDraftModeState("patient");
      return;
    }

    const firstSectionId = activeProtocolManifest.sections[0]?.id ?? null;
    setActiveSectionIdState(firstSectionId);
  }, [activeProtocolManifest?.id]);

  useEffect(() => {
    if (snapshot.selection.selectedStudies.length === 0) {
      if (focusedProtocolId !== null) {
        setFocusedProtocolIdState(null);
      }
      if (activeDraftMode !== "patient") {
        setActiveDraftModeState("patient");
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
  }, [focusedProtocolId, snapshot.selection.selectedStudies, activeDraftMode]);

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
      emitWireMessage({
        type: "sync:command",
        command: "draft:create",
        studyLabel: label.trim() || undefined,
        origin: "mobile",
        updatedAt: createSyncTimestamp(),
      });
      setSaveState("idle");
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
      setActiveDraftModeState("patient");
      return;
    }

    const nextProtocolId = getProtocolIdFromDesktopKey(nextFocusLabel);
    const nextFocusedManifest = nextProtocolId ? getProtocolManifestById(nextProtocolId) : null;
    const nextFocusedId = nextFocusedManifest?.id ?? null;
    setFocusedProtocolIdState(nextFocusedId);
  };

  return {
    focusedProtocolId,
    setFocusedProtocolId: setFocusedProtocolIdState,
    activeSectionId,
    setActiveSectionId: setActiveSectionIdState,
    activeDraftMode,
    setActiveDraftMode: setActiveDraftModeState,
    selectedProtocolManifests,
    activeProtocolManifest,
    toggleProtocol,
  };
}
