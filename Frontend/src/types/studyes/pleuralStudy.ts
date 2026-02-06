// src/types/studyes/pleuralStudy.ts
import type { PleuralProtocol } from '../organs/pleural';

export interface PleuralStudyProtocol {
  pleural: PleuralProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface PleuralStudyProps {
  value?: PleuralStudyProtocol;
  onChange?: (value: PleuralStudyProtocol) => void;
}