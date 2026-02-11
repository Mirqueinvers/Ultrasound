// src/types/defaultStates/organs/salivaryGlands.ts
import type {
  SalivaryGlandProtocol,
  SalivaryGlandsProtocol,
} from "../../organs/salivaryGlands";
import { defaultLymphNodeRegionState } from "../../organs/lymphNodes";

export const defaultSalivaryGlandState: SalivaryGlandProtocol = {
  length: "",
  width: "",
  depth: "",
  volume: "",
  contour: "четкий, ровный",
  echogenicity: "средняя",
  echostructure: "однородная",
  ducts: "не расширены",
  ductDiameter: "",
  bloodFlow: "не усилен",
  lymphNodes: { ...defaultLymphNodeRegionState, nodes: [] },
  volumeFormations: "не определяются",
  volumeFormationsDescription: "",
  formationsList: [],
  additionalFindings: "",
};

export const defaultSalivaryGlandsState: SalivaryGlandsProtocol = {
  parotidRight: { ...defaultSalivaryGlandState },
  parotidLeft: { ...defaultSalivaryGlandState },
  submandibularRight: { ...defaultSalivaryGlandState },
  submandibularLeft: { ...defaultSalivaryGlandState },
  sublingualRight: { ...defaultSalivaryGlandState },
  sublingualLeft: { ...defaultSalivaryGlandState },
};
