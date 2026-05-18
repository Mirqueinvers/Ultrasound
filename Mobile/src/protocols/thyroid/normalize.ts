import { createEmptyThyroidStudyDraft, type ThyroidStudyDraft } from "../../shared/thyroidDraft";

export function normalizeThyroidDraft(value: unknown): ThyroidStudyDraft {
  const base = createEmptyThyroidStudyDraft();
  const source = value && typeof value === "object" ? (value as Partial<ThyroidStudyDraft>) : {};

  const normalizeNode = (node: unknown) => {
    const sourceNode =
      node && typeof node === "object"
        ? (node as Partial<ThyroidStudyDraft["thyroid"]["rightLobe"]["nodesList"][number]>)
        : {};

    return {
      ...createEmptyThyroidStudyDraft().thyroid.rightLobe.nodesList[0] ?? undefined,
      number: typeof sourceNode.number === "number" ? sourceNode.number : 1,
      size1: sourceNode.size1 ?? "",
      size2: sourceNode.size2 ?? "",
      echogenicity: sourceNode.echogenicity ?? "изоэхогенный",
      echostructure: sourceNode.echostructure ?? "однородная",
      contour: sourceNode.contour ?? "четкий ровный",
      echogenicFoci: sourceNode.echogenicFoci ?? "",
      orientation: sourceNode.orientation ?? "горизонтальная",
      bloodFlow: sourceNode.bloodFlow ?? "не изменен",
      comment: sourceNode.comment ?? "",
      tiradsCategory: sourceNode.tiradsCategory ?? "",
    };
  };

  const normalizeLobe = (lobe: unknown): ThyroidStudyDraft["thyroid"]["rightLobe"] => {
    const sourceLobe =
      lobe && typeof lobe === "object"
        ? (lobe as Partial<ThyroidStudyDraft["thyroid"]["rightLobe"]>)
        : {};

    return {
      ...base.thyroid.rightLobe,
      ...sourceLobe,
      nodesList: sourceLobe.nodesList?.length
        ? sourceLobe.nodesList.map((node) => normalizeNode(node))
        : [],
    };
  };

  const thyroidSource =
    source.thyroid && typeof source.thyroid === "object"
      ? (source.thyroid as Partial<ThyroidStudyDraft["thyroid"]>)
      : {};

  return {
    ...base,
    ...source,
    thyroid: {
      ...base.thyroid,
      ...thyroidSource,
      rightLobe: normalizeLobe(thyroidSource.rightLobe),
      leftLobe: normalizeLobe(thyroidSource.leftLobe),
    },
  };
}
