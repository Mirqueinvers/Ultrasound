import {
  createEmptyObpDraft,
  createEmptyGallbladderConcretionDraft,
  createEmptyGallbladderPolypDraft,
  type ObpDraft,
  type LiverDraft,
  type GallbladderDraft,
  type GallbladderConcretionDraft,
  type GallbladderPolypDraft,
  type PancreasDraft,
  type SpleenDraft,
} from "../../shared/obpDraft";

export function normalizeObpDraft(value: unknown): ObpDraft {
  const base = createEmptyObpDraft();
  const source = value && typeof value === "object" ? (value as Partial<ObpDraft>) : {};

  return {
    ...base,
    ...source,
    liver: {
      ...base.liver,
      ...(source.liver ?? {}),
    },
    gallbladder: {
      ...base.gallbladder,
      ...(source.gallbladder ?? {}),
    },
    pancreas: {
      ...base.pancreas,
      ...(source.pancreas ?? {}),
    },
    spleen: {
      ...base.spleen,
      ...(source.spleen ?? {}),
    },
  };
}
