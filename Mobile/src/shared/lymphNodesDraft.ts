export interface LymphNodeDraft {
  id: string;
  side: "left" | "right";
  echogenicity: string;
  echostructure: string;
  shape: string;
  contour: string;
  bloodFlow: string;
  size1: string;
  size2: string;
}

export interface LymphNodeRegionDraft {
  detected: "not_detected" | "detected";
  nodes: LymphNodeDraft[];
}

export interface LymphNodesDraft {
  submandibular: LymphNodeRegionDraft;
  cervical: LymphNodeRegionDraft;
  subclavian: LymphNodeRegionDraft;
  supraclavicular: LymphNodeRegionDraft;
  axillary: LymphNodeRegionDraft;
  inguinal: LymphNodeRegionDraft;
}

export interface LymphNodesStudyDraft {
  lymphNodes: LymphNodesDraft;
  conclusion: string;
  recommendations: string;
}

const createEmptyLymphNodeRegionDraft = (): LymphNodeRegionDraft => ({
  detected: "not_detected",
  nodes: [],
});

export function createEmptyLymphNodeDraft(): LymphNodeDraft {
  return {
    id: "",
    side: "right",
    echogenicity: "",
    echostructure: "",
    shape: "",
    contour: "",
    bloodFlow: "",
    size1: "",
    size2: "",
  };
}

export function createEmptyLymphNodesDraft(): LymphNodesDraft {
  return {
    submandibular: createEmptyLymphNodeRegionDraft(),
    cervical: createEmptyLymphNodeRegionDraft(),
    subclavian: createEmptyLymphNodeRegionDraft(),
    supraclavicular: createEmptyLymphNodeRegionDraft(),
    axillary: createEmptyLymphNodeRegionDraft(),
    inguinal: createEmptyLymphNodeRegionDraft(),
  };
}

export function createEmptyLymphNodesStudyDraft(): LymphNodesStudyDraft {
  return {
    lymphNodes: createEmptyLymphNodesDraft(),
    conclusion: "",
    recommendations: "",
  };
}

function normalizeNode(node: unknown): LymphNodeDraft {
  const source = node && typeof node === "object" ? (node as Partial<LymphNodeDraft>) : {};

  return {
    ...createEmptyLymphNodeDraft(),
    ...source,
    id: typeof source.id === "string" ? source.id : createEmptyLymphNodeDraft().id,
    side: source.side === "left" ? "left" : "right",
    echogenicity: source.echogenicity ?? "",
    echostructure: source.echostructure ?? "",
    shape: source.shape ?? "",
    contour: source.contour ?? "",
    bloodFlow: source.bloodFlow ?? "",
    size1: source.size1 ?? "",
    size2: source.size2 ?? "",
  };
}

function normalizeRegion(region: unknown): LymphNodeRegionDraft {
  const source = region && typeof region === "object" ? (region as Partial<LymphNodeRegionDraft>) : {};

  return {
    detected: source.detected === "detected" ? "detected" : "not_detected",
    nodes: Array.isArray(source.nodes) ? source.nodes.map((node) => normalizeNode(node)) : [],
  };
}

export function normalizeLymphNodesStudyDraft(value: unknown): LymphNodesStudyDraft {
  const base = createEmptyLymphNodesStudyDraft();
  const source = value && typeof value === "object" ? (value as Partial<LymphNodesStudyDraft> & Record<string, unknown>) : {};

  const rawProtocol =
    source.lymphNodes && typeof source.lymphNodes === "object"
      ? (source.lymphNodes as Partial<LymphNodesDraft>)
      : (source as Partial<LymphNodesDraft>);

  return {
    ...base,
    ...source,
    lymphNodes: {
      ...base.lymphNodes,
      submandibular: normalizeRegion(rawProtocol.submandibular),
      cervical: normalizeRegion(rawProtocol.cervical),
      subclavian: normalizeRegion(rawProtocol.subclavian),
      supraclavicular: normalizeRegion(rawProtocol.supraclavicular),
      axillary: normalizeRegion(rawProtocol.axillary),
      inguinal: normalizeRegion(rawProtocol.inguinal),
    },
    conclusion: typeof source.conclusion === "string" ? source.conclusion : base.conclusion,
    recommendations:
      typeof source.recommendations === "string" ? source.recommendations : base.recommendations,
  };
}
