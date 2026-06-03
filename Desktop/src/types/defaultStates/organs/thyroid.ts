// src/types/defaultStates/organs/thyroid.ts
import type { ThyroidProtocol, ThyroidLobeProtocol } from "../../organs/thyroid";

export const defaultThyroidLobeState: ThyroidLobeProtocol = {
  length: "",
  width: "",
  depth: "",
  volume: "",
  volumeFormations: "\u043d\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u044e\u0442\u0441\u044f",
  additional: "",
  nodesList: [],
};

export const defaultThyroidState: ThyroidProtocol = {
  rightLobe: { ...defaultThyroidLobeState },
  leftLobe: { ...defaultThyroidLobeState },
  isthmusSize: "",
  totalVolume: "",
  rightToLeftRatio: "",
  echogenicity: "",
  echostructure: "",
  contour: "",
  symmetry: "",
  position: "",
};
