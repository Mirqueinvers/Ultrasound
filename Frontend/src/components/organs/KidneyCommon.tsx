import React, { useState } from "react";
import { RangeIndicator, normalRanges } from '../common/NormalRange';
import { useFieldFocus } from '../hooks/useFieldFocus';

export interface Concrement {
  size: string;      // мм
  location: string;  // локализация
}

export interface Cyst {
  size: string;      // мм
  location: string;  // локализация
}

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
  parenchymaConcrementslist: Concrement[];
  parenchymaCysts: string;
  parenchymaCystslist: Cyst[];
  parenchymaPathologicalFormations: string;
  parenchymaPathologicalFormationsText: string;
  
  // Чашечно-лоханочная система
  pcsSize: string;
  pcsMicroliths: string;
  pcsMicrolithsSize: string;
  pcsConcrements: string;
  pcsConcrementslist: Concrement[];
  pcsCysts: string;
  pcsCystslist: Cyst[];
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
  parenchymaConcrementslist: [],
  parenchymaCysts: "",
  parenchymaCystslist: [],
  parenchymaPathologicalFormations: "",
  parenchymaPathologicalFormationsText: "",
  pcsSize: "",
  pcsMicroliths: "",
  pcsMicrolithsSize: "",
  pcsConcrements: "",
  pcsConcrementslist: [],
  pcsCysts: "",
  pcsCystslist: [],
  pcsPathologicalFormations: "",
  pcsPathologicalFormationsText: "",
  sinus: "",
  adrenalArea: "",
  adrenalAreaText: "",
  contour: "",
};

export const KidneyCommon: React.FC<KidneyCommonProps> = ({ side, value, onChange }) => {
  // Обеспечиваем наличие всех необходимых полей с массивами
  const initialValue: KidneyProtocol = {
    ...defaultState,
    ...(value || {}),
    parenchymaConcrementslist: value?.parenchymaConcrementslist || [],
    parenchymaCystslist: value?.parenchymaCystslist || [],
    pcsConcrementslist: value?.pcsConcrementslist || [],
    pcsCystslist: value?.pcsCystslist || [],
  };

  const [form, setForm] = useState<KidneyProtocol>(initialValue);

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
    
    // Автоматическая очистка списков конкрементов и кист
    if (field === 'parenchymaConcrements' && val === 'не определяются') {
      updated.parenchymaConcrementslist = [];
    }
    if (field === 'parenchymaCysts' && val === 'не определяются') {
      updated.parenchymaCystslist = [];
    }
    if (field === 'pcsConcrements' && val === 'не определяются') {
      updated.pcsConcrementslist = [];
    }
    if (field === 'pcsCysts' && val === 'не определяются') {
      updated.pcsCystslist = [];
    }
    
    setForm(updated);
    onChange?.(updated);
  };

  // Функции для работы с конкрементами паренхимы
  const addParenchymaConcrement = () => {
    const updated = {
      ...form,
      parenchymaConcrementslist: [...form.parenchymaConcrementslist, { size: "", location: "" }]
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updateParenchymaConcrement = (index: number, field: keyof Concrement, val: string) => {
    const updatedList = form.parenchymaConcrementslist.map((item, i) =>
      i === index ? { ...item, [field]: val } : item
    );
    const updated = { ...form, parenchymaConcrementslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const removeParenchymaConcrement = (index: number) => {
    const updatedList = form.parenchymaConcrementslist.filter((_, i) => i !== index);
    const updated = { ...form, parenchymaConcrementslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  // Функции для работы с кистами паренхимы
  const addParenchymaCyst = () => {
    const updated = {
      ...form,
      parenchymaCystslist: [...form.parenchymaCystslist, { size: "", location: "" }]
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updateParenchymaCyst = (index: number, field: keyof Cyst, val: string) => {
    const updatedList = form.parenchymaCystslist.map((item, i) =>
      i === index ? { ...item, [field]: val } : item
    );
    const updated = { ...form, parenchymaCystslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const removeParenchymaCyst = (index: number) => {
    const updatedList = form.parenchymaCystslist.filter((_, i) => i !== index);
    const updated = { ...form, parenchymaCystslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  // Функции для работы с конкрементами ЧЛС
  const addPcsConcrement = () => {
    const updated = {
      ...form,
      pcsConcrementslist: [...form.pcsConcrementslist, { size: "", location: "" }]
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updatePcsConcrement = (index: number, field: keyof Concrement, val: string) => {
    const updatedList = form.pcsConcrementslist.map((item, i) =>
      i === index ? { ...item, [field]: val } : item
    );
    const updated = { ...form, pcsConcrementslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const removePcsConcrement = (index: number) => {
    const updatedList = form.pcsConcrementslist.filter((_, i) => i !== index);
    const updated = { ...form, pcsConcrementslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  // Функции для работы с кистами ЧЛС
  const addPcsCyst = () => {
    const updated = {
      ...form,
      pcsCystslist: [...form.pcsCystslist, { size: "", location: "" }]
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updatePcsCyst = (index: number, field: keyof Cyst, val: string) => {
    const updatedList = form.pcsCystslist.map((item, i) =>
      i === index ? { ...item, [field]: val } : item
    );
    const updated = { ...form, pcsCystslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const removePcsCyst = (index: number) => {
    const updatedList = form.pcsCystslist.filter((_, i) => i !== index);
    const updated = { ...form, pcsCystslist: updatedList };
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
  const buttonClasses = "px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

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

        {form.parenchymaConcrements === "определяются" && (
        <div className="space-y-2 ml-4">
            <button
            type="button"
            className={buttonClasses}
            onClick={addParenchymaConcrement}
            >
            Добавить конкремент
            </button>
            {form.parenchymaConcrementslist.map((concrement, index) => (
            <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                {index + 1}.
                </span>
                <label className="flex-1">
                <span className="text-xs text-gray-500">Размер (мм)</span>
                <input
                    type="text"
                    className={`${inputClasses} text-xs py-1`}
                    value={concrement.size}
                    onChange={e => updateParenchymaConcrement(index, "size", e.target.value)}
                />
                </label>
                <label className="flex-1">
                <span className="text-xs text-gray-500">Локализация</span>
                <select
                    className={`${inputClasses} text-xs py-1`}
                    value={concrement.location}
                    onChange={e => updateParenchymaConcrement(index, "location", e.target.value)}
                >
                    <option value=""></option>
                    <option value="верхний полюс">верхний полюс</option>
                    <option value="нижний полюс">нижний полюс</option>
                    <option value="в центре">в центре</option>
                </select>
                </label>
                <button
                type="button"
                className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                onClick={() => removeParenchymaConcrement(index)}
                title="Удалить"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            ))}
        </div>
        )}


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

        {form.parenchymaCysts === "определяются" && (
        <div className="space-y-2 ml-4">
            <button
            type="button"
            className={buttonClasses}
            onClick={addParenchymaCyst}
            >
            Добавить кисту
            </button>
            {form.parenchymaCystslist.map((cyst, index) => (
            <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                {index + 1}.
                </span>
                <div className="flex-1 flex items-end gap-1">
                <label className="flex-1">
                    <span className="text-xs text-gray-500">Размер 1 (мм)</span>
                    <input
                    type="text"
                    className={`${inputClasses} text-xs py-1`}
                    value={cyst.size.split('x')[0] || ""}
                    onChange={e => {
                        const size2 = cyst.size.split('x')[1] || "";
                        updateParenchymaCyst(index, "size", e.target.value + (size2 ? `x${size2}` : ""));
                    }}
                    />
                </label>
                <span className="text-gray-500 pb-1">×</span>
                <label className="flex-1">
                    <span className="text-xs text-gray-500">Размер 2 (мм)</span>
                    <input
                    type="text"
                    className={`${inputClasses} text-xs py-1`}
                    value={cyst.size.split('x')[1] || ""}
                    onChange={e => {
                        const size1 = cyst.size.split('x')[0] || "";
                        updateParenchymaCyst(index, "size", size1 + (e.target.value ? `x${e.target.value}` : ""));
                    }}
                    />
                </label>
                </div>
                <label className="flex-1">
                <span className="text-xs text-gray-500">Локализация</span>
                <select
                    className={`${inputClasses} text-xs py-1`}
                    value={cyst.location}
                    onChange={e => updateParenchymaCyst(index, "location", e.target.value)}
                >
                    <option value=""></option>
                    <option value="верхний полюс">верхний полюс</option>
                    <option value="нижний полюс">нижний полюс</option>
                    <option value="в центре">в центре</option>
                </select>
                </label>
                <button
                type="button"
                className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                onClick={() => removeParenchymaCyst(index)}
                title="Удалить"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            ))}
        </div>
        )}


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

        {form.pcsConcrements === "определяются" && (
        <div className="space-y-2 ml-4">
            <button
            type="button"
            className={buttonClasses}
            onClick={addPcsConcrement}
            >
            Добавить конкремент
            </button>
            {form.pcsConcrementslist.map((concrement, index) => (
            <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                {index + 1}.
                </span>
                <label className="flex-1">
                <span className="text-xs text-gray-500">Размер (мм)</span>
                <input
                    type="text"
                    className={`${inputClasses} text-xs py-1`}
                    value={concrement.size}
                    onChange={e => updatePcsConcrement(index, "size", e.target.value)}
                />
                </label>
                <label className="flex-1">
                <span className="text-xs text-gray-500">Локализация</span>
                <select
                    className={`${inputClasses} text-xs py-1`}
                    value={concrement.location}
                    onChange={e => updatePcsConcrement(index, "location", e.target.value)}
                >
                    <option value=""></option>
                    <option value="верхний полюс">верхний полюс</option>
                    <option value="нижний полюс">нижний полюс</option>
                    <option value="в центре">в центре</option>
                </select>
                </label>
                <button
                type="button"
                className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                onClick={() => removePcsConcrement(index)}
                title="Удалить"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            ))}
        </div>
        )}

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

        {form.pcsCysts === "определяются" && (
        <div className="space-y-2 ml-4">
            <button
            type="button"
            className={buttonClasses}
            onClick={addPcsCyst}
            >
            Добавить кисту
            </button>
            {form.pcsCystslist.map((cyst, index) => (
            <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                {index + 1}.
                </span>
                <div className="flex-1 flex items-end gap-1">
                <label className="flex-1">
                    <span className="text-xs text-gray-500">Размер 1 (мм)</span>
                    <input
                    type="text"
                    className={`${inputClasses} text-xs py-1`}
                    value={cyst.size.split('x')[0] || ""}
                    onChange={e => {
                        const size2 = cyst.size.split('x')[1] || "";
                        updatePcsCyst(index, "size", e.target.value + (size2 ? `x${size2}` : ""));
                    }}
                    />
                </label>
                <span className="text-gray-500 pb-1">×</span>
                <label className="flex-1">
                    <span className="text-xs text-gray-500">Размер 2 (мм)</span>
                    <input
                    type="text"
                    className={`${inputClasses} text-xs py-1`}
                    value={cyst.size.split('x')[1] || ""}
                    onChange={e => {
                        const size1 = cyst.size.split('x')[0] || "";
                        updatePcsCyst(index, "size", size1 + (e.target.value ? `x${e.target.value}` : ""));
                    }}
                    />
                </label>
                </div>
                <label className="flex-1">
                <span className="text-xs text-gray-500">Локализация</span>
                <select
                    className={`${inputClasses} text-xs py-1`}
                    value={cyst.location}
                    onChange={e => updatePcsCyst(index, "location", e.target.value)}
                >
                    <option value=""></option>
                    <option value="верхний полюс">верхний полюс</option>
                    <option value="нижний полюс">нижний полюс</option>
                    <option value="в центре">в центре</option>
                </select>
                </label>
                <button
                type="button"
                className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                onClick={() => removePcsCyst(index)}
                title="Удалить"
                >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                </button>
            </div>
            ))}
        </div>
        )}


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
