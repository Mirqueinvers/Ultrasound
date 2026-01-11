import React, { useState, useEffect } from "react";
import Testis from "@organs/Testis";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type {
  ScrotumProtocol,
  ScrotumProps,
  TestisProtocol
} from "@/types";
import { defaultScrotumState } from "@/types";

export const Scrotum: React.FC<ScrotumProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<ScrotumProtocol>(value ?? defaultScrotumState);
  
  const { setStudyData } = useResearch();

  useEffect(() => {
    setStudyData("Органы мошонки", form);
  }, [form, setStudyData]);

  const updateTestis = (testisData: TestisProtocol) => {
    const updated: ScrotumProtocol = { ...form, testis: testisData };
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
        Ультразвуковое исследование органов мошонки
      </div>

      <Testis value={form.testis ?? undefined} onChange={updateTestis} />

      <Conclusion 
        value={{ conclusion: form.conclusion, recommendations: form.recommendations }} 
        onChange={updateConclusion} 
      />
    </div>
  );
};

export default Scrotum;
