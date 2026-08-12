// src/components/researches/BrachioCephalicArteries.tsx
import React, { useState } from "react";
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
import type { SectionKey } from "@/protocols";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import { STUDY_KEYS } from "@/domain/studyKeys";

type BrachioCephalicSectionKey = Extract<
  SectionKey,
  | typeof SECTION_KEYS.BCA_RIGHT_OSA
  | typeof SECTION_KEYS.BCA_LEFT_OSA
  | typeof SECTION_KEYS.BCA_RIGHT_VSA
  | typeof SECTION_KEYS.BCA_LEFT_VSA
  | typeof SECTION_KEYS.BCA_RIGHT_NSA
  | typeof SECTION_KEYS.BCA_LEFT_NSA
  | typeof SECTION_KEYS.BCA_RIGHT_VERTEBRAL
  | typeof SECTION_KEYS.BCA_LEFT_VERTEBRAL
  | typeof SECTION_KEYS.BCA_RIGHT_SUBCLAVIAN
  | typeof SECTION_KEYS.BCA_LEFT_SUBCLAVIAN
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

  // Паттерн «adjust state during render»: применяем пользовательские дефолты,
  // когда они загружены и внешнего value ещё нет (guard — prevIsLoaded).
  const [prevIsLoaded, setPrevIsLoaded] = useState(isLoaded);
  if (isLoaded && !prevIsLoaded && !value) {
    setPrevIsLoaded(true);
    const arteryKeys = [
      SECTION_KEYS.BCA_RIGHT_OSA, SECTION_KEYS.BCA_LEFT_OSA,
      SECTION_KEYS.BCA_RIGHT_VSA, SECTION_KEYS.BCA_LEFT_VSA,
      SECTION_KEYS.BCA_RIGHT_NSA, SECTION_KEYS.BCA_LEFT_NSA,
      SECTION_KEYS.BCA_RIGHT_VERTEBRAL, SECTION_KEYS.BCA_LEFT_VERTEBRAL,
      SECTION_KEYS.BCA_RIGHT_SUBCLAVIAN, SECTION_KEYS.BCA_LEFT_SUBCLAVIAN,
    ];
    const anyDefaults = arteryKeys.some((key) => hasOrgan(key));
    if (anyDefaults) {
      setForm({
        ...defaultBrachioCephalicArteriesStudyState,
        brachioCephalicArteries: {
          brachiocephalicTrunkRight: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_RIGHT_SUBCLAVIAN, { ...defaultArteryState }),
          brachiocephalicTrunkLeft: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_LEFT_SUBCLAVIAN, { ...defaultArteryState }),
          commonCarotidRight: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_RIGHT_OSA, { ...defaultArteryState }),
          commonCarotidLeft: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_LEFT_OSA, { ...defaultArteryState }),
          internalCarotidRight: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_RIGHT_VSA, { ...defaultArteryState }),
          internalCarotidLeft: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_LEFT_VSA, { ...defaultArteryState }),
          externalCarotidRight: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_RIGHT_NSA, { ...defaultArteryState }),
          externalCarotidLeft: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_LEFT_NSA, { ...defaultArteryState }),
          vertebralRight: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_RIGHT_VERTEBRAL, { ...defaultArteryState }),
          vertebralLeft: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_LEFT_VERTEBRAL, { ...defaultArteryState }),
          subclavianRight: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_RIGHT_SUBCLAVIAN, { ...defaultArteryState }),
          subclavianLeft: getOrganOrDefault<ArteryProtocol>(SECTION_KEYS.BCA_LEFT_SUBCLAVIAN, { ...defaultArteryState }),
          overallFindings: "",
        },
      });
      setVersion((v) => v + 1);
    }
  }

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: BrachioCephalicArteriesStudyProtocol) => {
    setForm(updated);
    setStudyData(STUDY_KEYS.BCA, updated);
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

  useResearchConclusionAddText("study-brachioCephalicArteries", STUDY_KEYS.BCA, form, setForm, onChange);

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
