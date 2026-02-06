// src/types/organs/brachioCephalicArteries.ts
import type { SectionKey } from "@/components/common/OrgNavigation";

export interface BrachioCephalicFormation {
  number: number;
  size: string;
  location: string;
  type: string;
  stenosis: string;
  comment: string;
}

export interface ArteryProtocol {
  diameter: string;
  wallThickness: string;
  intimaMediaThickness: string;
  bloodFlowVelocity: string;
  resistanceIndex: string;
  pulsatilityIndex: string;
  stenosis: string;
  occlusion: string;
  plaquesList: BrachioCephalicFormation[];
  additionalFindings: string;
}

export interface BrachioCephalicProtocol {
  commonCarotidRight: ArteryProtocol;
  commonCarotidLeft: ArteryProtocol;
  internalCarotidRight: ArteryProtocol;
  internalCarotidLeft: ArteryProtocol;
  externalCarotidRight: ArteryProtocol;
  externalCarotidLeft: ArteryProtocol;
  vertebralRight: ArteryProtocol;
  vertebralLeft: ArteryProtocol;
  subclavianRight: ArteryProtocol;
  subclavianLeft: ArteryProtocol;
  overallFindings: string;
}

export interface ArteryProps {
  artery: string;
  value?: ArteryProtocol;
  onChange?: (value: ArteryProtocol) => void;
}

export interface BrachioCephalicFormationProps {
  formation: BrachioCephalicFormation;
  onUpdate: (field: keyof BrachioCephalicFormation, value: string | number) => void;
  onRemove: () => void;
}

export type BrachioCephalicSectionKey = Extract<
  SectionKey,
  | "БЦА:ОСА правая"
  | "БЦА:ОСА левая"
  | "БЦА:ВСА правая"
  | "БЦА:ВСА левая"
  | "БЦА:НСА правая"
  | "БЦА:НСА левая"
  | "БЦА:позвоночная правая"
  | "БЦА:позвоночная левая"
  | "БЦА:подключичная правая"
  | "БЦА:подключичная левая"
>;

export interface BrachioCephalicCommonProps {
  value?: BrachioCephalicProtocol;
  onChange?: (value: BrachioCephalicProtocol) => void;
  sectionRefs?: Record<
    BrachioCephalicSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}