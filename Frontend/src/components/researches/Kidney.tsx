import React, { useState } from 'react';
import KidneyCommon from '../organs/KidneyCommon';
import UrinaryBladder from '../organs/UrinaryBladder';
import type { KidneyProtocol as KidneyCommonProtocol } from '../organs/KidneyCommon';
import type { UrinaryBladderProtocol } from '../organs/UrinaryBladder';

export interface KidneyProtocol {
  rightKidney: KidneyCommonProtocol;
  leftKidney: KidneyCommonProtocol;
  urinaryBladder: UrinaryBladderProtocol;
}

interface KidneyProps {
  value?: KidneyProtocol;
  onChange?: (value: KidneyProtocol) => void;
}

// Функция для создания дефолтного состояния почки
const createDefaultKidneyState = (): KidneyCommonProtocol => ({
  length: "",
  width: "",
  thickness: "",
  parenchymaSize: "",
  parenchymaEchogenicity: "",
  parenchymaStructure: "",
  parenchymaConcrements: "не определяются",
  parenchymaCysts: "не определяются",
  parenchymaPathologicalFormations: "не определяются",
  parenchymaPathologicalFormationsText: "",
  pcsSize: "",
  pcsMicroliths: "",
  pcsMicrolithsSize: "",
  pcsConcrements: "не определяются",
  pcsCysts: "не определяются",
  pcsPathologicalFormations: "не определяются",
  pcsPathologicalFormationsText: "",
  sinus: "",
  adrenalArea: "",
  adrenalAreaText: "",
  contour: "",
});

const defaultState: KidneyProtocol = {
  rightKidney: createDefaultKidneyState(),
  leftKidney: createDefaultKidneyState(),
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
        <KidneyCommon 
          side="right"
          value={form.rightKidney} 
          onChange={updateRightKidney} 
        />
      </div>

      {/* Левая почка */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <KidneyCommon 
          side="left"
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
