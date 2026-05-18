import { createEmptyOmtMaleDraft, type OmtMaleDraft, type ProstateDraft } from "../../shared/omtMaleDraft";

export function normalizeOmtMaleDraft(value: unknown): OmtMaleDraft {
  const base = createEmptyOmtMaleDraft();
  const source = value && typeof value === "object" ? (value as Partial<OmtMaleDraft>) : {};

  const normalizeBladder = (bladder: unknown): OmtMaleDraft["urinaryBladder"] => {
    const sourceBladder =
      bladder && typeof bladder === "object"
        ? (bladder as Partial<OmtMaleDraft["urinaryBladder"]>)
        : {};

    return {
      ...createEmptyOmtMaleDraft().urinaryBladder,
      ...sourceBladder,
    };
  };

  const normalizeProstateDraft = (value: unknown): ProstateDraft => {
    const baseProstate = createEmptyOmtMaleDraft().prostate;
    const sourceProstate = value && typeof value === "object" ? (value as Partial<ProstateDraft>) : {};

    return {
      ...baseProstate,
      ...sourceProstate,
    };
  };

  return {
    ...base,
    ...source,
    prostate: normalizeProstateDraft(source.prostate),
    urinaryBladder: normalizeBladder(source.urinaryBladder),
  };
}
