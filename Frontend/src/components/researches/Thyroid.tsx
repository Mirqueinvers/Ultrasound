import React, { useState, useEffect } from "react";
import ThyroidCommon from "@organs/Thyroid/ThyroidCommon";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type {
  ThyroidStudyProtocol,
  ThyroidStudyProps,
  ThyroidProtocol
} from "@/types";
import { defaultThyroidStudyState } from "@/types";

export const Thyroid: React.FC<ThyroidStudyProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<ThyroidStudyProtocol>(value ?? defaultThyroidStudyState);
  
  const { setStudyData } = useResearch();

  useEffect(() => {
    setStudyData("Щитовидная железа", form);
  }, [form, setStudyData]);

  const updateThyroid = (thyroidData: ThyroidProtocol) => {
    const updated = { ...form, thyroid: thyroidData };
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
        Ультразвуковое исследование щитовидной железы
      </div>

      <ThyroidCommon
        value={form.thyroid ?? undefined}
        onChange={updateThyroid}
      />

      <Conclusion 
        value={{ conclusion: form.conclusion, recommendations: form.recommendations }} 
        onChange={updateConclusion} 
      />
    </div>
  );
};

export default Thyroid;
