// src/types/organs/salivaryGlands.ts
import type { SectionKey } from "@/components/common/OrgNavigation";

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
  size: string;
  shape: string;
  contour: string;
  echogenicity: string;
  echostructure: string;
  vascularization: string;
  ductSystem: string;
  stones: string;
  formationsList: SalivaryGlandFormation[];
  additionalFindings: string;
}

export interface SalivaryGlandsProtocol {
  parotidRight: SalivaryGlandProtocol;
  parotidLeft: SalivaryGlandProtocol;
  submandibularRight: SalivaryGlandProtocol;
  submandibularLeft: SalivaryGlandProtocol;
  sublingual: string;
  lymphNodes: string;
  overallFindings: string;
}

export interface SalivaryGlandProps {
  gland: string;
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
  | "Слюнные железы:подъязычная"
>;

export interface SalivaryCommonProps {
  value?: SalivaryGlandsProtocol;
  onChange?: (value: SalivaryGlandsProtocol) => void;
  sectionRefs?: Record<
    SalivarySectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}