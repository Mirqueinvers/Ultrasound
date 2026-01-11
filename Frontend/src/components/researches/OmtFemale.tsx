import React, { useState, useEffect } from "react";
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
  UrinaryBladderProtocol
} from "@/types";
import { defaultOmtFemaleState } from "@/types";

export const OmtFemale: React.FC<OmtFemaleProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<OmtFemaleProtocol>(value ?? defaultOmtFemaleState);
  
  const { setStudyData } = useResearch();

  useEffect(() => {
    setStudyData("ОМТ (Ж)", form);
  }, [form, setStudyData]);

  const updateUterus = (uterusData: UterusProtocol) => {
    const updated = { ...form, uterus: uterusData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateLeftOvary = (leftOvaryData: OvaryProtocol) => {
    const updated = { ...form, leftOvary: leftOvaryData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateRightOvary = (rightOvaryData: OvaryProtocol) => {
    const updated = { ...form, rightOvary: rightOvaryData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateUrinaryBladder = (urinaryBladderData: UrinaryBladderProtocol) => {
    const updated = { ...form, urinaryBladder: urinaryBladderData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateConclusion = (conclusionData: { conclusion: string; recommendations: string }) => {
    const updated = {
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов малого таза
      </div>
      
      <Uterus value={form.uterus ?? undefined} onChange={updateUterus} />

      <Ovary
        value={form.rightOvary ?? undefined}
        onChange={updateRightOvary}
        side="right"
      />

      <Ovary
        value={form.leftOvary ?? undefined}
        onChange={updateLeftOvary}
        side="left"
      />

      <UrinaryBladder
        value={form.urinaryBladder ?? undefined}
        onChange={updateUrinaryBladder}
      />

      <Conclusion 
        value={{ conclusion: form.conclusion, recommendations: form.recommendations }} 
        onChange={updateConclusion} 
      />
    </div>
  );
};

export default OmtFemale;
