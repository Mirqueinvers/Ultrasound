import type { ThyroidProtocol } from '../organs/thyroid';

export interface ThyroidStudyProtocol {
  thyroid: ThyroidProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface ThyroidStudyProps {
  value?: ThyroidStudyProtocol;
  onChange?: (value: ThyroidStudyProtocol) => void;
}
