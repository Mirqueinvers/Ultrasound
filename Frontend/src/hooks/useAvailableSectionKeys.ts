// Frontend/src/hooks/useAvailableSectionKeys.ts
import { useMemo } from "react";
import type { SectionKey } from "@components/common/OrgNavigation";

export const useAvailableSectionKeys = (
  selectedStudies: string[]
): SectionKey[] => {
  return useMemo(
    () =>
      selectedStudies.flatMap((study): SectionKey[] => {
        switch (study) {
          case "ОБП":
            return [
              "ОБП:печень",
              "ОБП:желчный",
              "ОБП:поджелудочная",
              "ОБП:селезёнка",
            ];
          case "Почки":
            return [
              "Почки:правая",
              "Почки:левая",
              "Почки:мочевой пузырь",
            ];
          case "ОМТ (Ж)":
            return [
              "ОМТ (Ж):матка",
              "ОМТ (Ж):правый яичник",
              "ОМТ (Ж):левый яичник",
              "ОМТ (Ж):мочевой пузырь",
            ];
          case "ОМТ (М)":
            return [
              "ОМТ (М):простата",
              "ОМТ (М):мочевой пузырь",
            ];
          case "Щитовидная железа":
            return [
              "Щитовидная железа:правая доля",
              "Щитовидная железа:левая доля",
            ];
          case "Молочные железы":
            return [
              "Молочные железы:правая железа",
              "Молочные железы:левая железа",
            ];
          case "Органы мошонки":
            return [
              "Органы мошонки:правое яичко",
              "Органы мошонки:левое яичко",
            ];
          case "Мягких тканей":
            return ["Мягкие ткани:основной блок"];
          default:
            return [];
        }
      }),
    [selectedStudies]
  );
};
