// Frontend/src/types/softTissue.ts

export interface SoftTissueProtocol {
  researchArea: string;
  description: string;
  conclusion: string;  // Добавить
  recommendations: string;  // Добавить
}

export interface SoftTissueProps {
  value?: SoftTissueProtocol;
  onChange?: (value: SoftTissueProtocol) => void;
}
