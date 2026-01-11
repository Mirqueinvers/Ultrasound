// Frontend/src/types/childDispensary.ts
import type { LiverProtocol } from "../organs/hepat";
import type { GallbladderProtocol } from "../organs/gallbladder";
import type { PancreasProtocol } from "../organs/pancreas";
import type { SpleenProtocol } from "../organs/spleen";
import type { KidneyProtocol } from "../organs/kidney";

export interface ChildDispensaryProtocol {
  liverStatus: string;
  liver: LiverProtocol | null;
  gallbladderStatus: string;
  gallbladder: GallbladderProtocol | null;
  pancreasStatus: string;
  pancreas: PancreasProtocol | null;
  spleenStatus: string;
  spleen: SpleenProtocol | null;
  kidneysStatus: string;
  rightKidney: KidneyProtocol | null;
  leftKidney: KidneyProtocol | null;
  conclusion: string;  // Добавить
  recommendations: string;  // Добавить
}

export interface ChildDispensaryProps {
  value?: ChildDispensaryProtocol;
  onChange?: (value: ChildDispensaryProtocol) => void;
}
