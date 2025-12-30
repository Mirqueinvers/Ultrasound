// Frontend/src/types/breast.ts

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
  structure: string; // Добавлено новое поле
}

export interface BreastSideProps {
  side: "left" | "right";
  value?: BreastSideProtocol;
  onChange?: (value: BreastSideProtocol) => void;
}
