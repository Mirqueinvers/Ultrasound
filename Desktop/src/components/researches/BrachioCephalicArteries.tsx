// src/components/researches/BrachioCephalicArteries.tsx
import React, { useState, useEffect } from "react";
import BrachioCephalicCommon from "@organs/BrachioCephalicArteries/BrachioCephalicCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/useRightPanel";
import { useResearchConclusionAddText } from "@hooks";
import type {
  BrachioCephalicArteriesStudyProtocol,
  BrachioCephalicArteriesStudyProps,
  BrachioCephalicProtocol,
  ArteryProtocol,
} from "@/types";
import { defaultBrachioCephalicArteriesStudyState } from "@/types";
import { defaultArteryState } from "@/types/defaultStates/organs/brachioCephalicArteries";
import { useDefaultOrganValues } from "@/utils/defaultsAccess";
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
  const { isLoaded, getOrganOrDefault, hasOrgan } = useDefaultOrganValues();

  const [form, setForm] = useState<BrachioCephalicArteriesStudyProtocol>(
    value ?? defaultBrachioCephalicArteriesStudyState
  );
  const [version, setVersion] = useState(0);

  // Применяем пользовательские дефолты
  useEffect(() => {
    if (!value && isLoaded) {
      const arteryKeys = [
        "БЦА:ОСА правая", "БЦА:ОСА левая",
        "БЦА:ВСА правая", "БЦА:ВСА левая",
        "БЦА:НСА правая", "БЦА:НСА левая",
        "БЦА:позвоночная правая", "БЦА:позвоночная левая",
        "БЦА:подключичная правая", "БЦА:подключичная левая",
      ];
      const anyDefaults = arteryKeys.some((key) => hasOrgan(key));
      if (anyDefaults) {
        setForm({
          ...defaultBrachioCephalicArteriesStudyState,
          brachioCephalicArteries: {
            brachiocephalicTrunkRight: getOrganOrDefault<ArteryProtocol>("БЦА:подключичная правая", { ...defaultArteryState }),
            brachiocephalicTrunkLeft: getOrganOrDefault<ArteryProtocol>("БЦА:подключичная левая", { ...defaultArteryState }),
            commonCarotidRight: getOrganOrDefault<ArteryProtocol>("БЦА:ОСА правая", { ...defaultArteryState }),
            commonCarotidLeft: getOrganOrDefault<ArteryProtocol>("БЦА:ОСА левая", { ...defaultArteryState }),
            internalCarotidRight: getOrganOrDefault<ArteryProtocol>("БЦА:ВСА правая", { ...defaultArteryState }),
            internalCarotidLeft: getOrganOrDefault<ArteryProtocol>("БЦА:ВСА левая", { ...defaultArteryState }),
            externalCarotidRight: getOrganOrDefault<ArteryProtocol>("БЦА:НСА правая", { ...defaultArteryState }),
            externalCarotidLeft: getOrganOrDefault<ArteryProtocol>("БЦА:НСА левая", { ...defaultArteryState }),
            vertebralRight: getOrganOrDefault<ArteryProtocol>("БЦА:позвоночная правая", { ...defaultArteryState }),
            vertebralLeft: getOrganOrDefault<ArteryProtocol>("БЦА:позвоночная левая", { ...defaultArteryState }),
            subclavianRight: getOrganOrDefault<ArteryProtocol>("БЦА:подключичная правая", { ...defaultArteryState }),
            subclavianLeft: getOrganOrDefault<ArteryProtocol>("БЦА:подключичная левая", { ...defaultArteryState }),
            overallFindings: "",
          },
        });
        setVersion((v) => v + 1);
      }
    }
  }, [value, isLoaded, hasOrgan, getOrganOrDefault]);

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
        key={version}
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
