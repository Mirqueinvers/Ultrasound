// src/types/organs/salivaryGlands.ts
import type { SectionKey } from "@/components/common/OrgNavigation";
import type { LymphNodeRegionProtocol } from "./lymphNodes";

export interface SalivaryGlandFormation {
  number: number;
  size1: string;
  size2: string;
  size3: string;
  echogenicity: string;
  location: string;
  shape: string;
  contour: string;
  vascularization: string;
  comment: string;
}

export interface SalivaryGlandProtocol {
  length: string;
  width: string;
  depth: string;
  volume: string;
  contour: string;
  echogenicity: string;
  echostructure: string;
  ducts: string;
  ductDiameter: string;
  bloodFlow: string;
  lymphNodes: LymphNodeRegionProtocol;
  volumeFormations: string;
  volumeFormationsDescription: string;
  formationsList: SalivaryGlandFormation[];
  additionalFindings: string;
}

export interface SalivaryGlandsProtocol {
  parotidRight: SalivaryGlandProtocol;
  parotidLeft: SalivaryGlandProtocol;
  submandibularRight: SalivaryGlandProtocol;
  submandibularLeft: SalivaryGlandProtocol;
  sublingualRight: SalivaryGlandProtocol;
  sublingualLeft: SalivaryGlandProtocol;
}

export interface SalivaryGlandProps {
  gland: string;
  showDepth?: boolean;
  value?: SalivaryGlandProtocol;
  onChange?: (value: SalivaryGlandProtocol) => void;
}

export interface SalivaryGlandFormationProps {
  formation: SalivaryGlandFormation;
  onUpdate: (field: keyof SalivaryGlandFormation, value: string | number) => void;
  onRemove: () => void;
}

export type SalivarySectionKey = Extract<
  SectionKey,
  | "Слюнные железы:околоушная правая"
  | "Слюнные железы:околоушная левая"
  | "Слюнные железы:подчелюстная правая"
  | "Слюнные железы:подчелюстная левая"
  | "Слюнные железы:подъязычная правая"
  | "Слюнные железы:подъязычная левая"
>;

export interface SalivaryCommonProps {
  value?: SalivaryGlandsProtocol;
  onChange?: (value: SalivaryGlandsProtocol) => void;
  sectionRefs?: Record<
    SalivarySectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}
