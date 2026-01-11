import React, { useState, useEffect } from "react";
import BreastCommon from "@organs/Breast/BreastCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type {
  BreastStudyProtocol,
  BreastStudyProps,
  BreastProtocol
} from "@/types";
import { defaultBreastStudyState } from "@/types";

export const Breast: React.FC<BreastStudyProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<BreastStudyProtocol>(value ?? defaultBreastStudyState);
  
  const { setStudyData } = useResearch();

  useEffect(() => {
    setStudyData("Молочные железы", form);
  }, [form, setStudyData]);

  const updateBreast = (breastData: BreastProtocol) => {
    const updated = { ...form, breast: breastData };
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
        Ультразвуковое исследование молочных желез
      </div>

      <BreastCommon
        value={form.breast ?? undefined}
        onChange={updateBreast}
      />

      <Conclusion 
        value={{ conclusion: form.conclusion, recommendations: form.recommendations }} 
        onChange={updateConclusion} 
      />
    </div>
  );
};

export default Breast;
