import type { LiverProtocol } from './hepat';
import type { GallbladderProtocol } from './gallbladder';
import type { PancreasProtocol } from './pancreas';
import type { SpleenProtocol } from './spleen';

export interface ObpProtocol {
  liver: LiverProtocol | null;
  gallbladder: GallbladderProtocol | null;
  pancreas: PancreasProtocol | null;
  spleen: SpleenProtocol | null;
  conclusion: string;
  recommendations: string;
}

export interface ObpProps {
  value?: ObpProtocol;
  onChange?: (value: ObpProtocol) => void;
}
