import type { BreastProtocol } from '../organs/breast';

export interface BreastStudyProtocol {
  breast: BreastProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface BreastStudyProps {
  value?: BreastStudyProtocol;
  onChange?: (value: BreastStudyProtocol) => void;
}
