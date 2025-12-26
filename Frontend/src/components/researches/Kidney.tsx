import React, { useState } from 'react';
import RightKidney from '../organs/RightKidney';
import LeftKidney from '../organs/LeftKidney';
import UrinaryBladder from '../organs/UrinaryBladder';
import type { RightKidneyProtocol } from '../organs/RightKidney';
import type { LeftKidneyProtocol } from '../organs/LeftKidney';
import type { UrinaryBladderProtocol } from '../organs/UrinaryBladder';

export interface KidneyProtocol {
  rightKidney: RightKidneyProtocol;
  leftKidney: LeftKidneyProtocol;
  urinaryBladder: UrinaryBladderProtocol;
}

interface KidneyProps {
  value?: KidneyProtocol;
  onChange?: (value: KidneyProtocol) => void;
}

const defaultState: KidneyProtocol = {
  rightKidney: {
    length: "",
    width: "",
    thickness: "",
    echogenicity: "",
    echostructure: "",
    contours: "",
    pathologicalFormations: "Не определяются",
    pathologicalFormationsText: "",
    renalSinus: "",
    renalArtery: "",
    renalVein: "",
    additional: "",
    conclusion: "",
  },
  leftKidney: {
    length: "",
    width: "",
    thickness: "",
    echogenicity: "",
    echostructure: "",
    contours: "",
    pathologicalFormations: "Не определяются",
    pathologicalFormationsText: "",
    renalSinus: "",
    renalArtery: "",
    renalVein: "",
    additional: "",
    conclusion: "",
  },
  urinaryBladder: {
    volume: "",
    wallThickness: "",
    wallStructure: "",
    contents: "",
    ureteralOrifices: "",
    additional: "",
    conclusion: "",
  },
};

export const Kidney: React.FC<KidneyProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<KidneyProtocol>(value ?? defaultState);

  const updateRightKidney = (rightKidneyData: RightKidneyProtocol) => {
    const updated = { ...form, rightKidney: rightKidneyData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateLeftKidney = (leftKidneyData: LeftKidneyProtocol) => {
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
      {/* Заголовок исследования */}
      <div className="border-b-2 border-slate-200 pb-4 mb-6">
        <h2 className="m-0 text-slate-800 text-xl font-bold">
          УЗИ почек и мочевого пузыря
        </h2>
        <p className="mt-2 mb-0 text-slate-500 text-sm">
          Ультразвуковое исследование почек и мочевого пузыря
        </p>
      </div>

      {/* Правая почка */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <RightKidney 
          value={form.rightKidney} 
          onChange={updateRightKidney} 
        />
      </div>

      {/* Левая почка */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <LeftKidney 
          value={form.leftKidney} 
          onChange={updateLeftKidney} 
        />
      </div>

      {/* Мочевой пузырь */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <UrinaryBladder 
          value={form.urinaryBladder} 
          onChange={updateUrinaryBladder} 
        />
      </div>
    </div>
  );
};

export default Kidney;