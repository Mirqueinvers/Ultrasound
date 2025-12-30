// Frontend/src/components/researches/Breast.tsx
import React, { useState } from "react";
import BreastCommon, { type BreastProtocol } from "@organs/Breast/BreastCommon";
import { ResearchHeader, Conclusion } from "@common";

export interface BreastResearchProtocol {
  breast: BreastProtocol | null;
}

interface BreastProps {
  value?: BreastResearchProtocol;
  onChange?: (value: BreastResearchProtocol) => void;
}

const defaultState: BreastResearchProtocol = {
  breast: null,
};

export const Breast: React.FC<BreastProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<BreastResearchProtocol>(value ?? defaultState);
  const [conclusion, setConclusion] = useState({
    conclusion: "",
    recommendations: "",
  });

  const updateBreast = (breastData: BreastProtocol) => {
    const updated = { ...form, breast: breastData };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <ResearchHeader researchType="Ультразвуковое исследование молочных желез" />

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <BreastCommon
          value={form.breast ?? undefined}
          onChange={updateBreast}
        />
      </div>

      <Conclusion value={conclusion} onChange={setConclusion} />
    </div>
  );
};

export default Breast;
