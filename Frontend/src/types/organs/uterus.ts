export interface UterusNode {
  number: number;
  wallLocation: string;
  layerType: string;
  size1: string;
  size2: string;
  contourClarity: string;
  contourEvenness: string;
  echogenicity: string;
  structure: string;
  cavityImpact: string;
  bloodFlow: string;
  comment: string;
}

export interface UterusProtocol {
  uterusStatus: string;
  studyType: string;
  lastMenstruationDate: string;
  cycleDay: string;
  menopause: string;
  length: string;
  width: string;
  apDimension: string;
  volume: string;
  shape: string;
  position: string;
  myometriumStructure: string;
  myometriumStructureText: string;
  myometriumEchogenicity: string;
  myomaNodesPresence: string;
  myomaNodesList: UterusNode[];
  uterineCavity: string;
  uterineCavityText: string;
  endometriumSize: string;
  endometriumStructure: string;
  cervixSize: string;
  cervixEchostructure: string;
  cervixEchostructureText: string;
  cervicalCanal: string;
  cervicalCanalText: string;
  freeFluid: string;
  freeFluidText: string;
  additional: string;
  conclusion: string;
}

export interface UterusProps {
  value?: UterusProtocol;
  onChange?: (value: UterusProtocol) => void;
}

export interface UterusNodeProps {
  node: UterusNode;
  onUpdate: (field: keyof UterusNode, value: string | number) => void;
  onRemove: () => void;
}
