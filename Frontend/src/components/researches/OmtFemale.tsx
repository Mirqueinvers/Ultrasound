import React, { useState } from "react";
import Uterus, { type UterusProtocol } from "@organs/Uterus";
import Ovary, { type OvaryProtocol } from "@organs/Ovary";
import { Conclusion } from "@common";

export interface OmtFemaleProtocol {
  uterus: UterusProtocol | null;
  leftOvary: OvaryProtocol | null;
  rightOvary: OvaryProtocol | null;
}

interface OmtFemaleProps {
  value?: OmtFemaleProtocol;
  onChange?: (value: OmtFemaleProtocol) => void;
}

const defaultState: OmtFemaleProtocol = {
  uterus: null,
  leftOvary: null,
  rightOvary: null,
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

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов малого таза
      </div>

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Uterus value={form.uterus ?? undefined} onChange={updateUterus} />
      </div>

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Ovary
          value={form.rightOvary ?? undefined}
          onChange={updateRightOvary}
          side="right"
        />
      </div>

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Ovary
          value={form.leftOvary ?? undefined}
          onChange={updateLeftOvary}
          side="left"
        />
      </div>

      <Conclusion value={conclusion} onChange={setConclusion} />
    </div>
  );
};

export default OmtFemale;
