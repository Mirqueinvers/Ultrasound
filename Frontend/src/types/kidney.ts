// Frontend/src/types/kidney.ts

export interface Concrement {
  size: string;
  location: string;
}

export interface Cyst {
  size: string;
  location: string;
}

export interface KidneyProtocol {
  length: string;
  width: string;
  thickness: string;
  parenchymaSize: string;
  parenchymaEchogenicity: string;
  parenchymaStructure: string;
  parenchymaConcrements: string;
  parenchymaConcrementslist: Concrement[];
  parenchymaCysts: string;
  parenchymaCystslist: Cyst[];
  parenchymaMultipleCysts: boolean;
  parenchymaMultipleCystsSize: string;
  parenchymaPathologicalFormations: string;
  parenchymaPathologicalFormationsText: string;
  pcsSize: string;
  pcsMicroliths: string;
  pcsMicrolithsSize: string;
  pcsConcrements: string;
  pcsConcrementslist: Concrement[];
  pcsCysts: string;
  pcsCystslist: Cyst[];
  pcsMultipleCysts: boolean;
  pcsMultipleCystsSize: string;
  pcsPathologicalFormations: string;
  pcsPathologicalFormationsText: string;
  sinus: string;
  adrenalArea: string;
  adrenalAreaText: string;
  contour: string;
  additional: string;
}

export interface KidneyCommonProps {
  side: "left" | "right";
  value?: KidneyProtocol;
  onChange?: (value: KidneyProtocol) => void;
}
