// src/types/organs/lowerExtremityVeins.ts
import type { SectionKey } from "@/components/common/OrgNavigation";

export interface VenousThrombus {
  number: number;
  size: string;
  location: string;
  type: string;
  age: string;
  comment: string;
}

export interface VenousValve {
  insufficiency: string;
  reflux: string;
  duration: string;
  comment: string;
}

export interface DeepVeinProtocol {
  diameter: string;
  compressibility: string;
  wall: string;
  lumen: string;
  valves: VenousValve;
  flow: string;
  respiratoryPhasing: string;
  thrombus: VenousThrombus | null;
  additionalFindings: string;
}

export interface SuperficialVeinProtocol {
  diameter: string;
  wall: string;
  lumen: string;
  valves: VenousValve;
  flow: string;
  perforators: string;
  thrombosis: VenousThrombus | null;
  additionalFindings: string;
}

export interface PerforatorProtocol {
  location: string;
  diameter: string;
  flow: string;
  insufficiency: string;
  comment: string;
}

export interface LowerExtremityVeinsProtocol {
  rightDeepVeins: {
    femoral: DeepVeinProtocol;
    popliteal: DeepVeinProtocol;
    posteriorTibial: DeepVeinProtocol;
    anteriorTibial: DeepVeinProtocol;
  };
  leftDeepVeins: {
    femoral: DeepVeinProtocol;
    popliteal: DeepVeinProtocol;
    posteriorTibial: DeepVeinProtocol;
    anteriorTibial: DeepVeinProtocol;
  };
  rightSuperficialVeins: {
    greatSaphenous: SuperficialVeinProtocol;
    smallSaphenous: SuperficialVeinProtocol;
  };
  leftSuperficialVeins: {
    greatSaphenous: SuperficialVeinProtocol;
    smallSaphenous: SuperficialVeinProtocol;
  };
  perforators: {
    rightCalf: PerforatorProtocol[];
    leftCalf: PerforatorProtocol[];
    rightThigh: PerforatorProtocol[];
    leftThigh: PerforatorProtocol[];
  };
  overallFindings: string;
}

export interface DeepVeinProps {
  vein: string;
  side: "right" | "left";
  value?: DeepVeinProtocol;
  onChange?: (value: DeepVeinProtocol) => void;
}

export interface SuperficialVeinProps {
  vein: string;
  side: "right" | "left";
  value?: SuperficialVeinProtocol;
  onChange?: (value: SuperficialVeinProtocol) => void;
}

export interface PerforatorProps {
  perforator: PerforatorProtocol;
  onUpdate: (field: keyof PerforatorProtocol, value: string) => void;
  onRemove: () => void;
}

export type LowerExtremityVeinsSectionKey = Extract<
  SectionKey,
  | "Вены НК:бедренная правая"
  | "Вены НК:бедренная левая"
  | "Вены НК:подколенная правая"
  | "Вены НК:подколенная левая"
  | "Вены НК:большеберцовая правая"
  | "Вены НК:большеберцовая левая"
  | "Вены НК:БПВ правая"
  | "Вены НК:БПВ левая"
  | "Вены НК:МПВ правая"
  | "Вены НК:МПВ левая"
>;

export interface LowerExtremityVeinsCommonProps {
  value?: LowerExtremityVeinsProtocol;
  onChange?: (value: LowerExtremityVeinsProtocol) => void;
  sectionRefs?: Record<
    LowerExtremityVeinsSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}