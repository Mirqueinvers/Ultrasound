// src/components/organs/Pleural/PleuralCommon.tsx
import React from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate } from "@hooks";
import { PleuralSide } from "./PleuralSide";
import type { 
  PleuralProtocol, 
  PleuralCommonProps, 
  PleuralSideProtocol 
} from "@/types/organs/pleural";
import { defaultPleuralState } from "@/types";

export const PleuralCommon: React.FC<PleuralCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const [form, setForm] = useFormState<PleuralProtocol>(
    value ?? defaultPleuralState
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const handleSideChange =
    (side: "right" | "left") => (value: PleuralSideProtocol) => {
      const draft = {
        ...form,
        [side === "right" ? "rightSide" : "leftSide"]: value,
      };
      setForm(draft);
      onChange?.(draft);
    };

  return (
    <div className="flex flex-col gap-6">
      {/* Правая плевральная полость */}
      <div ref={sectionRefs?.["Плевральная полость:правая"]}>
        <ResearchSectionCard
          title="Правая плевральная полость"
          headerClassName="bg-emerald-500"
        >
          <PleuralSide
            side="right"
            value={form.rightSide}
            onChange={handleSideChange("right")}
          />
        </ResearchSectionCard>
      </div>

      {/* Левая плевральная полость */}
      <div ref={sectionRefs?.["Плевральная полость:левая"]}>
        <ResearchSectionCard
          title="Левая плевральная полость"
          headerClassName="bg-emerald-500"
        >
          <PleuralSide
            side="left"
            value={form.leftSide}
            onChange={handleSideChange("left")}
          />
        </ResearchSectionCard>
      </div>

      {/* Общие изменения плевры */}
      <ResearchSectionCard
        title="Общие изменения плевры"
        headerClassName="bg-emerald-500"
      >
        <Fieldset title="">
          <div className="space-y-4">
            <ButtonSelect
              label="Утолщение плевры"
              value={form.pleuralThickening}
              onChange={(val) => updateField("pleuralThickening", val)}
              options={[
                { value: "не определяется", label: "не определяется" },
                { value: "локальное утолщение", label: "локальное утолщение" },
                { value: "диффузное утолщение", label: "диффузное утолщение" },
                { value: "значительное утолщение", label: "значительное утолщение" },
              ]}
            />

            <ButtonSelect
              label="Кальцификация плевры"
              value={form.pleuralCalcification}
              onChange={(val) => updateField("pleuralCalcification", val)}
              options={[
                { value: "не определяется", label: "не определяется" },
                { value: "очаговая кальцификация", label: "очаговая кальцификация" },
                { value: "распространенная кальцификация", label: "распространенная кальцификация" },
              ]}
            />

            <ButtonSelect
              label="Спаечный процесс"
              value={form.adhesions}
              onChange={(val) => updateField("adhesions", val)}
              options={[
                { value: "не определяются", label: "не определяются" },
                { value: "единичные спайки", label: "единичные спайки" },
                { value: "множественные спайки", label: "множественные спайки" },
                { value: "плотные сращения", label: "плотные сращения" },
              ]}
            />

            <ButtonSelect
              label="Пневмоторакс"
              value={form.pneumothorax}
              onChange={(val) => updateField("pneumothorax", val)}
              options={[
                { value: "не определяется", label: "не определяется" },
                { value: "верхушечный", label: "верхушечный" },
                { value: "пристеночный", label: "пристеночный" },
                { value: "тотальный", label: "тотальный" },
                { value: "напряженный", label: "напряженный" },
              ]}
            />

            <ButtonSelect
              label="Подвижность диафрагмы"
              value={form.diaphragmMobility}
              onChange={(val) => updateField("diaphragmMobility", val)}
              options={[
                { value: "сохранена", label: "сохранена" },
                { value: "ограничена", label: "ограничена" },
                { value: "отсутствует", label: "отсутствует" },
              ]}
            />

            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дополнительные находки
              </label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                rows={3}
                value={form.additionalFindings}
                onChange={(e) => updateField("additionalFindings", e.target.value)}
                placeholder="Опишите дополнительные находки"
              />
            </div>
          </div>
        </Fieldset>
      </ResearchSectionCard>
    </div>
  );
};

export default PleuralCommon;
