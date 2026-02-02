// src/types/organs/thyroid.ts (дополнить существующий файл)
import type { SectionKey } from "@/components/common/OrgNavigation";

export interface ThyroidNode {
  number: number;
  size1: string;
  size2: string;
  echogenicity: string;
  echostructure: string;
  contour: string;
  orientation: string;
  bloodFlow: string;
  comment: string;
  tiradsCategory?: string;
}

export interface ThyroidLobeProtocol {
  length: string;
  width: string;
  depth: string;
  volume: string;
  volumeFormations: string;
  nodesList: ThyroidNode[];
}

export interface ThyroidProtocol {
  rightLobe: ThyroidLobeProtocol;
  leftLobe: ThyroidLobeProtocol;
  isthmusSize: string;
  totalVolume: string;
  rightToLeftRatio: string;
  echogenicity: string;
  echostructure: string;
  contour: string;
  symmetry: string;
  position: string;
}

export interface ThyroidLobeProps {
  side: "left" | "right";
  value?: ThyroidLobeProtocol;
  onChange?: (value: ThyroidLobeProtocol) => void;
}

export type ThyroidSectionKey = Extract<
  SectionKey,
  | "Щитовидная железа:правая доля"
  | "Щитовидная железа:левая доля"
>;

export interface ThyroidCommonProps {
  value?: ThyroidProtocol;
  onChange?: (value: ThyroidProtocol) => void;
  sectionRefs?: Record<
    ThyroidSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

// ← НОВЫЙ ТИП ДЛЯ ThyroidNodeComponent
export interface ThyroidNodeProps {
  node: ThyroidNode;
  onUpdate: (field: keyof ThyroidNode, value: string | number) => void;
  onRemove: () => void;
}
