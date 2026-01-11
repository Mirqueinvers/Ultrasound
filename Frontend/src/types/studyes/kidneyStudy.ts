import type { KidneyProtocol as KidneyCommonProtocol } from '../organs/kidney';
import type { UrinaryBladderProtocol } from '../organs/urinarybladder';

export interface KidneyStudyProtocol {
  rightKidney: KidneyCommonProtocol | null;
  leftKidney: KidneyCommonProtocol | null;
  urinaryBladder: UrinaryBladderProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface KidneyStudyProps {
  value?: KidneyStudyProtocol;
  onChange?: (value: KidneyStudyProtocol) => void;
}
