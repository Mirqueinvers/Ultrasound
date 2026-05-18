import { createEmptyStudyDraft } from "../../shared/syncHelpers";
import {
  getMobileProtocolByDesktopStudyType,
  getMobileProtocolById,
  type MobileProtocolId,
} from "../../protocols/registry";
import { obpAdapter } from "./obpAdapter";
import { kidneysAdapter } from "./kidneysAdapter";
import { scrotumAdapter } from "./scrotumAdapter";
import { omtFemaleAdapter } from "./omtFemaleAdapter";
import { omtMaleAdapter } from "./omtMaleAdapter";
import { thyroidAdapter } from "./thyroidAdapter";
import { breastAdapter } from "./breastAdapter";
import { lymphNodesAdapter } from "./lymphNodesAdapter";

export {
  obpAdapter,
  kidneysAdapter,
  scrotumAdapter,
  omtFemaleAdapter,
  omtMaleAdapter,
  thyroidAdapter,
  breastAdapter,
  lymphNodesAdapter,
};

const ADAPTERS_BY_PROTOCOL_ID = {
  obp: obpAdapter,
  kidneys: kidneysAdapter,
  scrotum: scrotumAdapter,
  omt_female: omtFemaleAdapter,
  omt_male: omtMaleAdapter,
  thyroid: thyroidAdapter,
  breast: breastAdapter,
  lymph_nodes: lymphNodesAdapter,
} as const satisfies Record<MobileProtocolId, { protocolId: MobileProtocolId; desktopStudyKeys: readonly string[] }>;

export function getDesktopStudyKey(protocolId: string) {
  const adapter = ADAPTERS_BY_PROTOCOL_ID[protocolId as MobileProtocolId];
  return getMobileProtocolById(protocolId as MobileProtocolId)?.selectionLabel ?? adapter?.desktopStudyKeys[0] ?? protocolId;
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
