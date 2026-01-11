import React, { useState, useEffect } from "react";
import UrinaryBladder from "@organs/UrinaryBladder";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type {
  UrinaryBladderStudyProtocol,
  UrinaryBladderStudyProps,
  UrinaryBladderProtocol
} from "@/types";
import { defaultUrinaryBladderStudyState } from "@/types";

export const UrinaryBladderResearch: React.FC<UrinaryBladderStudyProps> = ({
  value,
  onChange,
}) => {
  const [form, setForm] = useState<UrinaryBladderStudyProtocol>(
    value ?? defaultUrinaryBladderStudyState,
  );
  
  const { setStudyData } = useResearch();

  useEffect(() => {
    setStudyData("Мочевой пузырь", form);
  }, [form, setStudyData]);

  const updateUrinaryBladder = (bladderData: UrinaryBladderProtocol) => {
    const updated: UrinaryBladderStudyProtocol = {
      ...form,
      urinaryBladder: bladderData,
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updateConclusion = (conclusionData: { conclusion: string; recommendations: string }) => {
    const updated: UrinaryBladderStudyProtocol = {
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
        Ультразвуковое исследование мочевого пузыря
      </div>

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

export default UrinaryBladderResearch;
