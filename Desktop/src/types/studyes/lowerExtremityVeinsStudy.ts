// src/types/studyes/lowerExtremityVeinsStudy.ts
import type { LowerExtremityVeinsProtocol } from '../organs/lowerExtremityVeins';

export interface LowerExtremityVeinsStudyProtocol {
  lowerExtremityVeins: LowerExtremityVeinsProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface LowerExtremityVeinsStudyProps {
  value?: LowerExtremityVeinsStudyProtocol;
  onChange?: (value: LowerExtremityVeinsStudyProtocol) => void;
}