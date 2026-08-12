import type { ComponentType } from "react";

import { STUDY_KEYS } from "@/domain/studyKeys";

import {
  Obp,
  Kidney,
  OmtFemale,
  OmtMale,
  Scrotum,
  Thyroid,
  SalivaryGlands,
  BrachioCephalicArteries,
  LowerExtremityVeins,
  Pleural,
  Breast,
  ChildDispensary,
  SoftTissue,
  UrinaryBladderResearch,
  LymphNodes,
} from "@/features/research";

export interface DesktopResearchRegistryItem {
  studyKey: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- динамический реестр: каждый компонент принимает свои типизированные props
  component: ComponentType<any>;
  supportsSectionRefs?: boolean;
  aliases?: string[];
}

export const desktopResearchRegistry: DesktopResearchRegistryItem[] = [
  {
    studyKey: STUDY_KEYS.KIDNEYS,
    title: "Почки",
    component: Kidney,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.OBP,
    title: "ОБП",
    component: Obp,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.OMT_FEMALE,
    title: "ОМТ (Ж)",
    component: OmtFemale,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.OMT_MALE,
    title: "ОМТ (М)",
    component: OmtMale,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.SCROTUM,
    title: "Органы мошонки",
    component: Scrotum,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.THYROID,
    title: "Щитовидная железа",
    component: Thyroid,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.SALIVARY_GLANDS,
    title: "Слюнные железы",
    component: SalivaryGlands,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.BCA,
    title: "БЦА",
    component: BrachioCephalicArteries,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.LOWER_EXTREMITY_VEINS,
    title: "УВНК",
    component: LowerExtremityVeins,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.PLEURAL,
    title: "Плевральные полости",
    component: Pleural,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.BREAST,
    title: "Молочные железы",
    component: Breast,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.LYMPH_NODES,
    title: "Лимфоузлы",
    component: LymphNodes,
    supportsSectionRefs: true,
    aliases: [STUDY_KEYS.LYMPH_NODES_ALT],
  },
  {
    studyKey: STUDY_KEYS.CHILD_DISPENSARY,
    title: "Детская диспансеризация",
    component: ChildDispensary,
  },
  {
    studyKey: STUDY_KEYS.SOFT_TISSUE,
    title: "Мягких тканей",
    component: SoftTissue,
    supportsSectionRefs: true,
  },
  {
    studyKey: STUDY_KEYS.URINARY_BLADDER,
    title: "Мочевой пузырь",
    component: UrinaryBladderResearch,
  },
];

export const findDesktopResearchRegistryItem = (studyKey: string) =>
  desktopResearchRegistry.find(
    (item) => item.studyKey === studyKey || item.aliases?.includes(studyKey),
  );
