import React, { useState } from "react";
import Testis, { type TestisProtocol } from "@organs/Testis";
import { ResearchHeader, Conclusion } from "@common";

export interface ScrotumProtocol {
  testis: TestisProtocol | null;
}

interface ScrotumProps {
  value?: ScrotumProtocol;
  onChange?: (value: ScrotumProtocol) => void;
}

const defaultState: ScrotumProtocol = {
  testis: null,
};

export const Scrotum: React.FC<ScrotumProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<ScrotumProtocol>(value ?? defaultState);
  const [conclusion, setConclusion] = useState({
    conclusion: "",
    recommendations: "",
  });

  const updateTestis = (testisData: TestisProtocol) => {
    const updated: ScrotumProtocol = { ...form, testis: testisData };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <ResearchHeader researchType="Ультразвуковое исследование органов мошонки" />

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Testis value={form.testis ?? undefined} onChange={updateTestis} />
      </div>

      <Conclusion value={conclusion} onChange={setConclusion} />
    </div>
  );
};

export default Scrotum;
