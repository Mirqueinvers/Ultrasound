// c:/Projects/Ultrasound/Frontend/src/types/index.ts

export * from './organs/kidney';
export * from './organs/gallbladder';
export * from './organs/hepat';
export * from './organs/pancreas';
export * from './organs/spleen';
export * from './organs/urinarybladder';
export * from './defaultStates';
export * from './organs/ovary';
export * from './organs/uterus';
export type { OvaryCyst } from './organs/ovary';
export * from "./organs/prostate";
export * from "./organs/testis";
export * from "./organs/thyroid";
export * from "./organs/pleural";
export * from "./organs/breast";
export * from "./studyes/childDispensary";
export * from "./studyes/softTissue";
export * from "./studyes/obp";
export * from './studyes/kidneyStudy';
export * from './studyes/omtFemale';
export * from './studyes/omtMale';
export * from './studyes/breastStudy';
export * from './studyes/scrotum';
export * from './studyes/thyroidStudy';
export * from './studyes/pleuralStudy';
export * from './studyes/urinaryBladderStudy';
export * from "./interface/patient";

// ← Новые экспорты для BreastCommonProps и связанных типов
export type { 
  BreastProtocol, 
  BreastCommonProps, 
  BreastSideProtocol, 
  BreastSideProps,
  BreastSectionKey, 
  BreastNodeProps,
} from "./organs/breast";

export * from "./organs/lymphNodes";
export * from "./studyes/lymphNodesStudy";
export { defaultLymphNodesStudyState } from "./defaultStates/lymphNodesStudy";