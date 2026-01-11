import type { UterusProtocol } from './uterus';
import type { OvaryProtocol } from './ovary';
import type { UrinaryBladderProtocol } from './urinarybladder';

export interface OmtFemaleProtocol {
  uterus: UterusProtocol | null;
  leftOvary: OvaryProtocol | null;
  rightOvary: OvaryProtocol | null;
  urinaryBladder: UrinaryBladderProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface OmtFemaleProps {
  value?: OmtFemaleProtocol;
  onChange?: (value: OmtFemaleProtocol) => void;
}
