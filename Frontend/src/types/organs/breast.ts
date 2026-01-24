// c:/Projects/Ultrasound/Frontend/src/types/breast.ts

import type { SectionKey } from "@/components/common/OrgNavigation";

export interface BreastNode {
  number: number;
  size1: string;
  size2: string;
  depth: string;
  direction: string;
  echogenicity: string;
  echostructure: string;
  contour: string;
  orientation: string;
  bloodFlow: string;
  comment: string;
}

export interface BreastSideProtocol {
  skin: string;
  skinComment: string;
  nipples: string;
  nipplesComment: string;
  milkDucts: string;
  volumeFormations: string;
  nodesList: BreastNode[];
}

export interface BreastProtocol {
  lastMenstruationDate: string;
  cycleDay: string;
  rightBreast: BreastSideProtocol;
  leftBreast: BreastSideProtocol;
  structure: string;
}

export type BreastSectionKey = Extract<
  SectionKey,
  | "Молочные железы:правая железа"
  | "Молочные железы:левая железа"
>;

export interface BreastCommonProps {
  value?: BreastProtocol;
  onChange?: (value: BreastProtocol) => void;
  sectionRefs?: Record<BreastSectionKey, React.RefObject<HTMLDivElement | null>>;
}

export interface BreastSideProps {
  side: "left" | "right";
  value?: BreastSideProtocol;
  onChange?: (value: BreastSideProtocol) => void;
}

export interface BreastNodeProps {  
  node: BreastNode;
  onUpdate: (field: keyof BreastNode, value: string) => void;
  onRemove: () => void;
  onAdd?: () => void;
  isLast?: boolean;
}