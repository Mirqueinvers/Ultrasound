// Frontend/src/components/researches/SoftTissue.tsx
import React, { useState, useEffect } from "react";
import { Conclusion } from "@common";
import { Fieldset } from "@/UI";
import { useFormState, useFieldUpdate } from "@hooks";
import { inputClasses, labelClasses } from "@utils/formClasses";
import { useResearch } from "@contexts";
import type { SoftTissueProtocol, SoftTissueProps } from "@types";
import { defaultSoftTissueState } from "@types";

export const SoftTissue: React.FC<SoftTissueProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<SoftTissueProtocol>(
    defaultSoftTissueState,
    value
  );
  
  const { setStudyData } = useResearch();

  // Сохраняем данные в context при каждом изменении
  useEffect(() => {
    setStudyData("Мягких тканей", form);
  }, [form, setStudyData]);

  const updateField = useFieldUpdate(form, setForm, onChange);

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
        Ультразвуковое исследование мягких тканей
      </div>

      <Fieldset title="">
        <div className="w-full">
          <label className={labelClasses + " w-full"}>
            Область исследования
            <input
              type="text"
              className={inputClasses + " w-full"}
              value={form.researchArea}
              onChange={(e) => updateField("researchArea", e.target.value)}
              placeholder="Укажите область исследования"
            />
          </label>
        </div>

        <div className="w-full">
          <label className={labelClasses + " w-full"}>
            Описание исследования
            <textarea
              rows={6}
              className={inputClasses + " resize-y w-full"}
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Введите описание исследования"
            />
          </label>
        </div>
      </Fieldset>
      
      <Conclusion 
        value={{ conclusion: form.conclusion || "", recommendations: form.recommendations || "" }} 
        onChange={updateConclusion} 
      />
    </div>
  );
};

export default SoftTissue;
