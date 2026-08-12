// src/components/researches/SalivaryGlands.tsx
import React, { useState, useEffect } from "react";
import SalivaryCommon from "@organs/SalivaryGlands/SalivaryCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/useRightPanel";
import { useResearchConclusionAddText } from "@hooks";
import type {
  SalivaryGlandsStudyProtocol,
  SalivaryGlandsStudyProps,
  SalivaryGlandsProtocol,
  SalivaryGlandProtocol,
} from "@/types";
import { defaultSalivaryGlandsStudyState } from "@/types";
import { defaultSalivaryGlandState } from "@/types";
import { useDefaultOrganValues } from "@/utils/defaultsAccess";
import type { SectionKey } from "@components/common/OrgNavigation";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import { STUDY_KEYS } from "@/domain/studyKeys";

type SalivarySectionKey = Extract<
  SectionKey,
  | typeof SECTION_KEYS.SALIVARY_RIGHT_PAROTID
  | typeof SECTION_KEYS.SALIVARY_LEFT_PAROTID
  | typeof SECTION_KEYS.SALIVARY_RIGHT_SUBMANDIBULAR
  | typeof SECTION_KEYS.SALIVARY_LEFT_SUBMANDIBULAR
  | typeof SECTION_KEYS.SALIVARY_RIGHT_SUBLINGUAL
  | typeof SECTION_KEYS.SALIVARY_LEFT_SUBLINGUAL
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
  const { isLoaded, getOrganOrDefault, hasOrgan } = useDefaultOrganValues();

  const [form, setForm] = useState<SalivaryGlandsStudyProtocol>(
    value ?? defaultSalivaryGlandsStudyState
  );

  // Применяем пользовательские дефолты
  useEffect(() => {
    if (!value && isLoaded) {
      const anyDefaults = [
        SECTION_KEYS.SALIVARY_RIGHT_PAROTID,
        SECTION_KEYS.SALIVARY_LEFT_PAROTID,
        SECTION_KEYS.SALIVARY_RIGHT_SUBMANDIBULAR,
        SECTION_KEYS.SALIVARY_LEFT_SUBMANDIBULAR,
        SECTION_KEYS.SALIVARY_RIGHT_SUBLINGUAL,
        SECTION_KEYS.SALIVARY_LEFT_SUBLINGUAL,
      ].some((key) => hasOrgan(key));
      if (anyDefaults) {
        setForm({
          ...defaultSalivaryGlandsStudyState,
          salivaryGlands: {
            parotidRight: getOrganOrDefault<SalivaryGlandProtocol>(SECTION_KEYS.SALIVARY_RIGHT_PAROTID, { ...defaultSalivaryGlandState }),
            parotidLeft: getOrganOrDefault<SalivaryGlandProtocol>(SECTION_KEYS.SALIVARY_LEFT_PAROTID, { ...defaultSalivaryGlandState }),
            submandibularRight: getOrganOrDefault<SalivaryGlandProtocol>(SECTION_KEYS.SALIVARY_RIGHT_SUBMANDIBULAR, { ...defaultSalivaryGlandState }),
            submandibularLeft: getOrganOrDefault<SalivaryGlandProtocol>(SECTION_KEYS.SALIVARY_LEFT_SUBMANDIBULAR, { ...defaultSalivaryGlandState }),
            sublingualRight: getOrganOrDefault<SalivaryGlandProtocol>(SECTION_KEYS.SALIVARY_RIGHT_SUBLINGUAL, { ...defaultSalivaryGlandState }),
            sublingualLeft: getOrganOrDefault<SalivaryGlandProtocol>(SECTION_KEYS.SALIVARY_LEFT_SUBLINGUAL, { ...defaultSalivaryGlandState }),
          },
        });
      }
    }
  }, [value, isLoaded, hasOrgan, getOrganOrDefault]);

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: SalivaryGlandsStudyProtocol) => {
    setForm(updated);
    setStudyData(STUDY_KEYS.SALIVARY_GLANDS, updated);
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

  useResearchConclusionAddText("study-salivaryGlands", STUDY_KEYS.SALIVARY_GLANDS, form, setForm, onChange);

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
