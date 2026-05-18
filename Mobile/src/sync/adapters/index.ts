import { createEmptyStudyDraft } from "../../shared/syncHelpers";
import {
  getMobileProtocolByDesktopStudyType,
  getMobileProtocolById,
  type MobileProtocolId,
} from "../../protocols/registry";

export function getDesktopStudyKey(protocolId: string) {
  return getMobileProtocolById(protocolId as MobileProtocolId)?.selectionLabel ?? protocolId;
}

export function getProtocolIdFromDesktopKey(studyType: string): MobileProtocolId | null {
  return getMobileProtocolByDesktopStudyType(studyType)?.id ?? null;
}

export function normalizeIncomingStudyData(studyType: string, value: unknown) {
  const protocol = getMobileProtocolByDesktopStudyType(studyType);
  if (!protocol) {
    if (!value || typeof value !== "object") {
      return createEmptyStudyDraft();
    }

    const draft = value as Partial<ReturnType<typeof createEmptyStudyDraft>>;
    return {
      general: draft.general ?? "",
      sections: draft.sections ?? {},
    };
  }

  return protocol.normalize(value);
}

export function createEmptyStudyDataByDesktopKey(studyType: string) {
  const protocol = getMobileProtocolByDesktopStudyType(studyType);
  return protocol ? protocol.createEmpty() : createEmptyStudyDraft();
}
