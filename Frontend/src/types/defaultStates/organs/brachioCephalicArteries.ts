// src/types/defaultStates/organs/brachioCephalicArteries.ts
import type { ArteryProtocol, BrachioCephalicProtocol } from "../../organs/brachioCephalicArteries";

export const defaultArteryState: ArteryProtocol = {
  diameter: "обычного диаметра",
  wallThickness: "обычная",
  intimaMediaThickness: "в пределах нормы",
  bloodFlowVelocity: "в пределах нормы",
  resistanceIndex: "в пределах нормы",
  pulsatilityIndex: "в пределах нормы",
  stenosis: "не определяется",
  occlusion: "не определяется",
  plaquesList: [],
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
  subclavianRight: { ...defaultArteryState },
  subclavianLeft: { ...defaultArteryState },
  overallFindings: "",
};