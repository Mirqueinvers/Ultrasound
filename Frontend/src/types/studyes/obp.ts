import type { LiverProtocol } from '../organs/hepat';
import type { GallbladderProtocol } from '../organs/gallbladder';
import type { PancreasProtocol } from '../organs/pancreas';
import type { SpleenProtocol } from '../organs/spleen';

export interface ObpProtocol {
  liver: LiverProtocol | null;
  gallbladder: GallbladderProtocol | null;
  pancreas: PancreasProtocol | null;
  spleen: SpleenProtocol | null;
  freeFluid?: string;
  freeFluidDetails?: string;
  conclusion: string;
  recommendations: string;
}

export interface ObpProps {
  value?: ObpProtocol;
  onChange?: (value: ObpProtocol) => void;
}
