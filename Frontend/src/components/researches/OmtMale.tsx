import React, { useState } from "react";
import Prostate, { type ProstateProtocol } from "@organs/Prostate";
import UrinaryBladder, {
  type UrinaryBladderProtocol,
} from "@organs/UrinaryBladder";
import { Conclusion } from "@common";

export interface OmtMaleProtocol {
  prostate: ProstateProtocol | null;
  urinaryBladder: UrinaryBladderProtocol | null;
}

interface OmtMaleProps {
  value?: OmtMaleProtocol;
  onChange?: (value: OmtMaleProtocol) => void;
}

const defaultState: OmtMaleProtocol = {
  prostate: null,
  urinaryBladder: null,
};

export const OmtMale: React.FC<OmtMaleProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<OmtMaleProtocol>(value ?? defaultState);
  const [conclusion, setConclusion] = useState({
    conclusion: "",
    recommendations: "",
  });

  const updateProstate = (prostateData: ProstateProtocol) => {
    const updated: OmtMaleProtocol = { ...form, prostate: prostateData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateUrinaryBladder = (
    urinaryBladderData: UrinaryBladderProtocol
  ) => {
    const updated: OmtMaleProtocol = {
      ...form,
      urinaryBladder: urinaryBladderData,
    };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов малого таза
      </div>

        <Prostate
          value={form.prostate ?? undefined}
          onChange={updateProstate}
        />

        <UrinaryBladder
          value={form.urinaryBladder ?? undefined}
          onChange={updateUrinaryBladder}
        />

      <Conclusion value={conclusion} onChange={setConclusion} />
    </div>
  );
};

export default OmtMale;
