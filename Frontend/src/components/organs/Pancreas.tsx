import React from "react";
import { normalRanges } from "@common";
import { SizeRow, ButtonSelect, SelectWithTextarea, Fieldset } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFieldFocus } from "@hooks/useFieldFocus";
import { inputClasses } from "@utils/formClasses";
import type { PancreasProps } from "@types";
import { defaultPancreasState } from "@types";
import {
  useFormState,
  useFieldUpdate,
  useConclusion,
} from "@hooks";

export const Pancreas: React.FC<PancreasProps> = ({ onChange }) => {
  const [form, setForm] = useFormState(defaultPancreasState);
  const updateField = useFieldUpdate(form, setForm, onChange);
  useConclusion(setForm, "pancreas");

  const pancreasRanges = normalRanges?.pancreas || {
    head: { min: 0, max: 32, unit: "мм" },
    body: { min: 0, max: 21, unit: "мм" },
    tail: { min: 0, max: 30, unit: "мм" },
    wirsungDuct: { min: 0, max: 3, unit: "мм" },
  };

  const headFocus = useFieldFocus("pancreas", "head");
  const bodyFocus = useFieldFocus("pancreas", "body");
  const tailFocus = useFieldFocus("pancreas", "tail");
  const wirsungDuctFocus = useFieldFocus("pancreas", "wirsungDuct");

  return (
    <ResearchSectionCard title="Поджелудочная железа" headerClassName="bg-sky-500">
      <div className="flex flex-col gap-6">
        {/* Размеры */}
        <Fieldset title="Размеры">
          <SizeRow
            label="Головка (мм)"
            value={form.head}
            onChange={(val) => updateField("head", val)}
            focus={headFocus}
            range={pancreasRanges.head}
          />

          <SizeRow
            label="Тело (мм)"
            value={form.body}
            onChange={(val) => updateField("body", val)}
            focus={bodyFocus}
            range={pancreasRanges.body}
          />

          <SizeRow
            label="Хвост (мм)"
            value={form.tail}
            onChange={(val) => updateField("tail", val)}
            focus={tailFocus}
            range={pancreasRanges.tail}
          />
        </Fieldset>

        {/* Структура */}
        <Fieldset title="Структура">
          <ButtonSelect
            label="Эхогенность"
            value={form.echogenicity}
            onChange={(val) => updateField("echogenicity", val)}
            options={[
              { value: "средняя", label: "средняя" },
              { value: "повышена", label: "повышена" },
              { value: "снижена", label: "снижена" },
            ]}
          />

          <ButtonSelect
            label="Эхоструктура"
            value={form.echostructure}
            onChange={(val) => updateField("echostructure", val)}
            options={[
              { value: "однородная", label: "однородная" },
              { value: "неоднородная", label: "неоднородная" },
              { value: "диффузно-неоднородная", label: "диффузно-неоднородная" },
            ]}
          />

          <ButtonSelect
            label="Контур"
            value={form.contour}
            onChange={(val) => updateField("contour", val)}
            options={[
              { value: "четкий, ровный", label: "четкий, ровный" },
              { value: "четкий, не ровный", label: "четкий, не ровный" },
              { value: "не четкий", label: "не четкий" },
              { value: "бугристый", label: "бугристый" },
            ]}
          />

          <SelectWithTextarea
            label="Патологические образования"
            selectValue={form.pathologicalFormations}
            textareaValue={form.pathologicalFormationsText}
            onSelectChange={(val) => updateField("pathologicalFormations", val)}
            onTextareaChange={(val) =>
              updateField("pathologicalFormationsText", val)
            }
            options={[
              { value: "Не определяются", label: "Не определяются" },
              { value: "Определяются", label: "Определяются" },
            ]}
            triggerValue="Определяются"
            textareaLabel="Описание патологических образований"
          />
        </Fieldset>

        {/* Вирсунгов проток */}
        <Fieldset title="Вирсунгов проток">
          <SizeRow
            label="Вирсунгов проток (мм)"
            value={form.wirsungDuct}
            onChange={(val) => updateField("wirsungDuct", val)}
            focus={wirsungDuctFocus}
            range={pancreasRanges.wirsungDuct}
          />
        </Fieldset>

        {/* Дополнительно */}
        <Fieldset title="Дополнительно">
          <textarea
            rows={3}
            className={inputClasses + " resize-y"}
            value={form.additional}
            onChange={(e) => updateField("additional", e.target.value)}
          />
        </Fieldset>
      </div>
    </ResearchSectionCard>
  );
};

export default Pancreas;
export type { PancreasProtocol } from "@types";
