// src/types/studyes/brachioCephalicArteriesStudy.ts
import type { BrachioCephalicProtocol } from '../organs/brachioCephalicArteries';

export interface BrachioCephalicArteriesStudyProtocol {
  brachioCephalicArteries: BrachioCephalicProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface BrachioCephalicArteriesStudyProps {
  value?: BrachioCephalicArteriesStudyProtocol;
  onChange?: (value: BrachioCephalicArteriesStudyProtocol) => void;
}