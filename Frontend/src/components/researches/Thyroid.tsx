// Frontend/src/components/organs/Thyroid.tsx
import React, { useState, useEffect } from "react";
import ThyroidCommon from "@organs/Thyroid/ThyroidCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
import type {
  ThyroidStudyProtocol,
  ThyroidStudyProps,
  ThyroidProtocol,
} from "@/types";
import { defaultThyroidStudyState } from "@/types";
import type { SectionKey } from "@components/common/OrgNavigation";

type ThyroidSectionKey = Extract<
  SectionKey,
  | "Щитовидная железа:правая доля"
  | "Щитовидная железа:левая доля"
>;

interface ThyroidWithSectionsProps extends ThyroidStudyProps {
  sectionRefs?: Record<
    ThyroidSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

export const Thyroid: React.FC<ThyroidWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<ThyroidStudyProtocol>(
    value ?? defaultThyroidStudyState
  );

  const { setStudyData } = useResearch();
  const { showConclusionSamples } = useRightPanel();

  const sync = (updated: ThyroidStudyProtocol) => {
    setForm(updated);
    setStudyData("Щитовидная железа", updated);
    onChange?.(updated);
  };

  const updateThyroid = (thyroidData: ThyroidProtocol) => {
    sync({ ...form, thyroid: thyroidData });
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
    showConclusionSamples("thyroid");
  };

  // Обработчик события добавления текста образца заключения
  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId } = event.detail;
      
      // Проверяем, что событие относится к данному исследованию
      if (studyId !== 'study-thyroid') return;
      
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
      setStudyData("Щитовидная железа", updated);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
  }, [form, onChange, setStudyData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование щитовидной железы
      </div>

      <ThyroidCommon
        value={form.thyroid ?? undefined}
        onChange={updateThyroid}
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

export default Thyroid;
