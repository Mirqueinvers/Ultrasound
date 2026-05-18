import { createEmptyOmtFemaleDraft, type OmtFemaleDraft } from "../../shared/omtFemaleDraft";

export function normalizeOmtFemaleDraft(value: unknown): OmtFemaleDraft {
  const base = createEmptyOmtFemaleDraft();
  const source = value && typeof value === "object" ? (value as Partial<OmtFemaleDraft>) : {};

  const normalizeUterusNode = (node: unknown) => {
    const sourceNode =
      node && typeof node === "object"
        ? (node as Partial<OmtFemaleDraft["uterus"]["myomaNodesList"][number]>)
        : {};
    return {
      number: typeof sourceNode.number === "number" ? sourceNode.number : 1,
      wallLocation: sourceNode.wallLocation ?? "",
      layerType: sourceNode.layerType ?? "",
      size1: sourceNode.size1 ?? "",
      size2: sourceNode.size2 ?? "",
      contourClarity: sourceNode.contourClarity ?? "",
      contourEvenness: sourceNode.contourEvenness ?? "",
      echogenicity: sourceNode.echogenicity ?? "",
      structure: sourceNode.structure ?? "",
      cavityImpact: sourceNode.cavityImpact ?? "",
      bloodFlow: sourceNode.bloodFlow ?? "",
      comment: sourceNode.comment ?? "",
    };
  };

  const normalizeOvary = (ovary: unknown): OmtFemaleDraft["leftOvary"] => {
    const sourceOvary =
      ovary && typeof ovary === "object" ? (ovary as Partial<OmtFemaleDraft["leftOvary"]>) : {};

    return {
      ...createEmptyOmtFemaleDraft().leftOvary,
      ...sourceOvary,
      cystsList: sourceOvary.cystsList?.length
        ? sourceOvary.cystsList.map((item) => ({
            size: item.size ?? "",
          }))
        : [],
    };
  };

  const normalizeBladder = (bladder: unknown): OmtFemaleDraft["urinaryBladder"] => {
    const sourceBladder =
      bladder && typeof bladder === "object"
        ? (bladder as Partial<OmtFemaleDraft["urinaryBladder"]>)
        : {};

    return {
      ...createEmptyOmtFemaleDraft().urinaryBladder,
      ...sourceBladder,
    };
  };

  const uterusSource =
    source.uterus && typeof source.uterus === "object"
      ? (source.uterus as Partial<OmtFemaleDraft["uterus"]>)
      : {};

  return {
    ...base,
    ...source,
    uterus: {
      ...base.uterus,
      ...uterusSource,
      myomaNodesList: uterusSource.myomaNodesList?.length
        ? uterusSource.myomaNodesList.map((node) => normalizeUterusNode(node))
        : [],
    },
    leftOvary: normalizeOvary(source.leftOvary),
    rightOvary: normalizeOvary(source.rightOvary),
    urinaryBladder: normalizeBladder(source.urinaryBladder),
  };
}
