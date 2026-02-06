// src/types/defaultStates/organs/pleural.ts
import type { PleuralProtocol, PleuralSideProtocol } from "../../organs/pleural";

export const defaultPleuralSideState: PleuralSideProtocol = {
  presence: "отсутствует",
  amount: "",
  character: "",
  formationsList: [],
};

export const defaultPleuralState: PleuralProtocol = {
  rightSide: { ...defaultPleuralSideState },
  leftSide: { ...defaultPleuralSideState },
  pleuralThickening: "не определяется",
  pleuralCalcification: "не определяется",
  adhesions: "не определяются",
  pneumothorax: "не определяется",
  diaphragmMobility: "сохранена",
  additionalFindings: "",
};