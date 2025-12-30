// Frontend/src/types/thyroid.ts

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
