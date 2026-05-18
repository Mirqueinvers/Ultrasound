import {
  createEmptyKidneyDraft,
  createEmptyKidneyStudyDraft,
  createEmptyUrinaryBladderDraft,
  type KidneyDraft,
  type KidneyStudyDraft,
  type UrinaryBladderDraft,
} from "../../shared/kidneyDraft";

export function normalizeKidneyDraft(value: unknown): KidneyStudyDraft {
  const base = createEmptyKidneyStudyDraft();
  const source = value && typeof value === "object" ? (value as Partial<KidneyStudyDraft>) : {};

  const normalizeKidneySide = (kidney: unknown): KidneyDraft => {
    const sourceKidney =
      kidney && typeof kidney === "object" ? (kidney as Partial<KidneyDraft>) : {};

    return {
      ...createEmptyKidneyDraft(),
      ...sourceKidney,
      parenchymaConcrementslist: sourceKidney.parenchymaConcrementslist ?? [],
      parenchymaCystslist: sourceKidney.parenchymaCystslist ?? [],
      pcsConcrementslist: sourceKidney.pcsConcrementslist ?? [],
      pcsCystslist: sourceKidney.pcsCystslist ?? [],
    };
  };

  const normalizeBladder = (bladder: unknown): UrinaryBladderDraft => {
    const sourceBladder =
      bladder && typeof bladder === "object" ? (bladder as Partial<UrinaryBladderDraft>) : {};

    return {
      ...createEmptyUrinaryBladderDraft(),
      ...sourceBladder,
    };
  };

  return {
    ...base,
    ...source,
    rightKidney: normalizeKidneySide(source.rightKidney ?? {}),
    leftKidney: normalizeKidneySide(source.leftKidney ?? {}),
    urinaryBladder: normalizeBladder(source.urinaryBladder ?? {}),
  };
}
