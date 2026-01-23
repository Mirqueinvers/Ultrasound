// src/types/defaultStates/organs/thyroid.ts
import type { ThyroidProtocol, ThyroidLobeProtocol } from "../../organs/thyroid";

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
