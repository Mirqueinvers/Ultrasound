// Frontend/src/components/organs/OmtMale.tsx
import React, { useState, useEffect } from "react";

import Prostate from "@organs/Prostate";
import UrinaryBladder from "@organs/UrinaryBladder";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";

import type {
  OmtMaleProtocol,
  OmtMaleProps,
  ProstateProtocol,
  UrinaryBladderProtocol,
} from "@/types";
import { defaultOmtMaleState } from "@/types";

import type { SectionKey } from "@components/common/OrgNavigation";

interface OmtMaleWithSectionsProps extends OmtMaleProps {
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
}

export const OmtMale: React.FC<OmtMaleWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<OmtMaleProtocol>(
    value ?? defaultOmtMaleState
  );

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: OmtMaleProtocol) => {
    setForm(updated);
    setStudyData("ОМТ (М)", updated);
    onChange?.(updated);
  };

  const updateProstate = (prostateData: ProstateProtocol) => {
    sync({ ...form, prostate: prostateData });
  };

  const updateUrinaryBladder = (
    urinaryBladderData: UrinaryBladderProtocol
  ) => {
    sync({ ...form, urinaryBladder: urinaryBladderData });
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
    showConclusionSamples("omt_male");
    setCurrentOrgan("omt_male");
  };

  // Обработчик события добавления текста образца заключения
  useEffect(() => {
    const handleAddConclusionText = (event: CustomEvent) => {
      const { text, studyId } = event.detail;
      
      // Проверяем, что событие относится к данному исследованию
      if (studyId !== 'study-omt_male') return;
      
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
      setStudyData("ОМТ (М)", updated);
    };

    window.addEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    
    return () => {
      window.removeEventListener('add-conclusion-text', handleAddConclusionText as EventListener);
    };
  }, [form, onChange, setStudyData]);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов малого таза
      </div>

      <div ref={sectionRefs?.["ОМТ (М):простата"]}>
        <Prostate
          value={form.prostate ?? undefined}
          onChange={updateProstate}
        />
      </div>

      <div ref={sectionRefs?.["ОМТ (М):мочевой пузырь"]}>
        <UrinaryBladder
          value={form.urinaryBladder ?? undefined}
          onChange={updateUrinaryBladder}
        />
      </div>

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

export default OmtMale;
