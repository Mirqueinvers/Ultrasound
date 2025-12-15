import React, { useState } from 'react';
import { Hepat, type LiverProtocol } from '../organs/Hepat';
import Gallbladder, { type GallbladderProtocol } from '../organs/Gallbladder';
import Pancreas, { type PancreasProtocol } from '../organs/Pancreas';

export interface ObpProtocol {
  liver: LiverProtocol;
  gallbladder: GallbladderProtocol | null;
  pancreas: PancreasProtocol | null;
}

interface ObpProps {
  value?: ObpProtocol;
  onChange?: (value: ObpProtocol) => void;
}

const defaultState: ObpProtocol = {
  liver: {
    rightLobeAP: "",
    leftLobeAP: "",
    echogenicity: "",
    homogeneity: "",
    contours: "",
    lowerEdgeAngle: "",
    focalLesionsPresence: "",
    focalLesions: "",
    vascularPattern: "",
    portalVeinDiameter: "",
    ivc: "",
    conclusion: "",
  },
  gallbladder: {
    length: "",
    width: "",
    wallThickness: "",
    shape: "",
    constriction: "",
    contentType: "",
    concretions: "Не определяются",
    concretionsList: [],
    polyps: "Не определяются",
    polypsList: [],
    content: "",
    cysticDuct: "",
    commonBileDuct: "",
    conclusion: "",
  },
  pancreas: {
    head: "",
    body: "",
    tail: "",
    echogenicity: "",
    echostructure: "",
    contour: "",
    pathologicalFormations: "Не определяются",
    pathologicalFormationsText: "",
    wirsungDuct: "",
    additional: "",
    conclusion: "",
  },
};

export const Obp: React.FC<ObpProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<ObpProtocol>(value ?? defaultState);

  const updateLiver = (liverData: LiverProtocol) => {
    const updated = { ...form, liver: liverData };
    setForm(updated);
    onChange?.(updated);
  };

  const updateGallbladder = (gallbladderData: GallbladderProtocol) => {
    const updated = { ...form, gallbladder: gallbladderData };
    setForm(updated);
    onChange?.(updated);
  };

  const updatePancreas = (pancreasData: PancreasProtocol) => {
    const updated = { ...form, pancreas: pancreasData };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Заголовок исследования */}
      <div className="border-b-2 border-slate-200 pb-4 mb-6">
        <h2 className="m-0 text-slate-800 text-xl font-bold">
          УЗИ органов брюшной полости (ОБП)
        </h2>
        <p className="mt-2 mb-0 text-slate-500 text-sm">
          Комплексное ультразвуковое исследование органов брюшной полости
        </p>
      </div>

      {/* Печень */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Hepat 
          value={form.liver} 
          onChange={updateLiver} 
        />
      </div>

      {/* Желчный пузырь */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Gallbladder 
          value={form.gallbladder || undefined} 
          onChange={updateGallbladder} 
        />
      </div>

      {/* Поджелудочная железа */}
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Pancreas 
          value={form.pancreas || undefined} 
          onChange={updatePancreas} 
        />
      </div>

      {/* Заглушки для будущих компонентов */}
      <div className="border-2 border-dashed border-slate-300 rounded-lg p-5 bg-slate-100 text-center">
        <h4 className="m-0 mb-2 text-slate-600 text-base">
          🫀 Селезенка
        </h4>
        <p className="m-0 text-slate-400 text-sm">
          Компонент будет добавлен в следующей версии
        </p>
      </div>
    </div>
  );
};

export default Obp;