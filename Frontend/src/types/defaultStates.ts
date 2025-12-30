// Frontend/src/types/defaultStates.ts

import type { KidneyProtocol } from './kidney';
import type { GallbladderProtocol } from './gallbladder';
import type { LiverProtocol } from './hepat';
import type { SpleenProtocol } from './spleen';
import type { PancreasProtocol } from './pancreas';
import type { UrinaryBladderProtocol } from './urinarybladder';
import type { OvaryProtocol } from './ovary';
import type { UterusProtocol } from './uterus';

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
  echostructure: "",
  echostructureText: "",
  follicles: "",
  folliclesList: [],
  dominantFollicle: "",
  formations: "",
  formationsText: "",
  additional: "",
  conclusion: "",
};

export const defaultUterusState: UterusProtocol = {
  length: "",
  width: "",
  apDimension: "",
  volume: "",
  shape: "",
  position: "",
  myometriumStructure: "",
  myometriumStructureText: "",
  endometriumSize: "",
  endometriumStructure: "",
  cervixSize: "",
  cervixEchostructure: "",
  cervixEchostructureText: "",
  cervicalCanal: "",
  additional: "",
  conclusion: "",
};
