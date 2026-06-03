// src/types/studyes/salivaryGlandsStudy.ts
import type { SalivaryGlandsProtocol } from '../organs/salivaryGlands';

export interface SalivaryGlandsStudyProtocol {
  salivaryGlands: SalivaryGlandsProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface SalivaryGlandsStudyProps {
  value?: SalivaryGlandsStudyProtocol;
  onChange?: (value: SalivaryGlandsStudyProtocol) => void;
}