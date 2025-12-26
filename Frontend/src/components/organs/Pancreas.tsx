import React, { useState, useEffect } from "react";
import { RangeIndicator, normalRanges } from '../common/NormalRange';
import { useFieldFocus } from '../hooks/useFieldFocus';
import { SelectWithTextarea } from "../common/SelectWithTextarea";

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
  const labelClasses = "block text-xs font-medium text-gray-700 w-1/3";
  const fieldsetClasses =
    "rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3";
  const legendClasses =
    "px-1 text-sm font-semibold text-gray-800";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Поджелудочная железа
      </h3>

      {/* Размеры */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Размеры</legend>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Головка (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.head}
              onChange={e => updateField("head", e.target.value)}
              onFocus={headFocus.handleFocus}
              onBlur={headFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.head}
            normalRange={pancreasRanges.head}
            label="Головка"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Тело (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.body}
              onChange={e => updateField("body", e.target.value)}
              onFocus={bodyFocus.handleFocus}
              onBlur={bodyFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.body}
            normalRange={pancreasRanges.body}
            label="Тело"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Хвост (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.tail}
              onChange={e => updateField("tail", e.target.value)}
              onFocus={tailFocus.handleFocus}
              onBlur={tailFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.tail}
            normalRange={pancreasRanges.tail}
            label="Хвост"
          />
        </div>
      </fieldset>

      {/* Структура */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Структура</legend>

        <div>
          <label className={labelClasses}>
            Эхогенность
            <select
              className={inputClasses}
              value={form.echogenicity}
              onChange={e => updateField("echogenicity", e.target.value)}
            >
              <option value=""></option>
              <option value="норма">средняя</option>
              <option value="повышена">повышена</option>
              <option value="снижена">снижена</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Эхоструктура
            <select
              className={inputClasses}
              value={form.echostructure}
              onChange={e => updateField("echostructure", e.target.value)}
            >
              <option value=""></option>
              <option value="однородная">однородная</option>
              <option value="неоднородная">неоднородная</option>
              <option value="диффузно-неоднородная">диффузно-неоднородная</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Контур
            <select
              className={inputClasses}
              value={form.contour}
              onChange={e => updateField("contour", e.target.value)}
            >
              <option value=""></option>
              <option value="четкий, ровный">четкий, ровный</option>
              <option value="четкий, не ровный">четкий, не ровный</option>
              <option value="не четкий">не четкий</option>
              <option value="бугристый">бугристый</option>
            </select>
          </label>
        </div>

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
        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Вирсунгов проток (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.wirsungDuct}
              onChange={e => updateField("wirsungDuct", e.target.value)}
              onFocus={wirsungDuctFocus.handleFocus}
              onBlur={wirsungDuctFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.wirsungDuct}
            normalRange={pancreasRanges.wirsungDuct}
            label="Вирсунгов проток"
          />
        </div>
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