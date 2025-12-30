// Frontend/src/types/softTissue.ts

export interface SoftTissueProtocol {
  researchArea: string;
  description: string;
}

export interface SoftTissueProps {
  value?: SoftTissueProtocol;
  onChange?: (value: SoftTissueProtocol) => void;
}
