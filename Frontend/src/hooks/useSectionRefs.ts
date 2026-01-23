// Frontend/src/hooks/useSectionRefs.ts
import React from "react";
import type { SectionKey } from "@components/common/OrgNavigation";

export const useSectionRefs = () => {
  const sectionRefs = React.useRef<
    Record<SectionKey, React.RefObject<HTMLDivElement | null>>
  >({
    "ОБП:печень": React.createRef<HTMLDivElement>(),
    "ОБП:желчный": React.createRef<HTMLDivElement>(),
    "ОБП:поджелудочная": React.createRef<HTMLDivElement>(),
    "ОБП:селезёнка": React.createRef<HTMLDivElement>(),
    "Почки:правая": React.createRef<HTMLDivElement>(),
    "Почки:левая": React.createRef<HTMLDivElement>(),
    "Почки:мочевой пузырь": React.createRef<HTMLDivElement>(),
    "ОМТ (Ж):матка": React.createRef<HTMLDivElement>(),
    "ОМТ (Ж):правый яичник": React.createRef<HTMLDivElement>(),
    "ОМТ (Ж):левый яичник": React.createRef<HTMLDivElement>(),
    "ОМТ (Ж):мочевой пузырь": React.createRef<HTMLDivElement>(),
    "ОМТ (М):простата": React.createRef<HTMLDivElement>(),
    "ОМТ (М):мочевой пузырь": React.createRef<HTMLDivElement>(),
    "Щитовидная железа:правая доля": React.createRef<HTMLDivElement>(),
    "Щитовидная железа:левая доля": React.createRef<HTMLDivElement>(),
    "Молочные железы:правая железа": React.createRef<HTMLDivElement>(),
    "Молочные железы:левая железа": React.createRef<HTMLDivElement>(),
    "Органы мошонки:правое яичко": React.createRef<HTMLDivElement>(),
    "Органы мошонки:левое яичко": React.createRef<HTMLDivElement>(),
    "Мягкие ткани:основной блок": React.createRef<HTMLDivElement>(),
  });

  return sectionRefs;
};
