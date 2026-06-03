// src/components/researches/LowerExtremityVeins.tsx
import React, { useState, useEffect } from "react";
import LowerExtremityVeinsCommon from "@organs/LowerExtremityVeins/LowerExtremityVeinsCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
import type {
  LowerExtremityVeinsStudyProtocol,
  LowerExtremityVeinsStudyProps,
  LowerExtremityVeinsProtocol,
} from "@/types";
import { defaultLowerExtremityVeinsStudyState } from "@/types";
import type { SectionKey } from "@components/common/OrgNavigation";

type LowerExtremityVeinsSectionKey = Extract<
  SectionKey,
  | "Вены НК:бедренная правая"
  | "Вены НК:бедренная левая"
  | "Вены НК:подколенная правая"
  | "Вены НК:подколенная левая"
  | "Вены НК:большеберцовая правая"
  | "Вены НК:большеберцовая левая"
  | "Вены НК:БПВ правая"
  | "Вены НК:БПВ левая"
  | "Вены НК:МПВ правая"
  | "Вены НК:МПВ левая"
>;

interface LowerExtremityVeinsWithSectionsProps extends LowerExtremityVeinsStudyProps {
  sectionRefs?: Record<
    LowerExtremityVeinsSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

export const LowerExtremityVeins: React.FC<LowerExtremityVeinsWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<LowerExtremityVeinsStudyProtocol>(
    value ?? defaultLowerExtremityVeinsStudyState
  );

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: LowerExtremityVeinsStudyProtocol) => {
    setForm(updated);
    setStudyData("УВНК", updated);
    onChange?.(updated);
  };

  const updateLowerExtremityVeins = (veinsData: LowerExtremityVeinsProtocol) => {
    sync({ ...form, lowerExtremityVeins: veinsData });
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
    showConclusionSamples("lowerExtremityVeins");
    setCurrentOrgan("lowerExtremityVeins");
  };

  // Обработчик события добавления текста образца заключения
  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId } = event.detail;
      
      // Проверяем, что событие относится к данному исследованию
      if (studyId !== 'study-lowerExtremityVeins') return;
      
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
      setStudyData("УВНК", updated);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
  }, [form, onChange, setStudyData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование вен нижних конечностей
      </div>

      <LowerExtremityVeinsCommon
        value={form.lowerExtremityVeins ?? undefined}
        onChange={updateLowerExtremityVeins}
        sectionRefs={sectionRefs}
      />

      <Conclusion
        value={{
          conclusion: form.conclusion,
          recommendations: form.recommendations,
        }}
        onChange={updateConclusion}
        onConclusionFocus={handleConclusionFocus}
      />
    </div>
  );
};

export default LowerExtremityVeins;