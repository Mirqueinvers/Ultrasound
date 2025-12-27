import React, { useState, useEffect } from "react";
import { normalRanges, SizeRow, SelectWithTextarea, ButtonSelect } from "@common";
import { useFieldFocus } from "@hooks/useFieldFocus";

export interface PancreasProtocol {
  // Размеры
  head: string;                    // мм (головка)
  body: string;                    // мм (тело)
  tail: string;                    // мм (хвост)

  // Структура
  echogenicity: string;            // Эхогенность
  echostructure: string;           // Эхоструктура
  contour: string;                 // Контур
  pathologicalFormations: string;  // Не определяются / Определяются
  pathologicalFormationsText: string; // описание патологических образований

  // Вирсунгов проток
  wirsungDuct: string;             // мм (диаметр)

  // Дополнительно
  additional: string;

  // Заключение
  conclusion: string;
}

interface PancreasProps {
  value?: PancreasProtocol;
  onChange?: (value: PancreasProtocol) => void;
}

const defaultState: PancreasProtocol = {
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
};

export const Pancreas: React.FC<PancreasProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<PancreasProtocol>(value ?? defaultState);

  // Безопасное получение нормальных значений для поджелудочной железы
  const pancreasRanges = normalRanges?.pancreas || {
    head: { min: 0, max: 32, unit: 'мм' },
    body: { min: 0, max: 21, unit: 'мм' },
    tail: { min: 0, max: 30, unit: 'мм' },
    wirsungDuct: { min: 0, max: 3, unit: 'мм' },
  };

  // Добавляем useFieldFocus для полей поджелудочной железы
  const conclusionFocus = useFieldFocus('pancreas', 'conclusion');
  const headFocus = useFieldFocus('pancreas', 'head');
  const bodyFocus = useFieldFocus('pancreas', 'body');
  const tailFocus = useFieldFocus('pancreas', 'tail');
  const wirsungDuctFocus = useFieldFocus('pancreas', 'wirsungDuct');

  const updateField = (field: keyof PancreasProtocol, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    onChange?.(updated);
  };

  // Глобальный обработчик для добавления текста только в заключение поджелудочной железы
  useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ } = event.detail;
      
      // Проверяем, что текст предназначен для поджелудочной железы
      if (organ === 'pancreas') {
        setForm(prev => ({
          ...prev,
          conclusion: prev.conclusion 
            ? prev.conclusion + (prev.conclusion.endsWith('.') ? ' ' : '. ') + text
            : text
        }));
      }
    };

    window.addEventListener('add-conclusion-text', handleAddText as EventListener);

    return () => {
      window.removeEventListener('add-conclusion-text', handleAddText as EventListener);
    };
  }, []);

  const handleConclusionFocus = () => {
    conclusionFocus.handleFocus();
  };

  const handleConclusionBlur = () => {
    conclusionFocus.handleBlur();
  };

  const inputClasses =
    "mt-1 block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const legendClasses =
    "px-1 text-sm font-semibold text-gray-800";
  const fieldsetClasses =
    "rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3";

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
          onTextareaChange={val =>
            updateField("pathologicalFormationsText", val)
          }
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
