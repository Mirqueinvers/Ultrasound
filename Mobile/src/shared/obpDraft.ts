export interface LiverDraft {
  rightLobeAP: string;
  leftLobeAP: string;
  rightLobeCCR: string;
  rightLobeCVR: string;
  leftLobeCCR: string;
  rightLobeTotal: string;
  leftLobeTotal: string;
  echogenicity: string;
  homogeneity: string;
  contours: string;
  lowerEdgeAngle: string;
  focalLesionsPresence: string;
  focalLesions: string;
  vascularPattern: string;
  portalVeinDiameter: string;
  ivc: string;
  additional: string;
  conclusion: string;
}

export interface GallbladderConcretionDraft {
  size: string;
  position: string;
}

export interface GallbladderPolypDraft {
  size: string;
  position: string;
  wall: string;
}

export interface GallbladderDraft {
  position: string;
  length: string;
  width: string;
  wallThickness: string;
  shape: string;
  constriction: string;
  contentType: string;
  concretions: string;
  concretionsList: GallbladderConcretionDraft[];
  polyps: string;
  polypsList: GallbladderPolypDraft[];
  content: string;
  cysticDuct: string;
  commonBileDuct: string;
  additional: string;
  conclusion: string;
}

export interface PancreasDraft {
  head: string;
  body: string;
  tail: string;
  echogenicity: string;
  echostructure: string;
  contour: string;
  pathologicalFormations: string;
  pathologicalFormationsText: string;
  wirsungDuct: string;
  additional: string;
  conclusion: string;
}

export interface SpleenDraft {
  position: string;
  length: string;
  width: string;
  echogenicity: string;
  echostructure: string;
  contours: string;
  pathologicalFormations: string;
  pathologicalFormationsText: string;
  splenicVein: string;
  splenicArtery: string;
  additional: string;
  conclusion: string;
}

export interface ObpDraft {
  liver: LiverDraft;
  gallbladder: GallbladderDraft;
  pancreas: PancreasDraft;
  spleen: SpleenDraft;
  freeFluid: string;
  freeFluidDetails: string;
  conclusion: string;
  recommendations: string;
}

export function createEmptyGallbladderConcretionDraft(): GallbladderConcretionDraft {
  return {
    size: "",
    position: "",
  };
}

export function createEmptyGallbladderPolypDraft(): GallbladderPolypDraft {
  return {
    size: "",
    position: "",
    wall: "",
  };
}

export function createEmptyGallbladderDraft(): GallbladderDraft {
  return {
    position: "обычное",
    length: "",
    width: "",
    wallThickness: "",
    shape: "",
    constriction: "",
    contentType: "",
    concretions: "",
    concretionsList: [],
    polyps: "",
    polypsList: [],
    content: "",
    cysticDuct: "",
    commonBileDuct: "",
    additional: "",
    conclusion: "",
  };
}

export function createEmptyPancreasDraft(): PancreasDraft {
  return {
    head: "",
    body: "",
    tail: "",
    echogenicity: "",
    echostructure: "",
    contour: "",
    pathologicalFormations: "",
    pathologicalFormationsText: "",
    wirsungDuct: "",
    additional: "",
    conclusion: "",
  };
}

export function createEmptySpleenDraft(): SpleenDraft {
  return {
    position: "обычное",
    length: "",
    width: "",
    echogenicity: "",
    echostructure: "",
    contours: "",
    pathologicalFormations: "",
    pathologicalFormationsText: "",
    splenicVein: "",
    splenicArtery: "",
    additional: "",
    conclusion: "",
  };
}

export function createEmptyLiverDraft(): LiverDraft {
  return {
    rightLobeAP: "",
    leftLobeAP: "",
    rightLobeCCR: "",
    rightLobeCVR: "",
    leftLobeCCR: "",
    rightLobeTotal: "",
    leftLobeTotal: "",
    echogenicity: "",
    homogeneity: "",
    contours: "",
    lowerEdgeAngle: "",
    focalLesionsPresence: "",
    focalLesions: "",
    vascularPattern: "",
    portalVeinDiameter: "",
    ivc: "",
    additional: "",
    conclusion: "",
  };
}

export function createEmptyObpDraft(): ObpDraft {
  return {
    liver: createEmptyLiverDraft(),
    gallbladder: createEmptyGallbladderDraft(),
    pancreas: createEmptyPancreasDraft(),
    spleen: createEmptySpleenDraft(),
    freeFluid: "",
    freeFluidDetails: "",
    conclusion: "",
    recommendations: "",
  };
}
