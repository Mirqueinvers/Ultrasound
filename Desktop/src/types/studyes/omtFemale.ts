import type { UterusProtocol } from '../organs/uterus';
import type { OvaryProtocol } from '../organs/ovary';
import type { UrinaryBladderProtocol } from '../organs/urinarybladder';

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
