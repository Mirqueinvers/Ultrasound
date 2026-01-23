// src/types/defaultStates/organs/testis.ts
import type { TestisProtocol, SingleTestisProtocol } from "../../organs/testis";

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
