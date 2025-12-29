import React from "react";
import { normalRanges, SizeRow, SelectWithTextarea, ButtonSelect } from "@common";
import { useFieldFocus } from "@hooks/useFieldFocus";
import { inputClasses, labelClasses, fieldsetClasses, legendClasses } from "@utils/formClasses";
import type { PancreasProps } from "@types";
import { defaultPancreasState } from "@types";
import {
  useFormState,
  useFieldUpdate,
  useConclusion,
} from "@hooks";

export const Pancreas: React.FC<PancreasProps> = ({ value, onChange }) => {
  // 🔥 ХУКИ - 3 строки вместо 50+!
  const [form, setForm] = useFormState(defaultPancreasState, value);
  const updateField = useFieldUpdate(form, setForm, onChange);
  useConclusion(setForm, "pancreas");

  // Безопасное получение нормальных значений
  const pancreasRanges = normalRanges?.pancreas || {
    head: { min: 0, max: 32, unit: 'мм' },
    body: { min: 0, max: 21, unit: 'мм' },
    tail: { min: 0, max: 30, unit: 'мм' },
    wirsungDuct: { min: 0, max: 3, unit: 'мм' },
  };

  // Фокусы
  const conclusionFocus = useFieldFocus('pancreas', 'conclusion');
  const headFocus = useFieldFocus('pancreas', 'head');
  const bodyFocus = useFieldFocus('pancreas', 'body');
  const tailFocus = useFieldFocus('pancreas', 'tail');
  const wirsungDuctFocus = useFieldFocus('pancreas', 'wirsungDuct');

  const handleConclusionFocus = () => conclusionFocus.handleFocus();
  const handleConclusionBlur = () => conclusionFocus.handleBlur();

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Поджелудочная железа
      </h3>

      {/* Размеры */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Размеры</legend>

        <SizeRow
          label="Головка (мм)"
          value={form.head}
          onChange={val => updateField("head", val)}
          focus={headFocus}
          range={pancreasRanges.head}
        />

        <SizeRow
          label="Тело (мм)"
          value={form.body}
          onChange={val => updateField("body", val)}
          focus={bodyFocus}
          range={pancreasRanges.body}
        />

        <SizeRow
          label="Хвост (мм)"
          value={form.tail}
          onChange={val => updateField("tail", val)}
          focus={tailFocus}
          range={pancreasRanges.tail}
        />
      </fieldset>

      {/* Структура */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Структура</legend>

        <ButtonSelect
          label="Эхогенность"
          value={form.echogenicity}
          onChange={(val) => updateField("echogenicity", val)}
          options={[
            { value: "норма", label: "средняя" },
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
          onSelectChange={val => updateField("pathologicalFormations", val)}
          onTextareaChange={val => updateField("pathologicalFormationsText", val)}
          options={[
            { value: "Не определяются", label: "Не определяются" },
            { value: "Определяются", label: "Определяются" },
          ]}
          triggerValue="Определяются"
          textareaLabel="Описание патологических образований"
        />
      </fieldset>

      {/* Вирсунгов проток */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Вирсунгов проток</legend>
        
        <SizeRow
          label="Вирсунгов проток (мм)"
          value={form.wirsungDuct}
          onChange={val => updateField("wirsungDuct", val)}
          focus={wirsungDuctFocus}
          range={pancreasRanges.wirsungDuct}
        />
      </fieldset>

      {/* Дополнительно */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Дополнительно</legend>
        <div>
          <textarea
            rows={3}
            className={inputClasses + " resize-y"}
            value={form.additional}
            onChange={e => updateField("additional", e.target.value)}
          />
        </div>
      </fieldset>

      {/* Заключение */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Заключение</legend>
        <div>
          <textarea
            rows={4}
            className={inputClasses + " resize-y"}
            value={form.conclusion}
            onChange={e => updateField("conclusion", e.target.value)}
            onFocus={handleConclusionFocus}
            onBlur={handleConclusionBlur}
          />
        </div>
      </fieldset>
    </div>
  );
};

export default Pancreas;
