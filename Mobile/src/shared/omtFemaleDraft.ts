export interface UterusNodeDraft {
  number: number;
  wallLocation: string;
  layerType: string;
  size1: string;
  size2: string;
  contourClarity: string;
  contourEvenness: string;
  echogenicity: string;
  structure: string;
  cavityImpact: string;
  bloodFlow: string;
  comment: string;
}

export interface UterusDraft {
  uterusStatus: string;
  studyType: string;
  lastMenstruationDate: string;
  cycleDay: string;
  menopause: string;
  length: string;
  width: string;
  apDimension: string;
  volume: string;
  shape: string;
  position: string;
  myometriumStructure: string;
  myometriumStructureText: string;
  myometriumEchogenicity: string;
  myomaNodesPresence: string;
  myomaNodesList: UterusNodeDraft[];
  uterineCavity: string;
  uterineCavityText: string;
  endometriumSize: string;
  endometriumStructure: string;
  cervixSize: string;
  cervixEchostructure: string;
  cervixEchostructureText: string;
  cervicalCanal: string;
  cervicalCanalText: string;
  freeFluid: string;
  freeFluidText: string;
  additional: string;
  conclusion: string;
}

export interface OvaryCystDraft {
  size: string;
}

export interface OvaryDraft {
  position: string;
  length: string;
  width: string;
  thickness: string;
  volume: string;
  shape: string;
  contour: string;
  cysts: string;
  cystsList: OvaryCystDraft[];
  formations: string;
  formationsText: string;
  additional: string;
  conclusion: string;
}

export interface UrinaryBladderDraft {
  residualStatus: string;
  length: string;
  width: string;
  depth: string;
  volume: string;
  wallThickness: string;
  residualLength: string;
  residualWidth: string;
  residualDepth: string;
  residualVolume: string;
  contents: string;
  contentsText: string;
  additional: string;
}

export interface OmtFemaleDraft {
  uterus: UterusDraft;
  leftOvary: OvaryDraft;
  rightOvary: OvaryDraft;
  urinaryBladder: UrinaryBladderDraft;
  conclusion: string;
  recommendations: string;
}

export function createEmptyUterusNodeDraft(): UterusNodeDraft {
  return {
    number: 1,
    wallLocation: "",
    layerType: "",
    size1: "",
    size2: "",
    contourClarity: "",
    contourEvenness: "",
    echogenicity: "",
    structure: "",
    cavityImpact: "",
    bloodFlow: "",
    comment: "",
  };
}

export function createEmptyUterusDraft(): UterusDraft {
  return {
    uterusStatus: "обычное",
    studyType: "",
    lastMenstruationDate: "",
    cycleDay: "",
    menopause: "",
    length: "",
    width: "",
    apDimension: "",
    volume: "",
    shape: "",
    position: "",
    myometriumStructure: "",
    myometriumStructureText: "",
    myometriumEchogenicity: "",
    myomaNodesPresence: "не определяются",
    myomaNodesList: [],
    uterineCavity: "",
    uterineCavityText: "",
    endometriumSize: "",
    endometriumStructure: "",
    cervixSize: "",
    cervixEchostructure: "",
    cervixEchostructureText: "",
    cervicalCanal: "",
    cervicalCanalText: "",
    freeFluid: "",
    freeFluidText: "",
    additional: "",
    conclusion: "",
  };
}

export function createEmptyOvaryCystDraft(): OvaryCystDraft {
  return {
    size: "",
  };
}

export function createEmptyOvaryDraft(): OvaryDraft {
  return {
    position: "",
    length: "",
    width: "",
    thickness: "",
    volume: "",
    shape: "",
    contour: "",
    cysts: "не определяются",
    cystsList: [],
    formations: "не определяются",
    formationsText: "",
    additional: "",
    conclusion: "",
  };
}

export function createEmptyUrinaryBladderDraft(): UrinaryBladderDraft {
  return {
    residualStatus: "",
    length: "",
    width: "",
    depth: "",
    volume: "",
    wallThickness: "",
    residualLength: "",
    residualWidth: "",
    residualDepth: "",
    residualVolume: "",
    contents: "",
    contentsText: "",
    additional: "",
  };
}

export function createEmptyOmtFemaleDraft(): OmtFemaleDraft {
  return {
    uterus: createEmptyUterusDraft(),
    leftOvary: createEmptyOvaryDraft(),
    rightOvary: createEmptyOvaryDraft(),
    urinaryBladder: createEmptyUrinaryBladderDraft(),
    conclusion: "",
    recommendations: "",
  };
}
