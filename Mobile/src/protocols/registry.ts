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
  Почки: "kidneys",
  "Органы мошонки": "scrotum",
  "ОМТ (Ж)": "omt_female",
  "ОМТ (М)": "omt_male",
  "Щитовидная железа": "thyroid",
  "Молочные железы": "breast",
  Лимфоузлы: "lymph_nodes",
  "Лимфатические узлы": "lymph_nodes",
};

// Legacy aliases are kept only for compatibility with older saved desktop/mobile data.
const LEGACY_PROTOCOL_ALIASES: Record<string, MobileProtocolId> = {
  "ОБП??": "obp",
  "ОБП (?)": "obp",
  "ОБПОБП?? ОБПОБП": "obp",
  "ОБПОБПОБП": "obp",
};

export function getMobileProtocolById(id: MobileProtocolId) {
  return MOBILE_PROTOCOL_REGISTRY[id] ?? null;
}

export function getMobileProtocolByDesktopStudyType(studyType: string) {
  const id = MOBILE_PROTOCOL_DESKTOP_STUDY_TYPE_TO_ID[studyType] ?? LEGACY_PROTOCOL_ALIASES[studyType];
  return id ? MOBILE_PROTOCOL_REGISTRY[id] : null;
}
