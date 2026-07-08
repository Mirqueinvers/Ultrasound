// src/components/researches/SalivaryGlands.tsx
import React, { useState, useEffect } from "react";
import SalivaryCommon from "@organs/SalivaryGlands/SalivaryCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
import { useResearchConclusionAddText } from "@hooks";
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

  useResearchConclusionAddText('study-salivaryGlands', 'Слюнные железы', form, setForm, onChange);

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
