// src/components/researches/Obp.tsx
import React, { useState, useEffect } from "react";

import Hepat from "@organs/Hepat";
import Gallbladder from "@/components/organs/Gallbladder/Gallbladder";
import Pancreas from "@organs/Pancreas";
import Spleen from "@organs/Spleen";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { SelectWithTextarea } from "@/UI";

import type {
  ObpProtocol,
  ObpProps,
  LiverProtocol,
  GallbladderProtocol,
  PancreasProtocol,
  SpleenProtocol,
} from "@/types";
import { defaultObpState } from "@/types";

import type { SectionKey } from "@components/common/OrgNavigation";
import { useRightPanel } from "@contexts/RightPanelContext";

const FREE_FLUID_OPTIONS = [
  { value: "не определяется", label: "не определяется" },
  { value: "определяется", label: "определяется" },
];

interface ObpWithSectionsProps extends ObpProps {
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
}

export const Obp: React.FC<ObpWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<ObpProtocol>(value ?? defaultObpState);
  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: ObpProtocol) => {
    setForm(updated);
    setStudyData("ОБП", updated);
    onChange?.(updated);
  };

  const updateLiver = (liverData: LiverProtocol) => {
    sync({ ...form, liver: liverData });
  };

  const updateGallbladder = (gallbladderData: GallbladderProtocol) => {
    sync({ ...form, gallbladder: gallbladderData });
  };

  const updatePancreas = (pancreasData: PancreasProtocol) => {
    sync({ ...form, pancreas: pancreasData });
  };

  const updateSpleen = (spleenData: SpleenProtocol) => {
    sync({ ...form, spleen: spleenData });
  };

  const updateFreeFluidSelect = (val: string) => {
    sync({ ...form, freeFluid: val });
  };

  const updateFreeFluidDetails = (val: string) => {
    sync({ ...form, freeFluidDetails: val });
  };

  const updateConclusion = (conclusionData: {
    conclusion: string;
    recommendations: string;
  }) => {
    sync({
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    });
  };

  const handleConclusionFocus = () => {
    showConclusionSamples("obp");
    setCurrentOrgan("obp");
  };

  // Обработчик события добавления текста образца заключения
  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId } = event.detail;
      
      // Проверяем, что событие относится к данному исследованию
      if (studyId !== 'study-obp') return;
      
      const currentConclusion = form.conclusion?.trim() ?? "";
      const newConclusion = currentConclusion 
        ? `${currentConclusion} ${text}`
        : text;
      
      const updated = {
        ...form,
        conclusion: newConclusion,
        recommendations: form.recommendations ?? "",
      };
      setForm(updated);
      onChange?.(updated);
      setStudyData("ОБП", updated);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
  }, [form, onChange, setStudyData]);

  const handleConclusionBlur = () => {
    // если нужно скрывать панель после выхода из поля, раскомментируй
    // hidePanel();
  };



  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов брюшной полости
      </div>

      <div ref={sectionRefs?.["ОБП:печень"]}>
        <Hepat value={form.liver ?? undefined} onChange={updateLiver} />
      </div>

      <div ref={sectionRefs?.["ОБП:желчный"]}>
        <Gallbladder
          value={form.gallbladder ?? undefined}
          onChange={updateGallbladder}
        />
      </div>

      <div ref={sectionRefs?.["ОБП:поджелудочная"]}>
        <Pancreas
          value={form.pancreas ?? undefined}
          onChange={updatePancreas}
        />
      </div>

      <div ref={sectionRefs?.["ОБП:селезёнка"]}>
        <Spleen value={form.spleen ?? undefined} onChange={updateSpleen} />
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-lg px-6 py-4">
        <SelectWithTextarea
          label="Свободная жидкость в брюшной полости"
          selectValue={form.freeFluid ?? ""}
          textareaValue={form.freeFluidDetails ?? ""}
          onSelectChange={updateFreeFluidSelect}
          onTextareaChange={updateFreeFluidDetails}
          options={FREE_FLUID_OPTIONS}
          triggerValue="определяется"
          textareaLabel="Описание свободной жидкости"
          rows={3}
        />
      </div>

      <Conclusion
        value={{
          conclusion: form.conclusion,
          recommendations: form.recommendations,
        }}
        onChange={updateConclusion}
        onConclusionFocus={handleConclusionFocus}
        onConclusionBlur={handleConclusionBlur}
      />
    </div>
  );
};

export default Obp;
