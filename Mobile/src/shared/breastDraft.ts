export interface BreastNodeDraft {
  number: number;
  size1: string;
  size2: string;
  depth: string;
  direction: string;
  echogenicity: string;
  echostructure: string;
  contour: string;
  orientation: string;
  bloodFlow: string;
  comment: string;
}

export interface BreastSideDraft {
  skin: string;
  skinComment: string;
  nipples: string;
  nipplesComment: string;
  milkDucts: string;
  volumeFormations: string;
  nodesList: BreastNodeDraft[];
  additional: string;
}

export interface BreastProtocolDraft {
  lastMenstruationDate: string;
  cycleDay: string;
  rightBreast: BreastSideDraft;
  leftBreast: BreastSideDraft;
  structure: string;
}

export interface BreastStudyDraft {
  breast: BreastProtocolDraft;
  conclusion: string;
  recommendations: string;
}

export function createEmptyBreastNodeDraft(): BreastNodeDraft {
  return {
    number: 1,
    size1: "",
    size2: "",
    depth: "",
    direction: "",
    echogenicity: "",
    echostructure: "",
    contour: "",
    orientation: "",
    bloodFlow: "",
    comment: "",
  };
}

export function createEmptyBreastSideDraft(): BreastSideDraft {
  return {
    skin: "не изменена",
    skinComment: "",
    nipples: "не изменены",
    nipplesComment: "",
    milkDucts: "не расширены",
    volumeFormations: "не определяются",
    nodesList: [],
    additional: "",
  };
}

export function createEmptyBreastProtocolDraft(): BreastProtocolDraft {
  return {
    lastMenstruationDate: "",
    cycleDay: "",
    rightBreast: createEmptyBreastSideDraft(),
    leftBreast: createEmptyBreastSideDraft(),
    structure: "преимущественно жировая ткань",
  };
}

export function createEmptyBreastStudyDraft(): BreastStudyDraft {
  return {
    breast: createEmptyBreastProtocolDraft(),
    conclusion: "",
    recommendations: "",
  };
}
