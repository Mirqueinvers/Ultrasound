// Frontend/src/components/researches/UrinaryBladderResearch.tsx
import React, { useState } from "react";
import UrinaryBladder, {
  type UrinaryBladderProtocol,
} from "@organs/UrinaryBladder";
import { Conclusion } from "@common";

export interface UrinaryBladderResearchProtocol {
  urinaryBladder: UrinaryBladderProtocol | null;
}

interface UrinaryBladderResearchProps {
  value?: UrinaryBladderResearchProtocol;
  onChange?: (value: UrinaryBladderResearchProtocol) => void;
}

const defaultState: UrinaryBladderResearchProtocol = {
  urinaryBladder: null,
};

export const UrinaryBladderResearch: React.FC<UrinaryBladderResearchProps> = ({
  value,
  onChange,
}) => {
  const [form, setForm] = useState<UrinaryBladderResearchProtocol>(
    value ?? defaultState,
  );
  const [conclusion, setConclusion] = useState({
    conclusion: "",
    recommendations: "",
  });

  const updateUrinaryBladder = (bladderData: UrinaryBladderProtocol) => {
    const updated: UrinaryBladderResearchProtocol = {
      ...form,
      urinaryBladder: bladderData,
    };
    setForm(updated);
    onChange?.(updated);
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

      <Conclusion value={conclusion} onChange={setConclusion} />
    </div>
  );
};

export default UrinaryBladderResearch;
