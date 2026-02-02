// Frontend/src/components/researches/LymphNodes.tsx
import React, { useState, useEffect } from "react";
import LymphNodesCommon from "@organs/LymphNodes/LymphNodesCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
import type {
  LymphNodesStudyProtocol,
  LymphNodesStudyProps,
  LymphNodesProtocol,
} from "@/types";
import { defaultLymphNodesStudyState } from "@/types";
import type { SectionKey } from "@components/common/OrgNavigation";

type LymphNodesSectionKey = Extract<
  SectionKey,
  | "Лимфатические узлы:Поднижнечелюстные"
  | "Лимфатические узлы:Шейные"
  | "Лимфатические узлы:Подключичные"
  | "Лимфатические узлы:Надключичные"
  | "Лимфатические узлы:Подмышечные"
  | "Лимфатические узлы:Паховые"
>;

interface LymphNodesWithSectionsProps extends LymphNodesStudyProps {
  sectionRefs?: Record<
    LymphNodesSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

export const LymphNodes: React.FC<LymphNodesWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<LymphNodesStudyProtocol>(
    value ?? defaultLymphNodesStudyState
  );

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: LymphNodesStudyProtocol) => {
    setForm(updated);
    setStudyData("Лимфатические узлы", updated);
    onChange?.(updated);
  };

  const updateLymphNodes = (lymphNodesData: LymphNodesProtocol) => {
    sync({ ...form, lymphNodes: lymphNodesData });
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
    showConclusionSamples("lymphNodes");
    setCurrentOrgan("lymphNodes");
  };

  // Обработчик события добавления текста образца заключения
  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId } = event.detail;
      
      // Проверяем, что событие относится к данному исследованию
      if (studyId !== 'study-lymphNodes') return;
      
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
      setStudyData("Лимфатические узлы", updated);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
  }, [form, onChange, setStudyData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование лимфатических узлов
      </div>

      <LymphNodesCommon
        value={form.lymphNodes ?? undefined}
        onChange={updateLymphNodes}
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

export default LymphNodes;
