import React, { useState, useEffect } from "react";
import { RangeIndicator, normalRanges } from '../common/NormalRange';
import { useFieldFocus } from '../hooks/useFieldFocus';

export interface SpleenProtocol {
  // Размеры
  length: string;              // мм (длина)
  width: string;               // мм (ширина)
  
  // Структура
  echogenicity: string;        // Эхогенность
  echostructure: string;       // Эхоструктура  
  contours: string;            // Контур
  pathologicalFormations: string;  // Патологические образования
  pathologicalFormationsText: string;  // описание, если определяются

  // Сосуды
  splenicVein: string;         // мм (селезеночная вена)
  splenicArtery: string;       // мм (селезеночная артерия)

  // Дополнительно
  additional: string;

  // Заключение
  conclusion: string;
}

interface SpleenProps {
  value?: SpleenProtocol;
  onChange?: (value: SpleenProtocol) => void;
}

const defaultState: SpleenProtocol = {
  length: "",
  width: "",
  echogenicity: "",
  echostructure: "",
  contours: "",
  pathologicalFormations: "",
  pathologicalFormationsText: "",
  splenicVein: "",
  splenicArtery: "",
  additional: "",
  conclusion: "",
};

export const Spleen: React.FC<SpleenProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<SpleenProtocol>(value ?? defaultState);

  const conclusionFocus = useFieldFocus('spleen', 'conclusion');
  const lengthFocus = useFieldFocus('spleen', 'spleenLength'); // Обновлено
  const widthFocus = useFieldFocus('spleen', 'spleenWidth'); // Обновлено
  const splenicVeinFocus = useFieldFocus('spleen', 'splenicVein');
  const splenicArteryFocus = useFieldFocus('spleen', 'splenicArtery');

  const updateField = (field: keyof SpleenProtocol, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    onChange?.(updated);
  };

  // Устанавливаем глобальный обработчик для добавления текста только для селезенки
  useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ } = event.detail;
      
      // Проверяем, что текст предназначен для селезенки
      if (organ === 'spleen') {
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

  const inputClasses =
    "mt-1 block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClasses = "block text-xs font-medium text-gray-700 w-1/3";
  const fieldsetClasses =
    "rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3";
  const legendClasses =
    "px-1 text-sm font-semibold text-gray-800";

  const showPathologicalTextarea = form.pathologicalFormations === "определяются";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Селезенка
      </h3>

      {/* Размеры */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Размеры</legend>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Длина (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.length}
              onChange={e => updateField("length", e.target.value)}
              onFocus={lengthFocus.handleFocus}
              onBlur={lengthFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.length}
            normalRange={normalRanges.spleen.length}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Ширина (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.width}
              onChange={e => updateField("width", e.target.value)}
              onFocus={widthFocus.handleFocus}
              onBlur={widthFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.width}
            normalRange={normalRanges.spleen.width}
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
              value={form.contours}
              onChange={e => updateField("contours", e.target.value)}
            >
              <option value=""></option>
              <option value="ровные">четкий, ровный</option>
              <option value="неровные">четкий, неровный</option>
              <option value="бугристые">бугристый</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Патологические образования
            <select
              className={inputClasses}
              value={form.pathologicalFormations}
              onChange={e => {
                const val = e.target.value;
                
                // Обновляем состояние напрямую через setForm
                const updated = { ...form, pathologicalFormations: val };
                if (val === "не определяются") {
                  updated.pathologicalFormationsText = "";
                }
                setForm(updated);
                onChange?.(updated);
              }}
            >
              <option value=""></option>
              <option value="определяются">определяются</option>
              <option value="не определяются">не определяются</option>
            </select>
          </label>
        </div>

        {showPathologicalTextarea && (
          <div>
            <label className={labelClasses}>
              Описание патологических образований
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                value={form.pathologicalFormationsText}
                onChange={e => updateField("pathologicalFormationsText", e.target.value)}
              />
            </label>
          </div>
        )}
      </fieldset>

      {/* Сосуды */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Сосуды</legend>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Селезеночная вена, диаметр (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.splenicVein}
              onChange={e => updateField("splenicVein", e.target.value)}
              onFocus={splenicVeinFocus.handleFocus}
              onBlur={splenicVeinFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.splenicVein}
            normalRange={normalRanges.spleen.splenicVein}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Селезеночная артерия, диаметр (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.splenicArtery}
              onChange={e => updateField("splenicArtery", e.target.value)}
              onFocus={splenicArteryFocus.handleFocus}
              onBlur={splenicArteryFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.splenicArtery}
            normalRange={normalRanges.spleen.splenicArtery}
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
            onFocus={conclusionFocus.handleFocus}
            onBlur={conclusionFocus.handleBlur}
          />
        </div>
      </fieldset>
    </div>
  );
};

export default Spleen;