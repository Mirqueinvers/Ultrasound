// Frontend/src/components/researches/Breast.tsx
import React, { useState, useEffect } from "react";
import BreastCommon from "@organs/Breast/BreastCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
import type {
  BreastStudyProtocol,
  BreastStudyProps,
  BreastProtocol,
} from "@/types";
import { defaultBreastStudyState } from "@/types";
import type { SectionKey } from "@components/common/OrgNavigation";

type BreastSectionKey = Extract<
  SectionKey,
  | "Молочные железы:правая железа"
  | "Молочные железы:левая железа"
>;

interface BreastWithSectionsProps extends BreastStudyProps {
  sectionRefs?: Record<
    BreastSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

export const Breast: React.FC<BreastWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<BreastStudyProtocol>(
    value ?? defaultBreastStudyState
  );

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: BreastStudyProtocol) => {
    setForm(updated);
    setStudyData("Молочные железы", updated);
    onChange?.(updated);
  };

  const updateBreast = (breastData: BreastProtocol) => {
    sync({ ...form, breast: breastData });
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
    showConclusionSamples("breast");
    setCurrentOrgan("breast");
  };

  // Обработчик события добавления текста образца заключения
  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId } = event.detail;
      
      // Проверяем, что событие относится к данному исследованию
      if (studyId !== 'study-breast') return;
      
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
      setStudyData("Молочные железы", updated);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
  }, [form, onChange, setStudyData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование молочных желез
      </div>

      <BreastCommon
        value={form.breast ?? undefined}
        onChange={updateBreast}
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

export default Breast;
