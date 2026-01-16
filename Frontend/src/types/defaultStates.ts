// Frontend/src/types/defaultStates.ts

import type { KidneyProtocol } from './organs/kidney';
import type { GallbladderProtocol } from './organs/gallbladder';
import type { LiverProtocol } from './organs/hepat';
import type { SpleenProtocol } from './organs/spleen';
import type { PancreasProtocol } from './organs/pancreas';
import type { UrinaryBladderProtocol } from './organs/urinarybladder';
import type { OvaryProtocol } from './organs/ovary';
import type { UterusProtocol } from './organs/uterus';
import type { ProstateProtocol } from "./organs/prostate";
import type { TestisProtocol } from "./organs/testis";
import type { SingleTestisProtocol } from "./organs/testis";
import type { ThyroidLobeProtocol } from "./organs/thyroid";
import type { ThyroidProtocol } from "./organs/thyroid";
import type { BreastSideProtocol } from "./organs/breast";
import type { BreastProtocol } from "./organs/breast";
import type { ChildDispensaryProtocol } from "./studyes/childDispensary";
import type { SoftTissueProtocol } from "./studyes/softTissue";
import type { ObpProtocol } from "./studyes/obp";
import type { KidneyStudyProtocol } from "./studyes/kidneyStudy";
import type { OmtFemaleProtocol } from "./studyes/omtFemale";
import type { OmtMaleProtocol } from "./studyes/omtMale";
import type { BreastStudyProtocol } from "./studyes/breastStudy";
import type { ScrotumProtocol } from "./studyes/scrotum";
import type { ThyroidStudyProtocol } from "./studyes/thyroidStudy";
import type { UrinaryBladderStudyProtocol } from "./studyes/urinaryBladderStudy";


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
  conclusion: "",
  recommendations: "",
};

export const defaultSoftTissueState: SoftTissueProtocol = {
  researchArea: "",
  description: "",
  conclusion: "",
  recommendations: "",
};

export const defaultObpState: ObpProtocol = {
  liver: null,
  gallbladder: null,
  pancreas: null,
  spleen: null,
  freeFluid: "",
  freeFluidDetails: "",
  conclusion: "",
  recommendations: "",
};

export const defaultKidneyStudyState: KidneyStudyProtocol = {
  rightKidney: null,
  leftKidney: null,
  urinaryBladder: null,
  conclusion: "",
  recommendations: "",
};

export const defaultOmtFemaleState: OmtFemaleProtocol = {
  uterus: null,
  leftOvary: null,
  rightOvary: null,
  urinaryBladder: null,
  conclusion: "",
  recommendations: "",
};

export const defaultOmtMaleState: OmtMaleProtocol = {
  prostate: null,
  urinaryBladder: null,
  conclusion: "",
  recommendations: "",
};

export const defaultBreastStudyState: BreastStudyProtocol = {
  breast: null,
  conclusion: "",
  recommendations: "",
};

export const defaultScrotumState: ScrotumProtocol = {
  testis: null,
  conclusion: "",
  recommendations: "",
};

export const defaultThyroidStudyState: ThyroidStudyProtocol = {
  thyroid: null,
  conclusion: "",
  recommendations: "",
};

export const defaultUrinaryBladderStudyState: UrinaryBladderStudyProtocol = {
  urinaryBladder: null,
  conclusion: "",
  recommendations: "",
};
