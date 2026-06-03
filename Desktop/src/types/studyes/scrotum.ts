import type { TestisProtocol } from '../organs/testis';

export interface ScrotumProtocol {
  testis: TestisProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface ScrotumProps {
  value?: ScrotumProtocol;
  onChange?: (value: ScrotumProtocol) => void;
}
