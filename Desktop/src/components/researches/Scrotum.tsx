// Frontend/src/components/organs/Scrotum.tsx
import React, { useState, useEffect } from "react";
import Testis from "@organs/Testis";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/useRightPanel";
import { useResearchConclusionAddText } from "@hooks";
import type {
  ScrotumProtocol,
  ScrotumProps,
  TestisProtocol,
} from "@/types";
import { defaultScrotumState } from "@/types";
import { useDefaultValues } from "@hooks";
import type { SectionKey } from "@components/common/OrgNavigation";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import { STUDY_KEYS } from "@/domain/studyKeys";

type ScrotumSectionKey = Extract<
  SectionKey,
  | typeof SECTION_KEYS.SCROTUM_RIGHT_TESTIS
  | typeof SECTION_KEYS.SCROTUM_LEFT_TESTIS
>;

interface ScrotumWithSectionsProps extends ScrotumProps {
  sectionRefs?: Record<
    ScrotumSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

export const Scrotum: React.FC<ScrotumWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const { defaults, isLoaded } = useDefaultValues();

  const [form, setForm] = useState<ScrotumProtocol>(
    value ?? defaultScrotumState
  );

  // Когда дефолты загружены и нет value извне — применяем пользовательские дефолты
  useEffect(() => {
    if (!value && isLoaded) {
      const rightDefault = defaults[SECTION_KEYS.SCROTUM_RIGHT_TESTIS] as unknown as TestisProtocol["rightTestis"] | undefined;
      const leftDefault = defaults[SECTION_KEYS.SCROTUM_LEFT_TESTIS] as unknown as TestisProtocol["leftTestis"] | undefined;
      const hasAnyDefault = rightDefault || leftDefault;
      setForm({
        ...defaultScrotumState,
        testis: hasAnyDefault
          ? {
              rightTestis: rightDefault ?? null,
              leftTestis: leftDefault ?? null,
            }
          : null,
      });
    }
  }, [value, isLoaded, defaults]);

  useEffect(() => {
    setForm(value ?? defaultScrotumState);
  }, [value]);

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: ScrotumProtocol) => {
    setForm(updated);
    setStudyData(STUDY_KEYS.SCROTUM, updated);
    onChange?.(updated);
  };

  const updateTestis = (testisData: TestisProtocol) => {
    sync({ ...form, testis: testisData });
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
    showConclusionSamples("scrotum");
    setCurrentOrgan("scrotum");
  };

  useResearchConclusionAddText("study-scrotum", STUDY_KEYS.SCROTUM, form, setForm, onChange);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов мошонки
      </div>

      <Testis
        value={form.testis ?? undefined}
        onChange={updateTestis}
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

export default Scrotum;
