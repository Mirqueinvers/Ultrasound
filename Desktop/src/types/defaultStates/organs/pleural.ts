// src/types/defaultStates/organs/pleural.ts
import type { PleuralProtocol, PleuralSideProtocol } from "../../organs/pleural";

export const defaultPleuralSideState: PleuralSideProtocol = {
  presence: "не определяется",
  volumeMethods: [],
  sittingBasalDistance: "",
  sittingMaxHeight: "",
  lyingMaxDistance: "",
  volumeSitting: "",
  volumeLying: "",
  volumeEstimated: "",
  content: "",
};

export const defaultPleuralState: PleuralProtocol = {
  rightSide: { ...defaultPleuralSideState },
  leftSide: { ...defaultPleuralSideState },
};
