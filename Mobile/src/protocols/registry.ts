import { createEmptyBreastStudyDraft } from "../shared/breastDraft";
import { createEmptyKidneyStudyDraft } from "../shared/kidneyDraft";
import {
  createEmptyLymphNodesStudyDraft,
  normalizeLymphNodesStudyDraft,
} from "../shared/lymphNodesDraft";
import { createEmptyObpDraft } from "../shared/obpDraft";
import { createEmptyOmtFemaleDraft } from "../shared/omtFemaleDraft";
import { createEmptyOmtMaleDraft } from "../shared/omtMaleDraft";
import { createEmptyScrotumDraft } from "../shared/scrotumDraft";
import { createEmptyThyroidStudyDraft } from "../shared/thyroidDraft";
import { createEmptyStudyDraft, type StudyDraft } from "../shared/syncHelpers";
import { normalizeBreastStudyDraft } from "./breast/normalize";
import { normalizeKidneyDraft } from "./kidneys/normalize";
import { normalizeObpDraft } from "./obp/normalize";
import { normalizeOmtFemaleDraft } from "./omtFemale/normalize";
import { normalizeOmtMaleDraft } from "./omtMale/normalize";
import { normalizeScrotumDraft } from "./scrotum/normalize";
import { normalizeThyroidDraft } from "./thyroid/normalize";

export type MobileProtocolId =
  | "obp"
  | "kidneys"
  | "scrotum"
  | "omt_female"
  | "omt_male"
  | "thyroid"
  | "breast"
  | "lymph_nodes";

export type MobileProtocolRegistryEntry = {
  id: MobileProtocolId;
  selectionLabel: string;
  createEmpty: () => unknown;
  normalize: (value: unknown) => unknown;
};

export const MOBILE_PROTOCOL_REGISTRY = {
  obp: {
    id: "obp",
    selectionLabel: "ОБП",
    createEmpty: createEmptyObpDraft,
    normalize: normalizeObpDraft,
  },
  kidneys: {
    id: "kidneys",
    selectionLabel: "Почки",
    createEmpty: createEmptyKidneyStudyDraft,
    normalize: normalizeKidneyDraft,
  },
  scrotum: {
    id: "scrotum",
    selectionLabel: "Органы мошонки",
    createEmpty: createEmptyScrotumDraft,
    normalize: normalizeScrotumDraft,
  },
  omt_female: {
    id: "omt_female",
    selectionLabel: "ОМТ (Ж)",
    createEmpty: createEmptyOmtFemaleDraft,
    normalize: normalizeOmtFemaleDraft,
  },
  omt_male: {
    id: "omt_male",
    selectionLabel: "ОМТ (М)",
    createEmpty: createEmptyOmtMaleDraft,
    normalize: normalizeOmtMaleDraft,
  },
  thyroid: {
    id: "thyroid",
    selectionLabel: "Щитовидная железа",
    createEmpty: createEmptyThyroidStudyDraft,
    normalize: normalizeThyroidDraft,
  },
  breast: {
    id: "breast",
    selectionLabel: "Молочные железы",
    createEmpty: createEmptyBreastStudyDraft,
    normalize: normalizeBreastStudyDraft,
  },
  lymph_nodes: {
    id: "lymph_nodes",
    selectionLabel: "Лимфоузлы",
    createEmpty: createEmptyLymphNodesStudyDraft,
    normalize: normalizeLymphNodesStudyDraft,
  },
} as const satisfies Record<MobileProtocolId, MobileProtocolRegistryEntry>;

const MOBILE_PROTOCOL_SELECTION_LABEL_TO_ID: Record<string, MobileProtocolId> = {
  ОБП: "obp",
  "ОБП??": "obp",
  "ОБП (?)": "obp",
  "ОБПОБП?? ОБПОБП": "obp",
  "ОБПОБПОБП": "obp",
  Почки: "kidneys",
  "Органы мошонки": "scrotum",
  "ОМТ (Ж)": "omt_female",
  "ОМТ (М)": "omt_male",
  "Щитовидная железа": "thyroid",
  "Молочные железы": "breast",
  Лимфоузлы: "lymph_nodes",
};

const MOBILE_PROTOCOL_DESKTOP_STUDY_TYPE_TO_ID: Record<string, MobileProtocolId> = {
  ОБП: "obp",
  "ОБП??": "obp",
  "ОБП (?)": "obp",
  "ОБПОБП?? ОБПОБП": "obp",
  "ОБПОБПОБП": "obp",
  Почки: "kidneys",
  "Органы мошонки": "scrotum",
  "ОМТ (Ж)": "omt_female",
  "ОМТ (М)": "omt_male",
  "Щитовидная железа": "thyroid",
  "Молочные железы": "breast",
  Лимфоузлы: "lymph_nodes",
  "Лимфатические узлы": "lymph_nodes",
};

export function getMobileProtocolById(id: MobileProtocolId) {
  return MOBILE_PROTOCOL_REGISTRY[id] ?? null;
}

export function getMobileProtocolBySelectionLabel(label: string) {
  const id = MOBILE_PROTOCOL_SELECTION_LABEL_TO_ID[label];
  return id ? MOBILE_PROTOCOL_REGISTRY[id] : null;
}

export function getMobileProtocolByDesktopStudyType(studyType: string) {
  const id = MOBILE_PROTOCOL_DESKTOP_STUDY_TYPE_TO_ID[studyType];
  return id ? MOBILE_PROTOCOL_REGISTRY[id] : null;
}

export function buildMobileStudiesData(snapshot: {
  studiesData: Record<string, unknown>;
}) {
  const result: Record<string, unknown> = {};

  Object.entries(snapshot.studiesData).forEach(([studyType, value]) => {
    const protocol = getMobileProtocolByDesktopStudyType(studyType);

    if (!value || typeof value !== "object") {
      result[studyType] = protocol ? protocol.createEmpty() : createEmptyStudyDraft();
      return;
    }

    if (!protocol) {
      const draft = value as Partial<StudyDraft>;
      result[studyType] = {
        general: draft.general ?? "",
        sections: draft.sections ?? {},
      };
      return;
    }

    result[studyType] = protocol.normalize(value);
  });

  return result;
}
