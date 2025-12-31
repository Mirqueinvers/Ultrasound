import React, { useState } from "react";
import KidneyCommon from "@organs/Kidney/KidneyCommon";
import UrinaryBladder from "@organs/UrinaryBladder";
import type { KidneyProtocol as KidneyCommonProtocol } from "@organs/Kidney/KidneyCommon";
import type { UrinaryBladderProtocol } from "@organs/UrinaryBladder";
import { Conclusion } from "@common";

export interface KidneyProtocol {
  rightKidney: KidneyCommonProtocol | null;
  leftKidney: KidneyCommonProtocol | null;
  urinaryBladder: UrinaryBladderProtocol | null;
}

interface KidneyProps {
  value?: KidneyProtocol;
  onChange?: (value: KidneyProtocol) => void;
}

const defaultState: KidneyProtocol = {
  rightKidney: null,
  leftKidney: null,
  urinaryBladder: null,
};

export const Kidney: React.FC<KidneyProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<KidneyProtocol>(value ?? defaultState);
  const [conclusion, setConclusion] = useState({
    conclusion: "",
    recommendations: "",
  });

  const updateRightKidney = (rightKidneyData: KidneyCommonProtocol) => {
    const updated = { ...form, rightKidney: rightKidneyData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateLeftKidney = (leftKidneyData: KidneyCommonProtocol) => {
    const updated = { ...form, leftKidney: leftKidneyData };
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
        Ультразвуковое исследование почек
      </div>

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <KidneyCommon
          side="right"
          value={form.rightKidney ?? undefined}
          onChange={updateRightKidney}
        />
      </div>

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <KidneyCommon
          side="left"
          value={form.leftKidney ?? undefined}
          onChange={updateLeftKidney}
        />
      </div>

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <UrinaryBladder
          value={form.urinaryBladder ?? undefined}
          onChange={updateUrinaryBladder}
        />
      </div>

      <Conclusion value={conclusion} onChange={setConclusion} />
    </div>
  );
};

export default Kidney;
