// Frontend/src/types/childDispensary.ts
import type { LiverProtocol } from "./hepat";
import type { GallbladderProtocol } from "./gallbladder";
import type { PancreasProtocol } from "./pancreas";
import type { SpleenProtocol } from "./spleen";
import type { KidneyProtocol } from "./kidney";

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
