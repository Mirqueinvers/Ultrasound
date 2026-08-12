import React, { useState, useEffect } from "react";
import BreastCommon from "@organs/Breast/BreastCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/useRightPanel";
import { useResearchConclusionAddText } from "@hooks";
import type {
  BreastStudyProtocol,
  BreastStudyProps,
  BreastProtocol,
  BreastSideProtocol,
} from "@types";
import { defaultBreastStudyState, defaultBreastState } from "@types";
import { defaultBreastSideState } from "@/types/defaultStates/organs/breast";
import { useDefaultOrganValues } from "@/utils/defaultsAccess";
import type { SectionKey } from "@/protocols";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import { STUDY_KEYS } from "@/domain/studyKeys";

type BreastSectionKey = Extract<
  SectionKey,
  | typeof SECTION_KEYS.BREAST_RIGHT
  | typeof SECTION_KEYS.BREAST_LEFT
>;

interface BreastWithSectionsProps extends BreastStudyProps {
  sectionRefs?: Record<
    BreastSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

const Breast: React.FC<BreastWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const { isLoaded, getOrganOrDefault } = useDefaultOrganValues();

  const [form, setForm] = useState<BreastStudyProtocol>(
    value ?? defaultBreastStudyState
  );

  // Паттерн «adjust state during render»: применяем пользовательские дефолты,
  // когда они загружены и внешнего value ещё нет (guard — prevIsLoaded).
  const [prevIsLoaded, setPrevIsLoaded] = useState(isLoaded);
  if (isLoaded && !prevIsLoaded && !value) {
    setPrevIsLoaded(true);
    const rightDefault = getOrganOrDefault<BreastSideProtocol>(
      SECTION_KEYS.BREAST_RIGHT,
      { ...defaultBreastSideState },
    );
    const leftDefault = getOrganOrDefault<BreastSideProtocol>(
      SECTION_KEYS.BREAST_LEFT,
      { ...defaultBreastSideState },
    );
    setForm({
      ...defaultBreastStudyState,
      breast: {
        lastMenstruationDate: "",
        cycleDay: "",
        rightBreast: rightDefault ?? { ...defaultBreastSideState },
        leftBreast: leftDefault ?? { ...defaultBreastSideState },
        structure: "",
      },
    });
  }

  // Синхронизация с внешним value (guard — prevValue).
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setForm(value ?? defaultBreastStudyState);
  }

  const { setStudyData } = useResearch();

  // При первом монтировании сохраняем дефолтные данные в контекст,
  // чтобы протокол отображался на печати даже без изменений
  useEffect(() => {
    if (!value) {
      setStudyData(STUDY_KEYS.BREAST, {
        ...defaultBreastStudyState,
        breast: defaultBreastState,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: BreastStudyProtocol) => {
    setForm(updated);
    setStudyData(STUDY_KEYS.BREAST, updated);
    onChange?.(updated);
  };

  const updateBreast = (breastData: BreastProtocol) => {
    sync({ ...form, breast: breastData });
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
    showConclusionSamples("breast");
    setCurrentOrgan("breast");
  };

  useResearchConclusionAddText("study-breast", STUDY_KEYS.BREAST, form, setForm, onChange);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование молочных желез
      </div>

      <BreastCommon
        value={form.breast ?? undefined}
        onChange={updateBreast}
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

export default Breast;
