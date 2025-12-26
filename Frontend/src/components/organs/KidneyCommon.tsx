import React, { useState } from "react";
import { RangeIndicator, normalRanges } from '../common/NormalRange';
import { useFieldFocus } from '../hooks/useFieldFocus';

export interface KidneyProtocol {
  // Размеры
  length: string;
  width: string;
  thickness: string;
  
  // Паренхима
  parenchymaSize: string;
  parenchymaEchogenicity: string;
  parenchymaStructure: string;
  parenchymaConcrements: string;
  parenchymaCysts: string;
  parenchymaPathologicalFormations: string;
  parenchymaPathologicalFormationsText: string;
  
  // Чашечно-лоханочная система
  pcsSize: string;
  pcsMicroliths: string;
  pcsMicrolithsSize: string;
  pcsConcrements: string;
  pcsCysts: string;
  pcsPathologicalFormations: string;
  pcsPathologicalFormationsText: string;
  
  // Синус
  sinus: string;
  
  // Область надпочечников
  adrenalArea: string;
  adrenalAreaText: string;
  
  // Контур почки
  contour: string;
}

interface KidneyCommonProps {
  side: 'left' | 'right';
  value?: KidneyProtocol;
  onChange?: (value: KidneyProtocol) => void;
}

const defaultState: KidneyProtocol = {
  length: "",
  width: "",
  thickness: "",
  parenchymaSize: "",
  parenchymaEchogenicity: "",
  parenchymaStructure: "",
  parenchymaConcrements: "",
  parenchymaCysts: "",
  parenchymaPathologicalFormations: "",
  parenchymaPathologicalFormationsText: "",
  pcsSize: "",
  pcsMicroliths: "",
  pcsMicrolithsSize: "",
  pcsConcrements: "",
  pcsCysts: "",
  pcsPathologicalFormations: "",
  pcsPathologicalFormationsText: "",
  sinus: "",
  adrenalArea: "",
  adrenalAreaText: "",
  contour: "",
};

export const KidneyCommon: React.FC<KidneyCommonProps> = ({ side, value, onChange }) => {
  const [form, setForm] = useState<KidneyProtocol>(value ?? defaultState);

  const organName = side === 'left' ? 'leftKidney' : 'rightKidney';
  const title = side === 'left' ? 'Левая почка' : 'Правая почка';
  const ranges = side === 'left' ? normalRanges.leftKidney : normalRanges.rightKidney;

  const lengthFocus = useFieldFocus(organName, 'length');
  const widthFocus = useFieldFocus(organName, 'width');
  const thicknessFocus = useFieldFocus(organName, 'thickness');

  const updateField = (field: keyof KidneyProtocol, val: string) => {
    const updated = { ...form, [field]: val };
    
    // Автоматическая очистка описания патологических образований паренхимы
    if (field === 'parenchymaPathologicalFormations' && val === 'не определяются') {
      updated.parenchymaPathologicalFormationsText = "";
    }
    
    // Автоматическая очистка описания патологических образований ЧЛС
    if (field === 'pcsPathologicalFormations' && val === 'не определяются') {
      updated.pcsPathologicalFormationsText = "";
    }
    
    // Автоматическая очистка размера микролитов
    if (field === 'pcsMicroliths' && val === 'не определяются') {
      updated.pcsMicrolithsSize = "";
    }
    
    // Автоматическая очистка описания изменений надпочечников
    if (field === 'adrenalArea' && val === 'не изменена') {
      updated.adrenalAreaText = "";
    }
    
    setForm(updated);
    onChange?.(updated);
  };

  const inputClasses =
    "mt-1 block w-full rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500";
  const labelClasses = "block text-xs font-medium text-gray-700 w-1/3";
  const fieldsetClasses =
    "rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-3";
  const legendClasses =
    "px-1 text-sm font-semibold text-gray-800";

  const showParenchymaPathologicalTextarea = form.parenchymaPathologicalFormations === "определяются";
  const showPcsPathologicalTextarea = form.pcsPathologicalFormations === "определяются";
  const showMicrolithsSize = form.pcsMicroliths === "определяются";
  const showAdrenalAreaTextarea = form.adrenalArea === "изменена";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        {title}
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
            normalRange={ranges?.length}
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
            normalRange={ranges?.width}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Толщина (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.thickness}
              onChange={e => updateField("thickness", e.target.value)}
              onFocus={thicknessFocus.handleFocus}
              onBlur={thicknessFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.thickness}
            normalRange={ranges?.thickness}
          />
        </div>
      </fieldset>

      {/* Контур почки */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Контур почки</legend>

        <div>
          <label className={labelClasses}>
            Характеристика
            <select
              className={inputClasses}
              value={form.contour}
              onChange={e => updateField("contour", e.target.value)}
            >
              <option value=""></option>
              <option value="четкий ровный">четкий, ровный</option>
              <option value="четкий неровный">четкий, неровный</option>
              <option value="нечеткий">нечеткий</option>
            </select>
          </label>
        </div>
      </fieldset>

      {/* Паренхима */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Паренхима</legend>

        <div>
          <label className={labelClasses}>
            Размер (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.parenchymaSize}
              onChange={e => updateField("parenchymaSize", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Эхогенность
            <select
              className={inputClasses}
              value={form.parenchymaEchogenicity}
              onChange={e => updateField("parenchymaEchogenicity", e.target.value)}
            >
              <option value=""></option>
              <option value="средняя">средняя</option>
              <option value="повышена">повышена</option>
              <option value="понижена">понижена</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Структура
            <select
              className={inputClasses}
              value={form.parenchymaStructure}
              onChange={e => updateField("parenchymaStructure", e.target.value)}
            >
              <option value=""></option>
              <option value="однородная">однородная</option>
              <option value="диффузно-неоднородная">диффузно-неоднородная</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Конкременты
            <select
              className={inputClasses}
              value={form.parenchymaConcrements}
              onChange={e => updateField("parenchymaConcrements", e.target.value)}
            >
              <option value=""></option>
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Кисты
            <select
              className={inputClasses}
              value={form.parenchymaCysts}
              onChange={e => updateField("parenchymaCysts", e.target.value)}
            >
              <option value=""></option>
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Патологические образования
            <select
              className={inputClasses}
              value={form.parenchymaPathologicalFormations}
              onChange={e => {
                const val = e.target.value;
                const updated = { ...form, parenchymaPathologicalFormations: val };
                if (val === "не определяются") {
                  updated.parenchymaPathologicalFormationsText = "";
                }
                setForm(updated);
                onChange?.(updated);
              }}
            >
              <option value=""></option>
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

        {showParenchymaPathologicalTextarea && (
          <div>
            <label className={labelClasses}>
              Описание патологических образований
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                value={form.parenchymaPathologicalFormationsText}
                onChange={e => updateField("parenchymaPathologicalFormationsText", e.target.value)}
              />
            </label>
          </div>
        )}
      </fieldset>

      {/* Чашечно-лоханочная система */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Чашечно-лоханочная система</legend>

        <div>
          <label className={labelClasses}>
            Размер
            <select
              className={inputClasses}
              value={form.pcsSize}
              onChange={e => updateField("pcsSize", e.target.value)}
            >
              <option value=""></option>
              <option value="не изменена">не изменена</option>
              <option value="расширена">расширена</option>
            </select>
          </label>
        </div>

        <div className="flex items-center gap-4">
        <label className={labelClasses}>
            Микролиты
            <select
            className={inputClasses}
            value={form.pcsMicroliths}
            onChange={e => {
                const val = e.target.value;
                const updated = { ...form, pcsMicroliths: val };
                if (val === "не определяются") {
                updated.pcsMicrolithsSize = "";
                }
                setForm(updated);
                onChange?.(updated);
            }}
            >
            <option value=""></option>
            <option value="не определяются">не определяются</option>
            <option value="определяются">определяются</option>
            </select>
        </label>

        {showMicrolithsSize && (
            <label className={labelClasses}>
            Размером до (мм)
            <input
                type="text"
                className={inputClasses}
                value={form.pcsMicrolithsSize}
                onChange={e => updateField("pcsMicrolithsSize", e.target.value)}
            />
            </label>
        )}
        </div>

        <div>
          <label className={labelClasses}>
            Конкременты
            <select
              className={inputClasses}
              value={form.pcsConcrements}
              onChange={e => updateField("pcsConcrements", e.target.value)}
            >
              <option value=""></option>
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Кисты
            <select
              className={inputClasses}
              value={form.pcsCysts}
              onChange={e => updateField("pcsCysts", e.target.value)}
            >
              <option value=""></option>
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Патологические образования
            <select
              className={inputClasses}
              value={form.pcsPathologicalFormations}
              onChange={e => {
                const val = e.target.value;
                const updated = { ...form, pcsPathologicalFormations: val };
                if (val === "не определяются") {
                  updated.pcsPathologicalFormationsText = "";
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

        {showPcsPathologicalTextarea && (
          <div>
            <label className={labelClasses}>
              Описание патологических образований
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                value={form.pcsPathologicalFormationsText}
                onChange={e => updateField("pcsPathologicalFormationsText", e.target.value)}
              />
            </label>
          </div>
        )}
      </fieldset>

      {/* Синус */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Синус</legend>

        <div>
          <label className={labelClasses}>
            Состояние
            <select
              className={inputClasses}
              value={form.sinus}
              onChange={e => updateField("sinus", e.target.value)}
            >
              <option value=""></option>
              <option value="без включений">без включений</option>
              <option value="с включениями">с включениями</option>
            </select>
          </label>
        </div>
      </fieldset>

      {/* Область надпочечников */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Область надпочечников</legend>

        <div>
          <label className={labelClasses}>
            Состояние
            <select
              className={inputClasses}
              value={form.adrenalArea}
              onChange={e => {
                const val = e.target.value;
                const updated = { ...form, adrenalArea: val };
                if (val === "не изменена") {
                  updated.adrenalAreaText = "";
                }
                setForm(updated);
                onChange?.(updated);
              }}
            >
              <option value=""></option>
              <option value="не изменена">не изменена</option>
              <option value="изменена">изменена</option>
            </select>
          </label>
        </div>

        {showAdrenalAreaTextarea && (
          <div>
            <label className={labelClasses}>
              Описание изменений
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                value={form.adrenalAreaText}
                onChange={e => updateField("adrenalAreaText", e.target.value)}
              />
            </label>
          </div>
        )}
      </fieldset>
    </div>
  );
};

export default KidneyCommon;
