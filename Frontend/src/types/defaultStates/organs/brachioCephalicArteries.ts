// src/types/defaultStates/organs/brachioCephalicArteries.ts
import type {
  ArteryProtocol,
  BrachioCephalicProtocol,
} from "../../organs/brachioCephalicArteries";

export const defaultArteryState: ArteryProtocol = {
  vesselCourse: "прямолинейный",
  diameter: "",
  intimaMediaThickness: "",
  peakSystolicVelocity: "",
  endDiastolicVelocity: "",
  resistanceIndex: "",
  sinusFlow: "ламинарный",
  sinusIntimaMediaThickness: "не утолщен",
  sinusIntimaMediaThicknessValue: "",
  sinusPlaques: "не определяются",
  sinusPlaquesList: [],
  plaques: "не определяются",
  plaquesList: [],
  flowDirection: "антеградный",
  icaCcaRatio: "",
  additionalFindings: "",
};

export const defaultBrachioCephalicArteriesState: BrachioCephalicProtocol = {
  commonCarotidRight: { ...defaultArteryState },
  commonCarotidLeft: { ...defaultArteryState },
  internalCarotidRight: { ...defaultArteryState },
  internalCarotidLeft: { ...defaultArteryState },
  externalCarotidRight: { ...defaultArteryState },
  externalCarotidLeft: { ...defaultArteryState },
  vertebralRight: { ...defaultArteryState },
  vertebralLeft: { ...defaultArteryState },
  overallFindings: "",
};
