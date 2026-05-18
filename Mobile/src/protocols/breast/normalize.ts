import {
  createEmptyBreastStudyDraft,
  createEmptyBreastSideDraft,
  createEmptyBreastNodeDraft,
  type BreastStudyDraft,
  type BreastProtocolDraft,
  type BreastSideDraft,
  type BreastNodeDraft,
} from "../../shared/breastDraft";

export function normalizeBreastStudyDraft(value: unknown): BreastStudyDraft {
  const base = createEmptyBreastStudyDraft();
  const source = value && typeof value === "object" ? (value as Partial<BreastStudyDraft>) : {};

  const normalizeNode = (node: unknown): BreastNodeDraft => {
    const sourceNode = node && typeof node === "object" ? (node as Partial<BreastNodeDraft>) : {};

    return {
      ...createEmptyBreastNodeDraft(),
      ...sourceNode,
      number: typeof sourceNode.number === "number" ? sourceNode.number : 1,
      size1: sourceNode.size1 ?? "",
      size2: sourceNode.size2 ?? "",
      depth: sourceNode.depth ?? "",
      direction: sourceNode.direction ?? "",
      echogenicity: sourceNode.echogenicity ?? "средняя",
      echostructure: sourceNode.echostructure ?? "однородная",
      contour: sourceNode.contour ?? "четкий ровный",
      orientation: sourceNode.orientation ?? "горизонтальная",
      bloodFlow: sourceNode.bloodFlow ?? "не изменен",
      comment: sourceNode.comment ?? "",
    };
  };

  const normalizeSide = (side: unknown): BreastSideDraft => {
    const sourceSide = side && typeof side === "object" ? (side as Partial<BreastSideDraft>) : {};

    return {
      ...createEmptyBreastSideDraft(),
      ...sourceSide,
      nodesList: Array.isArray(sourceSide.nodesList)
        ? sourceSide.nodesList.map((node) => normalizeNode(node))
        : [],
    };
  };

  const breastSource =
    source.breast && typeof source.breast === "object"
      ? (source.breast as Partial<BreastProtocolDraft>)
      : {};

  return {
    ...base,
    ...source,
    breast: {
      ...base.breast,
      ...breastSource,
      rightBreast: normalizeSide(breastSource.rightBreast),
      leftBreast: normalizeSide(breastSource.leftBreast),
    },
    conclusion: typeof source.conclusion === "string" ? source.conclusion : base.conclusion,
    recommendations:
      typeof source.recommendations === "string" ? source.recommendations : base.recommendations,
  };
}
