// src/components/researches/BrachioCephalicArteries.tsx
import React, { useState, useEffect } from "react";
import BrachioCephalicCommon from "@organs/BrachioCephalicArteries/BrachioCephalicCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
import { useResearchConclusionAddText } from "@hooks";
import type {
  BrachioCephalicArteriesStudyProtocol,
  BrachioCephalicArteriesStudyProps,
  BrachioCephalicProtocol,
} from "@/types";
import { defaultBrachioCephalicArteriesStudyState } from "@/types";
import type { SectionKey } from "@components/common/OrgNavigation";

type BrachioCephalicSectionKey = Extract<
  SectionKey,
  | "БЦА:ОСА правая"
  | "БЦА:ОСА левая"
  | "БЦА:ВСА правая"
  | "БЦА:ВСА левая"
  | "БЦА:НСА правая"
  | "БЦА:НСА левая"
  | "БЦА:позвоночная правая"
  | "БЦА:позвоночная левая"
  | "БЦА:подключичная правая"
  | "БЦА:подключичная левая"
>;

interface BrachioCephalicWithSectionsProps extends BrachioCephalicArteriesStudyProps {
  sectionRefs?: Record<
    BrachioCephalicSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

export const BrachioCephalicArteries: React.FC<BrachioCephalicWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<BrachioCephalicArteriesStudyProtocol>(
    value ?? defaultBrachioCephalicArteriesStudyState
  );

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: BrachioCephalicArteriesStudyProtocol) => {
    setForm(updated);
    setStudyData("БЦА", updated);
    onChange?.(updated);
  };

  const updateBrachioCephalicArteries = (brachioData: BrachioCephalicProtocol) => {
    sync({ ...form, brachioCephalicArteries: brachioData });
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
    showConclusionSamples("brachioCephalicArteries");
    setCurrentOrgan("brachioCephalicArteries");
  };

  useResearchConclusionAddText('study-brachioCephalicArteries', 'БЦА', form, setForm, onChange);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование брахиоцефальных артерий
      </div>

      <BrachioCephalicCommon
        value={form.brachioCephalicArteries ?? undefined}
        onChange={updateBrachioCephalicArteries}
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

export default BrachioCephalicArteries;
