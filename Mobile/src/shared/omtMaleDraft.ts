import {
  createEmptyUrinaryBladderDraft,
  type UrinaryBladderDraft,
} from "./omtFemaleDraft";

export interface ProstateDraft {
  studyType: string;
  position: string;
  length: string;
  width: string;
  apDimension: string;
  volume: string;
  contour: string;
  symmetry: string;
  shape: string;
  echogenicity: string;
  echotexture: string;
  echotextureText: string;
  bladderProtrusion: string;
  bladderProtrusionMm: string;
  pathologicLesions: string;
  pathologicLesionsText: string;
  additional: string;
}

export interface OmtMaleDraft {
  prostate: ProstateDraft;
  urinaryBladder: UrinaryBladderDraft;
  conclusion: string;
  recommendations: string;
}

export function createEmptyProstateDraft(): ProstateDraft {
  return {
    studyType: "",
    position: "",
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
  };
}

export function createEmptyOmtMaleDraft(): OmtMaleDraft {
  return {
    prostate: createEmptyProstateDraft(),
    urinaryBladder: createEmptyUrinaryBladderDraft(),
    conclusion: "",
    recommendations: "",
  };
}
