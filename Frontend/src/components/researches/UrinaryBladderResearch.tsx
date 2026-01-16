import React, { useState } from "react";
import UrinaryBladder from "@organs/UrinaryBladder";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type {
  UrinaryBladderStudyProtocol,
  UrinaryBladderStudyProps,
  UrinaryBladderProtocol,
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

  const syncBoth = (updated: UrinaryBladderStudyProtocol) => {
    setForm(updated);
    onChange?.(updated);
    setStudyData("Мочевой пузырь", updated);
  };

  const updateUrinaryBladder = (bladderData: UrinaryBladderProtocol) => {
    const updated: UrinaryBladderStudyProtocol = {
      ...form,
      urinaryBladder: bladderData,
    };
    syncBoth(updated);
  };

  const updateConclusion = (conclusionData: {
    conclusion: string;
    recommendations: string;
  }) => {
    const updated: UrinaryBladderStudyProtocol = {
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    };
    syncBoth(updated);
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
        value={{
          conclusion: form.conclusion,
          recommendations: form.recommendations,
        }}
        onChange={updateConclusion}
      />
    </div>
  );
};

export default UrinaryBladderResearch;
