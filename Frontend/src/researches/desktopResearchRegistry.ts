import type { ComponentType } from "react";

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
} from "@components/researches";

export interface DesktopResearchRegistryItem {
  studyKey: string;
  title: string;
  component: ComponentType<any>;
  supportsSectionRefs?: boolean;
  aliases?: string[];
}

export const desktopResearchRegistry: DesktopResearchRegistryItem[] = [
  {
    studyKey: "Почки",
    title: "Почки",
    component: Kidney,
    supportsSectionRefs: true,
  },
  {
    studyKey: "ОБП",
    title: "ОБП",
    component: Obp,
    supportsSectionRefs: true,
  },
  {
    studyKey: "ОМТ (Ж)",
    title: "ОМТ (Ж)",
    component: OmtFemale,
    supportsSectionRefs: true,
  },
  {
    studyKey: "ОМТ (М)",
    title: "ОМТ (М)",
    component: OmtMale,
    supportsSectionRefs: true,
  },
  {
    studyKey: "Органы мошонки",
    title: "Органы мошонки",
    component: Scrotum,
    supportsSectionRefs: true,
  },
  {
    studyKey: "Щитовидная железа",
    title: "Щитовидная железа",
    component: Thyroid,
    supportsSectionRefs: true,
  },
  {
    studyKey: "Слюнные железы",
    title: "Слюнные железы",
    component: SalivaryGlands,
    supportsSectionRefs: true,
  },
  {
    studyKey: "БЦА",
    title: "БЦА",
    component: BrachioCephalicArteries,
    supportsSectionRefs: true,
  },
  {
    studyKey: "УВНК",
    title: "УВНК",
    component: LowerExtremityVeins,
    supportsSectionRefs: true,
  },
  {
    studyKey: "Плевральные полости",
    title: "Плевральные полости",
    component: Pleural,
    supportsSectionRefs: true,
  },
  {
    studyKey: "Молочные железы",
    title: "Молочные железы",
    component: Breast,
    supportsSectionRefs: true,
  },
  {
    studyKey: "Лимфоузлы",
    title: "Лимфоузлы",
    component: LymphNodes,
    supportsSectionRefs: true,
    aliases: ["Лимфатические узлы"],
  },
  {
    studyKey: "Детская диспансеризация",
    title: "Детская диспансеризация",
    component: ChildDispensary,
  },
  {
    studyKey: "Мягких тканей",
    title: "Мягких тканей",
    component: SoftTissue,
    supportsSectionRefs: true,
  },
  {
    studyKey: "Мочевой пузырь",
    title: "Мочевой пузырь",
    component: UrinaryBladderResearch,
  },
];

export const findDesktopResearchRegistryItem = (studyKey: string) =>
  desktopResearchRegistry.find(
    (item) => item.studyKey === studyKey || item.aliases?.includes(studyKey),
  );
