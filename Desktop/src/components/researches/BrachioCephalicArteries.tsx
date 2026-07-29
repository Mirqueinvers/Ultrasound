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
import { useDefaultValues } from "@hooks";
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
  const { defaults, isLoaded } = useDefaultValues();

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
      const anyDefaults = arteryKeys.some((key) => defaults[key]);
      if (anyDefaults) {
        setForm({
          ...defaultBrachioCephalicArteriesStudyState,
          brachioCephalicArteries: {
            brachiocephalicTrunkRight: (defaults["БЦА:подключичная правая"] || {}) as any,
            brachiocephalicTrunkLeft: (defaults["БЦА:подключичная левая"] || {}) as any,
            commonCarotidRight: (defaults["БЦА:ОСА правая"] || {}) as any,
            commonCarotidLeft: (defaults["БЦА:ОСА левая"] || {}) as any,
            internalCarotidRight: (defaults["БЦА:ВСА правая"] || {}) as any,
            internalCarotidLeft: (defaults["БЦА:ВСА левая"] || {}) as any,
            externalCarotidRight: (defaults["БЦА:НСА правая"] || {}) as any,
            externalCarotidLeft: (defaults["БЦА:НСА левая"] || {}) as any,
            vertebralRight: (defaults["БЦА:позвоночная правая"] || {}) as any,
            vertebralLeft: (defaults["БЦА:позвоночная левая"] || {}) as any,
            subclavianRight: (defaults["БЦА:подключичная правая"] || {}) as any,
            subclavianLeft: (defaults["БЦА:подключичная левая"] || {}) as any,
            overallFindings: "",
          },
        });
        setVersion((v) => v + 1);
      }
    }
  }, [value, isLoaded, defaults]);

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
