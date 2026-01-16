// /components/organs/Scrotum.tsx
import React, { useState } from "react";
import Testis from "@organs/Testis";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type {
  ScrotumProtocol,
  ScrotumProps,
  TestisProtocol,
} from "@/types";
import { defaultScrotumState } from "@/types";

export const Scrotum: React.FC<ScrotumProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<ScrotumProtocol>(
    value ?? defaultScrotumState
  );

  const { setStudyData } = useResearch();

  const sync = (updated: ScrotumProtocol) => {
    setForm(updated);
    setStudyData("Органы мошонки", updated);
    onChange?.(updated);
  };

  const updateTestis = (testisData: TestisProtocol) => {
    sync({ ...form, testis: testisData });
  };

  const updateConclusion = (conclusionData: {
    conclusion: string;
    recommendations: string;
  }) => {
    sync({
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов мошонки
      </div>

      <Testis value={form.testis ?? undefined} onChange={updateTestis} />

      <Conclusion
        value={{
          conclusion: form.conclusion,
          recommendations: form.recommendations,
        }}
        onChange={updateConclusion}
      />
    </div>
  );
};

export default Scrotum;
