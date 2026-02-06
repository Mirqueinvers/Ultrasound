// src/types/organs/pleural.ts
import type { SectionKey } from "@/components/common/OrgNavigation";

export interface PleuralFormation {
  number: number;
  size1: string;
  size2: string;
  echogenicity: string;
  location: string;
  mobility: string;
  vascularization: string;
  comment: string;
}

export interface PleuralSideProtocol {
  presence: string;
  amount: string;
  character: string;
  formationsList: PleuralFormation[];
}

export interface PleuralProtocol {
  rightSide: PleuralSideProtocol;
  leftSide: PleuralSideProtocol;
  pleuralThickening: string;
  pleuralCalcification: string;
  adhesions: string;
  pneumothorax: string;
  diaphragmMobility: string;
  additionalFindings: string;
}

export interface PleuralSideProps {
  side: "right" | "left";
  value?: PleuralSideProtocol;
  onChange?: (value: PleuralSideProtocol) => void;
}

export type PleuralSectionKey = Extract<
  SectionKey,
  | "Плевральная полость:правая"
  | "Плевральная полость:левая"
>;

export interface PleuralCommonProps {
  value?: PleuralProtocol;
  onChange?: (value: PleuralProtocol) => void;
  sectionRefs?: Record<
    PleuralSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

// Тип для компонента образования плевральной полости
export interface PleuralFormationProps {
  formation: PleuralFormation;
  onUpdate: (field: keyof PleuralFormation, value: string | number) => void;
  onRemove: () => void;
}