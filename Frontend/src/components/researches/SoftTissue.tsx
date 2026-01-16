// Frontend/src/components/researches/SoftTissue.tsx
import React from "react";
import { Conclusion } from "@common";
import { Fieldset } from "@/UI";
import { useFormState, useFieldUpdate } from "@hooks";
import { inputClasses, labelClasses } from "@utils/formClasses";
import { useResearch } from "@contexts";
import type { SoftTissueProtocol, SoftTissueProps } from "@types";
import { defaultSoftTissueState } from "@types";

export const SoftTissue: React.FC<SoftTissueProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<SoftTissueProtocol>(
    value ?? defaultSoftTissueState
  );

  const { setStudyData } = useResearch();

  const sync = (updated: SoftTissueProtocol) => {
    setForm(updated);
    setStudyData("Мягких тканей", updated);
    onChange?.(updated);
  };

  const updateField = (
    field: keyof SoftTissueProtocol,
    fieldValue: SoftTissueProtocol[keyof SoftTissueProtocol]
  ) => {
    sync({ ...form, [field]: fieldValue });
  };

  const updateConclusion = (conclusionData: {
    conclusion: string;
    recommendations: string;
  }) => {
    sync({
      ...form,
      conclusion: conclusionData.conclusion,
      recommendations: conclusionData.recommendations,
    });
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
        value={{
          conclusion: form.conclusion || "",
          recommendations: form.recommendations || "",
        }}
        onChange={updateConclusion}
      />
    </div>
  );
};

export default SoftTissue;
