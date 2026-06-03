// src/types/defaultStates/studyes/obp.ts
import type { ObpProtocol } from "../../studyes/obp";

export const defaultObpState: ObpProtocol = {
  liver: null,
  gallbladder: null,
  pancreas: null,
  spleen: null,
  freeFluid: "",
  freeFluidDetails: "",
  conclusion: "",
  recommendations: "",
};
