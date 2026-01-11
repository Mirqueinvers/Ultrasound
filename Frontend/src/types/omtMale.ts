import type { ProstateProtocol } from './prostate';
import type { UrinaryBladderProtocol } from './urinarybladder';

export interface OmtMaleProtocol {
  prostate: ProstateProtocol | null;
  urinaryBladder: UrinaryBladderProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface OmtMaleProps {
  value?: OmtMaleProtocol;
  onChange?: (value: OmtMaleProtocol) => void;
}
