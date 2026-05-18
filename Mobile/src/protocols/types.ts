import type { BreastStudyDraft } from "../shared/breastDraft";
import type { KidneyStudyDraft } from "../shared/kidneyDraft";
import type { LymphNodesStudyDraft } from "../shared/lymphNodesDraft";
import type { OmtFemaleDraft } from "../shared/omtFemaleDraft";
import type { OmtMaleDraft } from "../shared/omtMaleDraft";
import type { ObpDraft } from "../shared/obpDraft";
import type { ScrotumDraft } from "../shared/scrotumDraft";
import type { StudyDraft } from "../shared/syncHelpers";
import type { ThyroidStudyDraft } from "../shared/thyroidDraft";

export type MobileStudyData =
  | StudyDraft
  | ObpDraft
  | KidneyStudyDraft
  | ScrotumDraft
  | OmtFemaleDraft
  | OmtMaleDraft
  | ThyroidStudyDraft
  | BreastStudyDraft
  | LymphNodesStudyDraft;

export type MobileStudiesDataMap = Record<string, MobileStudyData>;
