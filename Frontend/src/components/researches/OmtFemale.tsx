import React, { useState } from "react";
import Uterus, { type UterusProtocol } from "@organs/Uterus";
import Ovary, { type OvaryProtocol } from "@organs/Ovary";
import { Conclusion } from "@common";
import UrinaryBladder from "@organs/UrinaryBladder";
import type { UrinaryBladderProtocol } from "@organs/UrinaryBladder";

export interface OmtFemaleProtocol {
  uterus: UterusProtocol | null;
  leftOvary: OvaryProtocol | null;
  rightOvary: OvaryProtocol | null;
  urinaryBladder: UrinaryBladderProtocol | null;
}

interface OmtFemaleProps {
  value?: OmtFemaleProtocol;
  onChange?: (value: OmtFemaleProtocol) => void;
}

const defaultState: OmtFemaleProtocol = {
  uterus: null,
  leftOvary: null,
  rightOvary: null,
  urinaryBladder: null,
};

export const OmtFemale: React.FC<OmtFemaleProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<OmtFemaleProtocol>(value ?? defaultState);
  const [conclusion, setConclusion] = useState({
    conclusion: "",
    recommendations: "",
  });

  const updateUterus = (uterusData: UterusProtocol) => {
    const updated = { ...form, uterus: uterusData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateLeftOvary = (leftOvaryData: OvaryProtocol) => {
    const updated = { ...form, leftOvary: leftOvaryData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateRightOvary = (rightOvaryData: OvaryProtocol) => {
    const updated = { ...form, rightOvary: rightOvaryData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateUrinaryBladder = (urinaryBladderData: UrinaryBladderProtocol) => {
    const updated = { ...form, urinaryBladder: urinaryBladderData };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов малого таза
      </div>
        <Uterus value={form.uterus ?? undefined} onChange={updateUterus} />

        <Ovary
          value={form.rightOvary ?? undefined}
          onChange={updateRightOvary}
          side="right"
        />

        <Ovary
          value={form.leftOvary ?? undefined}
          onChange={updateLeftOvary}
          side="left"
        />

        <UrinaryBladder
          value={form.urinaryBladder ?? undefined}
          onChange={updateUrinaryBladder}
        />

      <Conclusion value={conclusion} onChange={setConclusion} />
    </div>
  );
};

export default OmtFemale;
