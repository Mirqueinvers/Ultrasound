import React, { useState, useEffect } from "react";
import { RangeIndicator, normalRanges } from '../common/NormalRange';
import { useFieldFocus } from '../hooks/useFieldFocus';

export interface UrinaryBladderProtocol {
  // Размеры
  volume: string;
  wallThickness: string;
  
  // Характеристики
  wallStructure: string;
  contents: string;
  ureteralOrifices: string;
  
  // Дополнительно
  additional: string;
  
  // Заключение
  conclusion: string;
}

interface UrinaryBladderProps {
  value?: UrinaryBladderProtocol;
  onChange?: (value: UrinaryBladderProtocol) => void;
}

const defaultState: UrinaryBladderProtocol = {
  volume: "",
  wallThickness: "",
  wallStructure: "",
  contents: "",
  ureteralOrifices: "",
  additional: "",
  conclusion: "",
};

export const UrinaryBladder: React.FC<UrinaryBladderProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<UrinaryBladderProtocol>(value ?? defaultState);

  const conclusionFocus = useFieldFocus('urinaryBladder', 'conclusion');
  const volumeFocus = useFieldFocus('urinaryBladder', 'volume');
  const wallThicknessFocus = useFieldFocus('urinaryBladder', 'wallThickness');

  const updateField = (field: keyof UrinaryBladderProtocol, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    onChange?.(updated);
  };

  const handleConclusionFocus = () => {
    conclusionFocus.handleFocus();
  };

  const handleConclusionBlur = () => {
    conclusionFocus.handleBlur();
  };

  // Устанавливаем глобальный обработчик для добавления текста только для мочевого пузыря
  useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ } = event.detail;
      
      if (organ === 'urinaryBladder') {
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

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Мочевой пузырь
      </h3>

      {/* Размеры */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Размеры</legend>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Объем (мл)
            <input
              type="text"
              className={inputClasses}
              value={form.volume}
              onChange={e => updateField("volume", e.target.value)}
              onFocus={volumeFocus.handleFocus}
              onBlur={volumeFocus.handleBlur}
              placeholder="200-400"
            />
          </label>
          <RangeIndicator 
            value={form.volume}
            normalRange={normalRanges.urinaryBladder?.volume}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Толщина стенки (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.wallThickness}
              onChange={e => updateField("wallThickness", e.target.value)}
              onFocus={wallThicknessFocus.handleFocus}
              onBlur={wallThicknessFocus.handleBlur}
              placeholder="3-5"
            />
          </label>
          <RangeIndicator 
            value={form.wallThickness}
            normalRange={normalRanges.urinaryBladder?.wallThickness}
          />
        </div>
      </fieldset>

      {/* Характеристики */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Характеристики</legend>

        <div>
          <label className={labelClasses}>
            Структура стенки
            <select
              className={inputClasses}
              value={form.wallStructure}
              onChange={e => updateField("wallStructure", e.target.value)}
            >
              <option value=""></option>
              <option value="равномерная">равномерная</option>
              <option value="неравномерная">неравномерная</option>
              <option value="утолщенная">утолщенная</option>
              <option value="истонченная">истонченная</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Содержимое
            <select
              className={inputClasses}
              value={form.contents}
              onChange={e => updateField("contents", e.target.value)}
            >
              <option value=""></option>
              <option value="анэхогенное">анэхогенное</option>
              <option value="гиперэхогенное">гиперэхогенное</option>
              <option value="с осадком">с осадком</option>
              <option value="с взвесью">со взвесью</option>
              <option value="пустой">пустой</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Устья мочеточников
            <input
              type="text"
              className={inputClasses}
              value={form.ureteralOrifices}
              onChange={e => updateField("ureteralOrifices", e.target.value)}
              placeholder="визуализируются"
            />
          </label>
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
            placeholder="Дополнительная информация..."
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
            placeholder="Заключение по мочевому пузырю..."
          />
        </div>
      </fieldset>
    </div>
  );
};

export default UrinaryBladder;
