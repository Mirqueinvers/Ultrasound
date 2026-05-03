export interface KidneyConcrementDraft {
  size: string;
  location: string;
}

export interface KidneyCystDraft {
  size: string;
  location: string;
}

export interface KidneyDraft {
  position: string;
  positionText: string;
  length: string;
  width: string;
  thickness: string;
  parenchymaSize: string;
  parenchymaEchogenicity: string;
  parenchymaStructure: string;
  parenchymaConcrements: string;
  parenchymaConcrementslist: KidneyConcrementDraft[];
  parenchymaCysts: string;
  parenchymaCystslist: KidneyCystDraft[];
  parenchymaMultipleCysts: boolean;
  parenchymaMultipleCystsSize: string;
  parenchymaPathologicalFormations: string;
  parenchymaPathologicalFormationsText: string;
  pcsSize: string;
  pcsMicroliths: string;
  pcsMicrolithsSize: string;
  pcsConcrements: string;
  pcsConcrementslist: KidneyConcrementDraft[];
  pcsCysts: string;
  pcsCystslist: KidneyCystDraft[];
  pcsMultipleCysts: boolean;
  pcsMultipleCystsSize: string;
  pcsPathologicalFormations: string;
  pcsPathologicalFormationsText: string;
  sinus: string;
  adrenalArea: string;
  adrenalAreaText: string;
  contour: string;
  additional: string;
}

export interface UrinaryBladderDraft {
  length: string;
  width: string;
  depth: string;
  volume: string;
  wallThickness: string;
  residualStatus: string;
  residualLength: string;
  residualWidth: string;
  residualDepth: string;
  residualVolume: string;
  contents: string;
  contentsText: string;
  additional: string;
}

export interface KidneyStudyDraft {
  rightKidney: KidneyDraft | null;
  leftKidney: KidneyDraft | null;
  urinaryBladder: UrinaryBladderDraft | null;
  conclusion: string;
  recommendations: string;
}

export function createEmptyKidneyConcrementDraft(): KidneyConcrementDraft {
  return {
    size: "",
    location: "",
  };
}

export function createEmptyKidneyCystDraft(): KidneyCystDraft {
  return {
    size: "",
    location: "",
  };
}

export function createEmptyKidneyDraft(): KidneyDraft {
  return {
    position: "",
    positionText: "",
    length: "",
    width: "",
    thickness: "",
    parenchymaSize: "",
    parenchymaEchogenicity: "",
    parenchymaStructure: "",
    parenchymaConcrements: "не определяются",
    parenchymaConcrementslist: [],
    parenchymaCysts: "не определяются",
    parenchymaCystslist: [],
    parenchymaMultipleCysts: false,
    parenchymaMultipleCystsSize: "",
    parenchymaPathologicalFormations: "не определяются",
    parenchymaPathologicalFormationsText: "",
    pcsSize: "",
    pcsMicroliths: "не определяются",
    pcsMicrolithsSize: "",
    pcsConcrements: "не определяются",
    pcsConcrementslist: [],
    pcsCysts: "не определяются",
    pcsCystslist: [],
    pcsMultipleCysts: false,
    pcsMultipleCystsSize: "",
    pcsPathologicalFormations: "не определяются",
    pcsPathologicalFormationsText: "",
    sinus: "",
    adrenalArea: "",
    adrenalAreaText: "",
    contour: "",
    additional: "",
  };
}

export function createEmptyUrinaryBladderDraft(): UrinaryBladderDraft {
  return {
    length: "",
    width: "",
    depth: "",
    volume: "",
    wallThickness: "",
    residualStatus: "",
    residualLength: "",
    residualWidth: "",
    residualDepth: "",
    residualVolume: "",
    contents: "",
    contentsText: "",
    additional: "",
  };
}

export function createEmptyKidneyStudyDraft(): KidneyStudyDraft {
  return {
    rightKidney: createEmptyKidneyDraft(),
    leftKidney: createEmptyKidneyDraft(),
    urinaryBladder: createEmptyUrinaryBladderDraft(),
    conclusion: "",
    recommendations: "",
  };
}
