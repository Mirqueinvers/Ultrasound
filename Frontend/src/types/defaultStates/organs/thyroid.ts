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
  echogenicity: "\u0441\u0440\u0435\u0434\u043d\u044f\u044f",
  echostructure: "\u043e\u0434\u043d\u043e\u0440\u043e\u0434\u043d\u0430\u044f",
  contour: "\u0447\u0435\u0442\u043a\u0438\u0439 \u0440\u043e\u0432\u043d\u044b\u0439",
  symmetry: "\u0441\u043e\u0445\u0440\u0430\u043d\u0435\u043d\u0430",
  position: "\u043e\u0431\u044b\u0447\u043d\u043e\u0435",
};
