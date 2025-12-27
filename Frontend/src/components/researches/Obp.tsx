import React, { useState } from "react";
import Hepat, { type LiverProtocol } from "@organs/Hepat";
import Gallbladder, { type GallbladderProtocol } from "@organs/Gallbladder";
import Pancreas, { type PancreasProtocol } from "@organs/Pancreas";
import Spleen, { type SpleenProtocol } from "@organs/Spleen";
import { ResearchHeader } from "@common";

export interface ObpProtocol {
  liver: LiverProtocol | null;
  gallbladder: GallbladderProtocol | null;
  pancreas: PancreasProtocol | null;
  spleen: SpleenProtocol | null;
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
    hepaticVeinDiameter: "",
    vascularity: "",
    additional: "",
  },
  gallbladder: {
    length: "",
    width: "",
    volume: "",
    wallThickness: "",
    wallStructure: "",
    contents: "",
    concrements: "не определяются",
    concrementslist: [],
    polyps: "не определяются",
    polypslist: [],
    multiplePolyps: false,
    multiplePol: "",
    pathologicalFormations: "не определяются",
    pathologicalFormationsText: "",
    additional: "",
  },
  pancreas: {
    length: "",
    width: "",
    height: "",
    echogenicity: "",
    homogeneity: "",
    edges: "",
    mainDuct: "",
    vascularity: "",
    pathologicalFormations: "не определяются",
    pathologicalFormationsText: "",
    additional: "",
  },
  spleen: {
    length: "",
    width: "",
    thickness: "",
    echogenicity: "",
    homogeneity: "",
    edges: "",
    portaHepatica: "",
    focalLesions: "",
    vascularity: "",
    additional: "",
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

  const updateSpleen = (spleenData: SpleenProtocol) => {
    const updated = { ...form, spleen: spleenData };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <ResearchHeader researchType="Ультразвуковое исследование органов брюшной полости" />

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Hepat value={form.liver ?? undefined} onChange={updateLiver} />
      </div>

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Gallbladder
          value={form.gallbladder ?? undefined}
          onChange={updateGallbladder}
        />
      </div>

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Pancreas 
          value={form.pancreas ?? undefined} 
          onChange={updatePancreas} 
        />
      </div>

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <Spleen 
          value={form.spleen ?? undefined} 
          onChange={updateSpleen} 
        />
      </div>
    </div>
  );
};

export default Obp;
