// src/types/defaultStates/organs/salivaryGlands.ts
import type { SalivaryGlandProtocol, SalivaryGlandsProtocol } from "../../organs/salivaryGlands";

export const defaultSalivaryGlandState: SalivaryGlandProtocol = {
  size: "обычных размеров",
  shape: "обычной формы",
  contour: "ровный, четкий",
  echogenicity: "обычная",
  echostructure: "однородная",
  vascularization: "обычная",
  ductSystem: "не расширен",
  stones: "не определяются",
  formationsList: [],
  additionalFindings: "",
};

export const defaultSalivaryGlandsState: SalivaryGlandsProtocol = {
  parotidRight: { ...defaultSalivaryGlandState },
  parotidLeft: { ...defaultSalivaryGlandState },
  submandibularRight: { ...defaultSalivaryGlandState },
  submandibularLeft: { ...defaultSalivaryGlandState },
  sublingual: "обычных размеров, обычной структуры",
  lymphNodes: "не увеличены",
  overallFindings: "",
};