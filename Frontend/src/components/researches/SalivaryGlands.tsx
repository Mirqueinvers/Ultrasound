// src/components/researches/SalivaryGlands.tsx
import React, { useState, useEffect } from "react";
import SalivaryCommon from "@organs/SalivaryGlands/SalivaryCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
import type {
  SalivaryGlandsStudyProtocol,
  SalivaryGlandsStudyProps,
  SalivaryGlandsProtocol,
} from "@/types";
import { defaultSalivaryGlandsStudyState } from "@/types";
import type { SectionKey } from "@components/common/OrgNavigation";

type SalivarySectionKey = Extract<
  SectionKey,
  | "Слюнные железы:околоушная правая"
  | "Слюнные железы:околоушная левая"
  | "Слюнные железы:подчелюстная правая"
  | "Слюнные железы:подчелюстная левая"
  | "Слюнные железы:подъязычная правая"
  | "Слюнные железы:подъязычная левая"
>;

interface SalivaryWithSectionsProps extends SalivaryGlandsStudyProps {
  sectionRefs?: Record<
    SalivarySectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

export const SalivaryGlands: React.FC<SalivaryWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<SalivaryGlandsStudyProtocol>(
    value ?? defaultSalivaryGlandsStudyState
  );

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: SalivaryGlandsStudyProtocol) => {
    setForm(updated);
    setStudyData("Слюнные железы", updated);
    onChange?.(updated);
  };

  const updateSalivaryGlands = (salivaryData: SalivaryGlandsProtocol) => {
    sync({ ...form, salivaryGlands: salivaryData });
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
    showConclusionSamples("salivaryGlands");
    setCurrentOrgan("salivaryGlands");
  };

  // Обработчик события добавления текста образца заключения
  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId } = event.detail;
      
      // Проверяем, что событие относится к данному исследованию
      if (studyId !== 'study-salivaryGlands') return;
      
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
      setStudyData("Слюнные железы", updated);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
  }, [form, onChange, setStudyData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование слюнных желез
      </div>

      <SalivaryCommon
        value={form.salivaryGlands ?? undefined}
        onChange={updateSalivaryGlands}
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

export default SalivaryGlands;
