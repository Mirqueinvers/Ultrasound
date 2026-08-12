import React, { useState, useEffect } from "react";
import UrinaryBladder from "@organs/UrinaryBladder";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import { useRightPanel } from "@contexts/useRightPanel";
import { useResearchConclusionAddText } from "@hooks";
import type {
  UrinaryBladderStudyProtocol,
  UrinaryBladderStudyProps,
  UrinaryBladderProtocol,
} from "@/types";
import { defaultUrinaryBladderStudyState } from "@/types";
import { useDefaultValues } from "@hooks";
import { STUDY_KEYS } from "@/domain/studyKeys";

export const UrinaryBladderResearch: React.FC<UrinaryBladderStudyProps> = ({
  value,
  onChange,
}) => {
  const { defaults, isLoaded } = useDefaultValues();

  const [form, setForm] = useState<UrinaryBladderStudyProtocol>(
    value ?? defaultUrinaryBladderStudyState,
  );

  // Применяем пользовательские дефолты
  useEffect(() => {
    if (!value && isLoaded) {
      const key = "urinary_bladder";
      const saved = defaults[key] as Record<string, unknown> | undefined;
      if (saved) {
        setForm({
          ...defaultUrinaryBladderStudyState,
          urinaryBladder: saved as unknown as UrinaryBladderProtocol,
        });
      }
    }
  }, [value, isLoaded, defaults]);

  const { setStudyData } = useResearch();
  const { showConclusionSamples, setCurrentOrgan } = useRightPanel();

  const syncBoth = (updated: UrinaryBladderStudyProtocol) => {
    setForm(updated);
    onChange?.(updated);
    setStudyData(STUDY_KEYS.URINARY_BLADDER, updated);
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

  const handleConclusionFocus = () => {
    showConclusionSamples("urinary_bladder");
    setCurrentOrgan("urinary_bladder");
  };

  useResearchConclusionAddText("study-urinary_bladder", STUDY_KEYS.URINARY_BLADDER, form, setForm, onChange);

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
        onConclusionFocus={handleConclusionFocus}
      />
    </div>
  );
};

export default UrinaryBladderResearch;
