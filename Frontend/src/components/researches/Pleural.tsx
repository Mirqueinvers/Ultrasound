// Frontend/src/components/researches/Pleural.tsx
import React, { useState, useEffect } from "react";
import PleuralCommon from "@organs/Pleural/PleuralCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
import type {
  PleuralStudyProtocol,
  PleuralStudyProps,
  PleuralProtocol,
} from "@/types";
import { defaultPleuralStudyState } from "@/types";
import type { SectionKey } from "@components/common/OrgNavigation";

type PleuralSectionKey = Extract<
  SectionKey,
  | "Плевральная полость:правая"
  | "Плевральная полость:левая"
>;

interface PleuralWithSectionsProps extends PleuralStudyProps {
  sectionRefs?: Record<
    PleuralSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

export const Pleural: React.FC<PleuralWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<PleuralStudyProtocol>(
    value ?? defaultPleuralStudyState
  );

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: PleuralStudyProtocol) => {
    setForm(updated);
    setStudyData("Плевральные полости", updated);
    onChange?.(updated);
  };

  const updatePleural = (pleuralData: PleuralProtocol) => {
    sync({ ...form, pleural: pleuralData });
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
    showConclusionSamples("pleural");
    setCurrentOrgan("pleural");
  };

  // Обработчик события добавления текста образца заключения
  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId } = event.detail;
      
      // Проверяем, что событие относится к данному исследованию
      if (studyId !== 'study-pleural') return;
      
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
      setStudyData("Плевральные полости", updated);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
  }, [form, onChange, setStudyData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование плевральных полостей
      </div>

      <PleuralCommon
        value={form.pleural ?? undefined}
        onChange={updatePleural}
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

export default Pleural;