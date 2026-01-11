import React, { useState, useEffect } from "react";
import Hepat from "@organs/Hepat";
import Gallbladder from "@/components/organs/Gallbladder/Gallbladder";
import Pancreas from "@organs/Pancreas";
import Spleen from "@organs/Spleen";
import { Conclusion } from "@common";
import { useResearch } from "@contexts";
import type { 
  ObpProtocol, 
  ObpProps,
  LiverProtocol,
  GallbladderProtocol,
  PancreasProtocol,
  SpleenProtocol
} from "@/types";
import { defaultObpState } from "@/types";

export const Obp: React.FC<ObpProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<ObpProtocol>(value ?? defaultObpState);
  
  const { setStudyData } = useResearch();

  useEffect(() => {
    setStudyData("ОБП", form);
  }, [form, setStudyData]);

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

  const updateConclusion = (conclusionData: { conclusion: string; recommendations: string }) => {
    const updated = {
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-2xl font-semibold text-center mt-2 mb-4">
        Ультразвуковое исследование органов брюшной полости
      </div>
      
      <Hepat value={form.liver ?? undefined} onChange={updateLiver} />

      <Gallbladder
        value={form.gallbladder ?? undefined}
        onChange={updateGallbladder}
      />

      <Pancreas
        value={form.pancreas ?? undefined}
        onChange={updatePancreas}
      />

      <Spleen
        value={form.spleen ?? undefined}
        onChange={updateSpleen}
      />
      
      <Conclusion 
        value={{ conclusion: form.conclusion, recommendations: form.recommendations }} 
        onChange={updateConclusion} 
      />
    </div>
  );
};

export default Obp;
