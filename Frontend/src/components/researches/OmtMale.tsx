// /components/organs/OmtMale.tsx
import React, { useState } from "react";
import Prostate from "@organs/Prostate";
import UrinaryBladder from "@organs/UrinaryBladder";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type {
  OmtMaleProtocol,
  OmtMaleProps,
  ProstateProtocol,
  UrinaryBladderProtocol,
} from "@/types";
import { defaultOmtMaleState } from "@/types";

type SectionKey = "ОМТ (М):простата" | "ОМТ (М):мочевой пузырь";

interface OmtMaleWithSectionsProps extends OmtMaleProps {
  sectionRefs?: Record<SectionKey, React.RefObject<HTMLDivElement>>;
}

export const OmtMale: React.FC<OmtMaleWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useState<OmtMaleProtocol>(
    value ?? defaultOmtMaleState
  );

  const { setStudyData } = useResearch();

  const sync = (updated: OmtMaleProtocol) => {
    setForm(updated);
    setStudyData("ОМТ (М)", updated);
    onChange?.(updated);
  };

  const updateProstate = (prostateData: ProstateProtocol) => {
    sync({ ...form, prostate: prostateData });
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

      <div ref={sectionRefs?.["ОМТ (М):простата"]}>
        <Prostate
          value={form.prostate ?? undefined}
          onChange={updateProstate}
        />
      </div>

      <div ref={sectionRefs?.["ОМТ (М):мочевой пузырь"]}>
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

export default OmtMale;
