import React, { useState, useEffect } from "react";
import { RangeIndicator, normalRanges } from '../common/NormalRange';
import { useFieldFocus } from '../hooks/useFieldFocus';

export interface LiverProtocol {
  // Размеры
  rightLobeAP: string;             // мм
  leftLobeAP: string;              // мм

  // Структура
  echogenicity: string;
  homogeneity: string;             // Эхоструктура
  contours: string;
  lowerEdgeAngle: string;
  focalLesionsPresence: string;    // определяются / не определяются
  focalLesions: string;            // описание, если определяются

  // Сосуды
  vascularPattern: string;         // Сосудистый рисунок
  portalVeinDiameter: string;      // мм
  ivc: string;

    // Дополнительно
  additional: string;

  // Заключение
  conclusion: string;
}

interface HepatProps {
  value?: LiverProtocol;
  onChange?: (value: LiverProtocol) => void;
}

const defaultState: LiverProtocol = {
  rightLobeAP: "",
  leftLobeAP: "",
  echogenicity: "",
  homogeneity: "",
  contours: "",
  lowerEdgeAngle: "",
  focalLesionsPresence: "",
  focalLesions: "",
  vascularPattern: "",
  portalVeinDiameter: "",
  ivc: "",
  additional: "",
  conclusion: "",
};

export const Hepat: React.FC<HepatProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<LiverProtocol>(value ?? defaultState);

  const conclusionFocus = useFieldFocus('liver', 'conclusion');
  const rightLobeFocus = useFieldFocus('liver', 'rightLobeAP');
  const leftLobeFocus = useFieldFocus('liver', 'leftLobeAP');
  const portalVeinFocus = useFieldFocus('liver', 'portalVeinDiameter');
  const ivcFocus = useFieldFocus('liver', 'ivc');

  const updateField = (field: keyof LiverProtocol, val: string) => {
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

  // Устанавливаем глобальный обработчик для добавления текста только для печени
  useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ } = event.detail;
      
      // Проверяем, что текст предназначен для печени
      if (organ === 'liver') {
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

  const showFocalTextarea = form.focalLesionsPresence === "определяются";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Печень
      </h3>

      {/* Размеры */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Размеры</legend>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Правая доля, ПЗР (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.rightLobeAP}
              onChange={e => updateField("rightLobeAP", e.target.value)}
              onFocus={rightLobeFocus.handleFocus}
              onBlur={rightLobeFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.rightLobeAP}
            normalRange={normalRanges.liver.rightLobeAP}
            label="Правая доля"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Левая доля, ПЗР (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.leftLobeAP}
              onChange={e => updateField("leftLobeAP", e.target.value)}
              onFocus={leftLobeFocus.handleFocus}
              onBlur={leftLobeFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.leftLobeAP}
            normalRange={normalRanges.liver.leftLobeAP}
            label="Левая доля"
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
              <option value="норма">норма</option>
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
              value={form.homogeneity}
              onChange={e => updateField("homogeneity", e.target.value)}
            >
              <option value=""></option>
              <option value="однородная">однородная</option>
              <option value="неоднородная">неоднородная</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Контуры
            <select
              className={inputClasses}
              value={form.contours}
              onChange={e => updateField("contours", e.target.value)}
            >
              <option value=""></option>
              <option value="ровные">ровные</option>
              <option value="неровные">неровные</option>
              <option value="бугристые">бугристые</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Угол нижнего края
            <select
              className={inputClasses}
              value={form.lowerEdgeAngle}
              onChange={e => updateField("lowerEdgeAngle", e.target.value)}
            >
              <option value=""></option>
              <option value="заострён">заострён</option>
              <option value="закруглён">закруглён</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Очаговые образования
            <select
              className={inputClasses}
              value={form.focalLesionsPresence}
              onChange={e => {
                const val = e.target.value;
                updateField("focalLesionsPresence", val);
                if (val === "не определяются") {
                  updateField("focalLesions", "");
                }
              }}
            >
              <option value=""></option>
              <option value="определяются">определяются</option>
              <option value="не определяются">не определяются</option>
            </select>
          </label>
        </div>

        {showFocalTextarea && (
          <div>
            <label className={labelClasses}>
              Описание очаговых образований
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                placeholder="описание размеров, эхогенности, контуров, сосудистости"
                value={form.focalLesions}
                onChange={e => updateField("focalLesions", e.target.value)}
              />
            </label>
          </div>
        )}
      </fieldset>

      {/* Сосуды */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Сосуды</legend>

        <div>
          <label className={labelClasses}>
            Сосудистый рисунок
            <select
              className={inputClasses}
              value={form.vascularPattern}
              onChange={e => updateField("vascularPattern", e.target.value)}
            >
              <option value=""></option>
              <option value="не изменен">не изменен</option>
              <option value="обеднен">обеднен</option>
              <option value="усилен">усилен</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Воротная вена, диаметр (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.portalVeinDiameter}
              onChange={e => updateField("portalVeinDiameter", e.target.value)}
              onFocus={portalVeinFocus.handleFocus}
              onBlur={portalVeinFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.portalVeinDiameter}
            normalRange={normalRanges.liver.portalVeinDiameter}
            label="Воротная вена"
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Нижняя полая вена, диаметр (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.ivc}
              onChange={e => updateField("ivc", e.target.value)}
              onFocus={ivcFocus.handleFocus}
              onBlur={ivcFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.ivc}
            normalRange={normalRanges.liver.ivc}
            label="НПВ"
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
            placeholder="диффузные изменения, очаговые образования, рекомендации"
          />
        </div>
      </fieldset>
    </div>
  );
};

export default Hepat;