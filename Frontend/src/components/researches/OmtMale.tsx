import React, { useState, useEffect } from "react";
import Prostate from "@organs/Prostate";
import UrinaryBladder from "@organs/UrinaryBladder";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type {
  OmtMaleProtocol,
  OmtMaleProps,
  ProstateProtocol,
  UrinaryBladderProtocol
} from "@/types";
import { defaultOmtMaleState } from "@/types";

export const OmtMale: React.FC<OmtMaleProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<OmtMaleProtocol>(value ?? defaultOmtMaleState);
  
  const { setStudyData } = useResearch();

  useEffect(() => {
    setStudyData("ОМТ (М)", form);
  }, [form, setStudyData]);

  const updateProstate = (prostateData: ProstateProtocol) => {
    const updated: OmtMaleProtocol = { ...form, prostate: prostateData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateUrinaryBladder = (urinaryBladderData: UrinaryBladderProtocol) => {
    const updated: OmtMaleProtocol = {
      ...form,
      urinaryBladder: urinaryBladderData,
    };
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

      <Prostate
        value={form.prostate ?? undefined}
        onChange={updateProstate}
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

export default OmtMale;
