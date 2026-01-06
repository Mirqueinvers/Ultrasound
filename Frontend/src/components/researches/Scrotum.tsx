import React, { useState } from "react";
import Testis, { type TestisProtocol } from "@organs/Testis";
import { Conclusion } from "@common";

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
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов мошонки
      </div>

        <Testis value={form.testis ?? undefined} onChange={updateTestis} />

      <Conclusion value={conclusion} onChange={setConclusion} />
    </div>
  );
};

export default Scrotum;
