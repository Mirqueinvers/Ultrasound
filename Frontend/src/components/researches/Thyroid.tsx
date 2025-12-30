// Frontend/src/components/researches/Thyroid.tsx
import React, { useState } from "react";
import ThyroidCommon, { type ThyroidProtocol } from "@organs/Thyroid/ThyroidCommon";
import { ResearchHeader, Conclusion } from "@common";

export interface ThyroidResearchProtocol {
  thyroid: ThyroidProtocol | null;
}

interface ThyroidProps {
  value?: ThyroidResearchProtocol;
  onChange?: (value: ThyroidResearchProtocol) => void;
}

const defaultState: ThyroidResearchProtocol = {
  thyroid: null,
};

export const Thyroid: React.FC<ThyroidProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<ThyroidResearchProtocol>(value ?? defaultState);
  const [conclusion, setConclusion] = useState({
    conclusion: "",
    recommendations: "",
  });

  const updateThyroid = (thyroidData: ThyroidProtocol) => {
    const updated = { ...form, thyroid: thyroidData };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <ResearchHeader researchType="Ультразвуковое исследование щитовидной железы" />

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <ThyroidCommon
          value={form.thyroid ?? undefined}
          onChange={updateThyroid}
        />
      </div>

      <Conclusion value={conclusion} onChange={setConclusion} />
    </div>
  );
};

export default Thyroid;
