// src/types/organs/brachioCephalicArteries.ts
import type { SectionKey } from "@/components/common/OrgNavigation";

export interface BrachioCephalicFormation {
  number: number;
  localizationSegment: string;
  wall: string;
  thickness: string;
  length: string;
  echostructure: string;
  surface: string;
  vesselWidthNormal: string;
  vesselWidthStenosis: string;
  stenosisDegree: string;
  velocityProximal: string;
  velocityStenosis: string;
  velocityDistal: string;
}

export interface ArteryProtocol {
  vesselCourse: string;
  flowType: string;
  diameter: string;
  intimaMediaThickness: string;
  intimaMediaThicknessValue: string;
  peakSystolicVelocity: string;
  endDiastolicVelocity: string;
  resistanceIndex: string;
  sinusFlow: string;
  sinusIntimaMediaThickness: string;
  sinusIntimaMediaThicknessValue: string;
  sinusPlaques: string;
  sinusPlaquesList: BrachioCephalicFormation[];
  plaques: string;
  plaquesList: BrachioCephalicFormation[];
  flowDirection: string;
  icaCcaRatio: string;
  additionalFindings: string;
}

export interface BrachioCephalicProtocol {
  brachiocephalicTrunkRight: ArteryProtocol;
  brachiocephalicTrunkLeft: ArteryProtocol;
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
  mode?: "main" | "sinus";
  sinusTitle?: string;
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
