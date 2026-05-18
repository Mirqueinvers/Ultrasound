import {
  createEmptyScrotumDraft,
  createEmptySingleTestisDraft,
  type ScrotumDraft,
  type SingleTestisDraft,
} from "../../shared/scrotumDraft";

export function normalizeScrotumDraft(value: unknown): ScrotumDraft {
  const base = createEmptyScrotumDraft();
  const source = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const testisSource =
    source.testis && typeof source.testis === "object"
      ? (source.testis as Partial<{ rightTestis: unknown; leftTestis: unknown }>)
      : (source as Partial<{ rightTestis: unknown; leftTestis: unknown }>);

  const normalizeSingleTestisDraft = (value: unknown): SingleTestisDraft => {
    const baseTestis = createEmptySingleTestisDraft();
    const sourceTestis = value && typeof value === "object" ? (value as Partial<SingleTestisDraft>) : {};

    return {
      ...baseTestis,
      ...sourceTestis,
    };
  };

  return {
    ...base,
    conclusion: typeof source.conclusion === "string" ? source.conclusion : base.conclusion,
    recommendations:
      typeof source.recommendations === "string" ? source.recommendations : base.recommendations,
    testis: {
      rightTestis: normalizeSingleTestisDraft(testisSource.rightTestis ?? {}),
      leftTestis: normalizeSingleTestisDraft(testisSource.leftTestis ?? {}),
    },
  };
}
