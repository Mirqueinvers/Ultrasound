export type TestisLocation = "в мошонке" | "не в мошонке" | "";
export type TestisContour = "четкий ровный" | "четкий не ровный" | "не четкий" | "";
export type TestisCapsule = "не изменена" | "изменена" | "";
export type TestisEchogenicity = "средняя" | "повышена" | "понижена" | "";
export type TestisEchotexture =
  | "однородная"
  | "неоднородная"
  | "диффузно-неоднородная"
  | "";
export type TestisMediastinum = "не изменена" | "изменена" | "";
export type TestisBloodFlow = "не изменен" | "усилен" | "ослаблен" | "";
export type TestisAppendage = "не изменен" | "изменен" | "";
export type TestisFluidAmount = "не изменено" | "увеличено" | "";

export interface SingleTestisProtocol {
  length: string;
  width: string;
  depth: string;
  volume: string;

  location: TestisLocation;
  contour: TestisContour;

  capsule: TestisCapsule;
  capsuleText: string;

  echogenicity: TestisEchogenicity;
  echotexture: TestisEchotexture;
  echotextureText: string;

  mediastinum: TestisMediastinum;
  mediastinumText: string;

  bloodFlow: TestisBloodFlow;

  appendage: TestisAppendage;
  appendageText: string;

  fluidAmount: TestisFluidAmount;
  fluidAmountText: string;

  additional: string;
  conclusion: string;
}

export interface TestisProtocol {
  rightTestis: SingleTestisProtocol | null;
  leftTestis: SingleTestisProtocol | null;
}

export interface TestisProps {
  value?: TestisProtocol;
  onChange?: (value: TestisProtocol) => void;
}