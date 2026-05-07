export interface ThyroidNodeDraft {
  number: number;
  size1: string;
  size2: string;
  echogenicity: string;
  echostructure: string;
  contour: string;
  echogenicFoci: string;
  orientation: string;
  bloodFlow: string;
  comment: string;
  tiradsCategory: string;
}

export interface ThyroidLobeDraft {
  length: string;
  width: string;
  depth: string;
  volume: string;
  volumeFormations: string;
  additional: string;
  nodesList: ThyroidNodeDraft[];
}

export interface ThyroidDraft {
  rightLobe: ThyroidLobeDraft;
  leftLobe: ThyroidLobeDraft;
  isthmusSize: string;
  totalVolume: string;
  rightToLeftRatio: string;
  echogenicity: string;
  echostructure: string;
  contour: string;
  symmetry: string;
  position: string;
}

export interface ThyroidStudyDraft {
  thyroid: ThyroidDraft;
  conclusion: string;
  recommendations: string;
}

export function createEmptyThyroidNodeDraft(): ThyroidNodeDraft {
  return {
    number: 1,
    size1: "",
    size2: "",
    echogenicity: "",
    echostructure: "",
    contour: "",
    echogenicFoci: "",
    orientation: "",
    bloodFlow: "",
    comment: "",
    tiradsCategory: "",
  };
}

export function createEmptyThyroidLobeDraft(): ThyroidLobeDraft {
  return {
    length: "",
    width: "",
    depth: "",
    volume: "",
    volumeFormations: "не определяются",
    additional: "",
    nodesList: [],
  };
}

export function createEmptyThyroidDraft(): ThyroidDraft {
  return {
    rightLobe: createEmptyThyroidLobeDraft(),
    leftLobe: createEmptyThyroidLobeDraft(),
    isthmusSize: "",
    totalVolume: "",
    rightToLeftRatio: "",
    echogenicity: "",
    echostructure: "",
    contour: "",
    symmetry: "",
    position: "",
  };
}

export function createEmptyThyroidStudyDraft(): ThyroidStudyDraft {
  return {
    thyroid: createEmptyThyroidDraft(),
    conclusion: "",
    recommendations: "",
  };
}
