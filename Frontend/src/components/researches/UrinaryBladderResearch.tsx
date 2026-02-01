import React, { useState, useEffect } from "react";
import UrinaryBladder from "@organs/UrinaryBladder";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
import type {
  UrinaryBladderStudyProtocol,
  UrinaryBladderStudyProps,
  UrinaryBladderProtocol,
} from "@/types";
import { defaultUrinaryBladderStudyState } from "@/types";

export const UrinaryBladderResearch: React.FC<UrinaryBladderStudyProps> = ({
  value,
  onChange,
}) => {
  const [form, setForm] = useState<UrinaryBladderStudyProtocol>(
    value ?? defaultUrinaryBladderStudyState,
  );

  const { setStudyData } = useResearch();
  const { showConclusionSamples } = useRightPanel();

  const syncBoth = (updated: UrinaryBladderStudyProtocol) => {
    setForm(updated);
    onChange?.(updated);
    setStudyData("Мочевой пузырь", updated);
  };

  const updateUrinaryBladder = (bladderData: UrinaryBladderProtocol) => {
    const updated: UrinaryBladderStudyProtocol = {
      ...form,
      urinaryBladder: bladderData,
    };
    syncBoth(updated);
  };

  const updateConclusion = (conclusionData: {
    conclusion: string;
    recommendations: string;
  }) => {
    const updated: UrinaryBladderStudyProtocol = {
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    };
    syncBoth(updated);
  };

  const handleConclusionFocus = () => {
    showConclusionSamples("urinary_bladder");
  };

  // Обработчик события добавления текста образца заключения
  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId } = event.detail;
      
      // Проверяем, что событие относится к данному исследованию
      if (studyId !== 'study-urinary_bladder') return;
      
      const currentConclusion = form.conclusion?.trim() ?? "";
      const newConclusion = currentConclusion 
        ? `${currentConclusion} ${text}`
        : text;
      
      const updated: UrinaryBladderStudyProtocol = {
        ...form,
        conclusion: newConclusion,
        recommendations: form.recommendations ?? "",
      };
      setForm(updated);
      onChange?.(updated);
      setStudyData("Мочевой пузырь", updated);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
  }, [form, onChange, setStudyData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование мочевого пузыря
      </div>

      <UrinaryBladder
        value={form.urinaryBladder ?? undefined}
        onChange={updateUrinaryBladder}
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

export default UrinaryBladderResearch;
