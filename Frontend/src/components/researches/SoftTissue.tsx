// Frontend/src/components/researches/SoftTissue.tsx
import React, { useState } from "react";
import { Conclusion, Fieldset } from "@common";
import { useFormState, useFieldUpdate } from "@hooks";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { SoftTissueProtocol, SoftTissueProps } from "@types";
import { defaultSoftTissueState } from "@types";

export const SoftTissue: React.FC<SoftTissueProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<SoftTissueProtocol>(
    defaultSoftTissueState,
    value
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const [conclusion, setConclusion] = useState({
    conclusion: "",
    recommendations: "",
  });

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
      
      <Conclusion value={conclusion} onChange={setConclusion} />
    </div>
  );
};

export default SoftTissue;
