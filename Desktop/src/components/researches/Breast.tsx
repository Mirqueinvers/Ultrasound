import React, { useState, useEffect } from "react";
import BreastCommon from "@organs/Breast/BreastCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/RightPanelContext";
import { useResearchConclusionAddText } from "@hooks";
import type {
  BreastStudyProtocol,
  BreastStudyProps,
  BreastProtocol,
} from "@types";
import { defaultBreastStudyState, defaultBreastState } from "@types";
import type { SectionKey } from "@components/common/OrgNavigation";

type BreastSectionKey = Extract<
  SectionKey,
  | "Молочные железы:правая железа"
  | "Молочные железы:левая железа"
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
  const [form, setForm] = useState<BreastStudyProtocol>(
    value ?? defaultBreastStudyState
  );

  useEffect(() => {
    setForm(value ?? defaultBreastStudyState);
  }, [value]);

  const { setStudyData } = useResearch();

  // При первом монтировании сохраняем дефолтные данные в контекст,
  // чтобы протокол отображался на печати даже без изменений
  useEffect(() => {
    if (!value) {
      setStudyData("Молочные железы", {
        ...defaultBreastStudyState,
        breast: defaultBreastState,
      });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: BreastStudyProtocol) => {
    setForm(updated);
    setStudyData("Молочные железы", updated);
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

  useResearchConclusionAddText('study-breast', 'Молочные железы', form, setForm, onChange);

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
