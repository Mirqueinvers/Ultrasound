// src/types/organs/thyroid.ts
export interface ThyroidNode {
  number: number;
  size1: string;
  size2: string;
  echogenicity: string;
  echostructure: string;
  contour: string;
  echogenicFoci: string;
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
  additional: string;
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

export type ThyroidSectionKey = string;

export interface ThyroidCommonProps {
  value?: ThyroidProtocol;
  onChange?: (value: ThyroidProtocol) => void;
  sectionRefs?: Record<string, React.RefObject<HTMLDivElement | null>>;
}

export interface ThyroidNodeProps {
  node: ThyroidNode;
  onUpdate: (field: keyof ThyroidNode, value: string | number) => void;
  onRemove: () => void;
}
