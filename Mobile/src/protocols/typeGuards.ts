import { type ObpDraft } from "../shared/obpDraft";
import { type KidneyStudyDraft } from "../shared/kidneyDraft";
import { type OmtFemaleDraft } from "../shared/omtFemaleDraft";
import { type OmtMaleDraft } from "../shared/omtMaleDraft";
import { type ThyroidStudyDraft } from "../shared/thyroidDraft";
import { type BreastStudyDraft } from "../shared/breastDraft";
import { type LymphNodesStudyDraft } from "../shared/lymphNodesDraft";

export function isObpDraft(value: unknown): value is ObpDraft {
  return Boolean(value && typeof value === "object" && "liver" in value && "gallbladder" in value);
}

export function isKidneyStudyDraft(value: unknown): value is KidneyStudyDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "rightKidney" in value &&
      "leftKidney" in value &&
      "urinaryBladder" in value,
  );
}

export function isOmtFemaleDraft(value: unknown): value is OmtFemaleDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "uterus" in value &&
      "leftOvary" in value &&
      "rightOvary" in value &&
      "urinaryBladder" in value,
  );
}

export function isOmtMaleDraft(value: unknown): value is OmtMaleDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "prostate" in value &&
      "urinaryBladder" in value &&
      "conclusion" in value &&
      "recommendations" in value,
  );
}

export function isThyroidStudyDraft(value: unknown): value is ThyroidStudyDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "thyroid" in value &&
      "conclusion" in value &&
      "recommendations" in value,
  );
}

export function isBreastStudyDraft(value: unknown): value is BreastStudyDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "breast" in value &&
      "conclusion" in value &&
      "recommendations" in value,
  );
}

export function isLymphNodesStudyDraft(value: unknown): value is LymphNodesStudyDraft {
  return Boolean(
    value &&
      typeof value === "object" &&
      "lymphNodes" in value &&
      "conclusion" in value &&
      "recommendations" in value,
  );
}
