import type { UrinaryBladderProtocol } from '../organs/urinarybladder';

export interface UrinaryBladderStudyProtocol {
  urinaryBladder: UrinaryBladderProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface UrinaryBladderStudyProps {
  value?: UrinaryBladderStudyProtocol;
  onChange?: (value: UrinaryBladderStudyProtocol) => void;
}
