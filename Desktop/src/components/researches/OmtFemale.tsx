// Frontend/src/components/researches/OmtFemale.tsx
import React, { useState, useEffect, useRef } from "react";

import Uterus from "@organs/Uterus";
import Ovary from "@organs/Ovary";
import { Conclusion } from "@common";
import UrinaryBladder from "@organs/UrinaryBladder";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/useRightPanel";
import { useResearchConclusionAddText } from "@hooks";

import type {
  OmtFemaleProtocol,
  OmtFemaleProps,
  UterusProtocol,
  OvaryProtocol,
  UrinaryBladderProtocol,
} from "@/types";
import { defaultOmtFemaleState } from "@/types";
import { useDefaultValues } from "@hooks";

import type { SectionKey } from "@components/common/OrgNavigation";
import { SECTION_KEYS } from "@/domain/sectionKeys";
import { STUDY_KEYS } from "@/domain/studyKeys";

interface OmtFemaleWithSectionsProps extends OmtFemaleProps {
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
}

export const OmtFemale: React.FC<OmtFemaleWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const { defaults, isLoaded } = useDefaultValues();

  const [form, setForm] = useState<OmtFemaleProtocol>(
    value ?? defaultOmtFemaleState
  );

  // Когда дефолты загружены и нет value извне — применяем пользовательские дефолты
  useEffect(() => {
    if (!value && isLoaded) {
      setForm({
        ...defaultOmtFemaleState,
        uterus: (defaults[SECTION_KEYS.OMT_FEMALE_UTERUS] as unknown as UterusProtocol) ?? null,
        rightOvary: (defaults[SECTION_KEYS.OMT_FEMALE_RIGHT_OVARY] as unknown as OvaryProtocol) ?? null,
        leftOvary: (defaults[SECTION_KEYS.OMT_FEMALE_LEFT_OVARY] as unknown as OvaryProtocol) ?? null,
        urinaryBladder: (defaults[SECTION_KEYS.OMT_FEMALE_BLADDER] as unknown as UrinaryBladderProtocol) ?? null,
      });
    }
  }, [value, isLoaded, defaults]);

  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value === prevValueRef.current) return;
    prevValueRef.current = value;

    if (!value) {
      setForm(defaultOmtFemaleState);
      return;
    }

    // Глубокое слияние — мержим только то, что пришло, не затираем массивы/селекты
    setForm((prev) => ({
      ...prev,
      ...value,
      uterus: value.uterus ? { ...prev.uterus, ...value.uterus } : prev.uterus,
      leftOvary: value.leftOvary ? { ...prev.leftOvary, ...value.leftOvary } : prev.leftOvary,
      rightOvary: value.rightOvary ? { ...prev.rightOvary, ...value.rightOvary } : prev.rightOvary,
      urinaryBladder: value.urinaryBladder ? { ...prev.urinaryBladder, ...value.urinaryBladder } : prev.urinaryBladder,
    }));
  }, [value]);

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const sync = (updated: OmtFemaleProtocol) => {
    setForm(updated);
    setStudyData(STUDY_KEYS.OMT_FEMALE, updated);
    onChange?.(updated);
  };

  const updateUterus = (uterusData: UterusProtocol) => {
    sync({ ...form, uterus: uterusData });
  };

  const updateLeftOvary = (leftOvaryData: OvaryProtocol) => {
    sync({ ...form, leftOvary: leftOvaryData });
  };

  const updateRightOvary = (rightOvaryData: OvaryProtocol) => {
    sync({ ...form, rightOvary: rightOvaryData });
  };

  const updateUrinaryBladder = (
    urinaryBladderData: UrinaryBladderProtocol
  ) => {
    sync({ ...form, urinaryBladder: urinaryBladderData });
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
    showConclusionSamples("omt_female");
    setCurrentOrgan("omt_female");
  };

  useResearchConclusionAddText("study-omt_female", STUDY_KEYS.OMT_FEMALE, form, setForm, onChange);

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов малого таза
      </div>

      <div ref={sectionRefs?.[SECTION_KEYS.OMT_FEMALE_UTERUS]}>
        <Uterus value={form.uterus ?? undefined} onChange={updateUterus} />
      </div>

      <div ref={sectionRefs?.[SECTION_KEYS.OMT_FEMALE_RIGHT_OVARY]}>
        <Ovary
          value={form.rightOvary ?? undefined}
          onChange={updateRightOvary}
          side="right"
        />
      </div>

      <div ref={sectionRefs?.[SECTION_KEYS.OMT_FEMALE_LEFT_OVARY]}>
        <Ovary
          value={form.leftOvary ?? undefined}
          onChange={updateLeftOvary}
          side="left"
        />
      </div>

      <div ref={sectionRefs?.[SECTION_KEYS.OMT_FEMALE_BLADDER]}>
        <UrinaryBladder
          value={form.urinaryBladder ?? undefined}
          onChange={updateUrinaryBladder}
        />
      </div>

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

export default OmtFemale;
