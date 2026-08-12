// src/components/researches/LowerExtremityVeins.tsx
import React, { useState } from "react";
import LowerExtremityVeinsCommon from "@organs/LowerExtremityVeins/LowerExtremityVeinsCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/useRightPanel";
import { useResearchConclusionAddText } from "@hooks";
import type {
  LowerExtremityVeinsStudyProtocol,
  LowerExtremityVeinsStudyProps,
  LowerExtremityVeinsProtocol,
} from "@/types";
import { defaultLowerExtremityVeinsStudyState } from "@/types";
import type { SectionKey } from "@components/common/OrgNavigation";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import { STUDY_KEYS } from "@/domain/studyKeys";

type LowerExtremityVeinsSectionKey = Extract<
  SectionKey,
  | typeof SECTION_KEYS.LEV_RIGHT_FEMORAL
  | typeof SECTION_KEYS.LEV_LEFT_FEMORAL
  | typeof SECTION_KEYS.LEV_RIGHT_POPLITEAL
  | typeof SECTION_KEYS.LEV_LEFT_POPLITEAL
  | typeof SECTION_KEYS.LEV_RIGHT_TIBIAL
  | typeof SECTION_KEYS.LEV_LEFT_TIBIAL
  | typeof SECTION_KEYS.LEV_RIGHT_PV
  | typeof SECTION_KEYS.LEV_LEFT_PV
  | typeof SECTION_KEYS.LEV_RIGHT_MV
  | typeof SECTION_KEYS.LEV_LEFT_MV
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
    setStudyData(STUDY_KEYS.LOWER_EXTREMITY_VEINS, updated);
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

  useResearchConclusionAddText("study-lowerExtremityVeins", STUDY_KEYS.LOWER_EXTREMITY_VEINS, form, setForm, onChange);

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
