// src/types/defaultStates/organs/breast.ts
import type { BreastProtocol, BreastSideProtocol } from "../../organs/breast";

export const defaultBreastSideState: BreastSideProtocol = {
  skin: "не изменена",
  skinComment: "",
  nipples: "не изменены",
  nipplesComment: "",
  milkDucts: "не расширены",
  volumeFormations: "не определяются",
  nodesList: [],
};

export const defaultBreastState: BreastProtocol = {
  lastMenstruationDate: "",
  cycleDay: "",
  rightBreast: { ...defaultBreastSideState },
  leftBreast: { ...defaultBreastSideState },
  structure: "преимущественно жировая ткань",
};
