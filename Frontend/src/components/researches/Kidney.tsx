import React, { useState, useEffect } from "react";
import KidneyCommon from "@organs/Kidney/KidneyCommon";
import UrinaryBladder from "@organs/UrinaryBladder";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type { 
  KidneyStudyProtocol, 
  KidneyStudyProps,
  KidneyProtocol as KidneyCommonProtocol,
  UrinaryBladderProtocol
} from "@/types";
import { defaultKidneyStudyState } from "@/types";

export const Kidney: React.FC<KidneyStudyProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<KidneyStudyProtocol>(value ?? defaultKidneyStudyState);
  
  const { setStudyData } = useResearch();

  useEffect(() => {
    setStudyData("Почки", form);
  }, [form, setStudyData]);

  const updateRightKidney = (rightKidneyData: KidneyCommonProtocol) => {
    const updated = { ...form, rightKidney: rightKidneyData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateLeftKidney = (leftKidneyData: KidneyCommonProtocol) => {
    const updated = { ...form, leftKidney: leftKidneyData };
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
        Ультразвуковое исследование почек
      </div>
      
      <KidneyCommon
        side="right"
        value={form.rightKidney ?? undefined}
        onChange={updateRightKidney}
      />

      <KidneyCommon
        side="left"
        value={form.leftKidney ?? undefined}
        onChange={updateLeftKidney}
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

export default Kidney;
