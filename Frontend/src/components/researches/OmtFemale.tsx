// Frontend/src/components/researches/OmtFemale.tsx
import React, { useState } from "react";

import Uterus from "@organs/Uterus";
import Ovary from "@organs/Ovary";
import { Conclusion } from "@common";
import UrinaryBladder from "@organs/UrinaryBladder";
import { useResearch } from "@contexts";

import type {
  OmtFemaleProtocol,
  OmtFemaleProps,
  UterusProtocol,
  OvaryProtocol,
  UrinaryBladderProtocol,
} from "@/types";
import { defaultOmtFemaleState } from "@/types";

import type { SectionKey } from "@components/common/OrgNavigation";

interface OmtFemaleWithSectionsProps extends OmtFemaleProps {
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement | null>>;
}

export const OmtFemale: React.FC<OmtFemaleWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<OmtFemaleProtocol>(
    value ?? defaultOmtFemaleState
  );

  const { setStudyData } = useResearch();

  const sync = (updated: OmtFemaleProtocol) => {
    setForm(updated);
    setStudyData("ОМТ (Ж)", updated);
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

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов малого таза
      </div>

      <div ref={sectionRefs?.["ОМТ (Ж):матка"]}>
        <Uterus value={form.uterus ?? undefined} onChange={updateUterus} />
      </div>

      <div ref={sectionRefs?.["ОМТ (Ж):правый яичник"]}>
        <Ovary
          value={form.rightOvary ?? undefined}
          onChange={updateRightOvary}
          side="right"
        />
      </div>

      <div ref={sectionRefs?.["ОМТ (Ж):левый яичник"]}>
        <Ovary
          value={form.leftOvary ?? undefined}
          onChange={updateLeftOvary}
          side="left"
        />
      </div>

      <div ref={sectionRefs?.["ОМТ (Ж):мочевой пузырь"]}>
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
      />
    </div>
  );
};

export default OmtFemale;
