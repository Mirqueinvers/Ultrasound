// src/types/defaultStates/organs/lowerExtremityVeins.ts
import type { 
  DeepVeinProtocol, 
  SuperficialVeinProtocol, 
  LowerExtremityVeinsProtocol,
  VenousValve,
  VenousThrombus
} from "../../organs/lowerExtremityVeins";

export const defaultVenousValve: VenousValve = {
  insufficiency: "не определяется",
  reflux: "не определяется",
  duration: "",
  comment: "",
};

export const defaultVenousThrombus: VenousThrombus = {
  number: 1,
  size: "",
  location: "",
  type: "",
  age: "",
  comment: "",
};

export const defaultDeepVeinState: DeepVeinProtocol = {
  diameter: "обычный",
  compressibility: "полная",
  wall: "обычная",
  lumen: "свободен",
  valves: { ...defaultVenousValve },
  flow: "сохранен",
  respiratoryPhasing: "сохранена",
  thrombus: null,
  additionalFindings: "",
};

export const defaultSuperficialVeinState: SuperficialVeinProtocol = {
  diameter: "обычный",
  wall: "обычная",
  lumen: "свободен",
  valves: { ...defaultVenousValve },
  flow: "сохранен",
  perforators: "не изменены",
  thrombosis: null,
  additionalFindings: "",
};

export const defaultLowerExtremityVeinsState: LowerExtremityVeinsProtocol = {
  rightDeepVeins: {
    femoral: { ...defaultDeepVeinState },
    popliteal: { ...defaultDeepVeinState },
    posteriorTibial: { ...defaultDeepVeinState },
    anteriorTibial: { ...defaultDeepVeinState },
  },
  leftDeepVeins: {
    femoral: { ...defaultDeepVeinState },
    popliteal: { ...defaultDeepVeinState },
    posteriorTibial: { ...defaultDeepVeinState },
    anteriorTibial: { ...defaultDeepVeinState },
  },
  rightSuperficialVeins: {
    greatSaphenous: { ...defaultSuperficialVeinState },
    smallSaphenous: { ...defaultSuperficialVeinState },
  },
  leftSuperficialVeins: {
    greatSaphenous: { ...defaultSuperficialVeinState },
    smallSaphenous: { ...defaultSuperficialVeinState },
  },
  perforators: {
    rightCalf: [],
    leftCalf: [],
    rightThigh: [],
    leftThigh: [],
  },
  overallFindings: "",
};