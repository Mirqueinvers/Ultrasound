// Frontend/src/types/defaultStates.ts

import type { KidneyProtocol } from './kidney';
import type { GallbladderProtocol } from './gallbladder';
import type { LiverProtocol } from './hepat';
import type { SpleenProtocol } from './spleen';
import type { PancreasProtocol } from './pancreas';
import type { UrinaryBladderProtocol } from './urinarybladder';
import type { OvaryProtocol } from './ovary';
import type { UterusProtocol } from './uterus';
import type { ProstateProtocol } from "./prostate";
import type { TestisProtocol } from "./testis";
import type { SingleTestisProtocol } from "./testis";
import type { ThyroidLobeProtocol } from "./thyroid";
import type { ThyroidProtocol } from "./thyroid";
import type { BreastSideProtocol } from "./breast";
import type { BreastProtocol } from "./breast";
import type { ChildDispensaryProtocol } from "./childDispensary";
import type { SoftTissueProtocol } from "./softTissue";

export const defaultKidneyState: KidneyProtocol = {
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

export const defaultGallbladderState: GallbladderProtocol = {
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

export const defaultLiverState: LiverProtocol = {
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

export const defaultSpleenState: SpleenProtocol = {
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

export const defaultPancreasState: PancreasProtocol = {
  head: "",
  body: "",
  tail: "",
  echogenicity: "",
  echostructure: "",
  contour: "",
  pathologicalFormations: "Не определяются",
  pathologicalFormationsText: "",
  wirsungDuct: "",
  additional: "",
  conclusion: "",
};

export const defaultUrinaryBladderState: UrinaryBladderProtocol = {
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

export const defaultOvaryState: OvaryProtocol = {
  length: "",
  width: "",
  thickness: "",
  volume: "",
  shape: "",
  contour: "",
  cysts: "",
  cystsList: [],
  formations: "",
  formationsText: "",
  additional: "",
  conclusion: "",
};


export const defaultUterusState: UterusProtocol = {
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

export const defaultProstateState: ProstateProtocol = {
  studyType: "",
  length: "",
  width: "",
  apDimension: "",
  volume: "",

  contour: "",
  symmetry: "",
  shape: "",
  echogenicity: "",

  echotexture: "",
  echotextureText: "",

  bladderProtrusion: "",
  bladderProtrusionMm: "",

  pathologicLesions: "",
  pathologicLesionsText: "",

  additional: "",
  conclusion: "",
};

export const defaultSingleTestisState: SingleTestisProtocol = {
  length: "",
  width: "",
  depth: "",
  volume: "",

  location: "",
  contour: "",

  capsule: "",
  capsuleText: "",

  echogenicity: "",
  echotexture: "",
  echotextureText: "",

  mediastinum: "",
  mediastinumText: "",

  bloodFlow: "",

  appendage: "",
  appendageText: "",

  fluidAmount: "",
  fluidAmountText: "",

  additional: "",
  conclusion: "",
};

export const defaultTestisState: TestisProtocol = {
  rightTestis: null,
  leftTestis: null,
};

export const defaultThyroidLobeState: ThyroidLobeProtocol = {
  length: "",
  width: "",
  depth: "",
  volume: "",
  volumeFormations: "не определяются",
  nodesList: [],
};

export const defaultThyroidState: ThyroidProtocol = {
  rightLobe: { ...defaultThyroidLobeState },
  leftLobe: { ...defaultThyroidLobeState },
  isthmusSize: "",
  totalVolume: "",
  rightToLeftRatio: "",
  echogenicity: "средняя",
  echostructure: "однородная",
  contour: "четкий ровный",
  symmetry: "сохранена",
  position: "обычное",
};

export const defaultBreastSideState: BreastSideProtocol = {
  skin: "не изменена",
  skinComment: "",
  nipples: "не изменены",
  nipplesComment: "",
  milkDucts: "не расширены",
  volumeFormations: "не определяются",
  nodesList: [],
};

export const defaultBreastState: BreastProtocol = {
  lastMenstruationDate: "",
  cycleDay: "",
  rightBreast: { ...defaultBreastSideState },
  leftBreast: { ...defaultBreastSideState },
  structure: "преимущественно жировая ткань",
};

export const defaultChildDispensaryState: ChildDispensaryProtocol = {
  liverStatus: "без патологии",
  liver: null,
  gallbladderStatus: "без патологии",
  gallbladder: null,
  pancreasStatus: "без патологии",
  pancreas: null,
  spleenStatus: "без патологии",
  spleen: null,
  kidneysStatus: "без патологии",
  rightKidney: null,
  leftKidney: null,
};

export const defaultSoftTissueState: SoftTissueProtocol = {
  researchArea: "",
  description: "",
};