import React, { useState } from "react";
import { RangeIndicator, normalRanges } from '../common/NormalRange';
import { useFieldFocus } from '../hooks/useFieldFocus';

export interface Concretion {
  size: string;      // мм
  position: string;  // проксимальная треть / средняя треть / дистальная треть
}

export interface Polyp {
  size: string;      // мм
  position: string;  // проксимальная треть / средняя треть / дистальная треть
}

export interface GallbladderProtocol {
  // Размеры
  length: string;                  // мм (длина)
  width: string;                   // мм (ширина)

  // Стенка
  wallThickness: string;           // мм (толщина стенки)

  // Форма
  shape: string;                   // Правильная / S-образная / С загибом
  constriction: string;            // в проксимальной трети / средней трети / дистальной трети

  // Содержимое
  contentType: string;             // Однородное / Взвесь / Сладж
  concretions: string;             // Не определяются / Определяются
  concretionsList: Concretion[];   // список конкрементов
  polyps: string;                  // Не определяются / Определяются
  polypsList: Polyp[];             // список полипов
  content: string;                 // описание содержимого (дополнительно)

  // Протоки
  cysticDuct: string;              // мм (пузырный проток)
  commonBileDuct: string;          // мм (общий желчный проток)

      // Дополнительно
  additional: string;

  // Заключение
  conclusion: string;
}

interface GallbladderProps {
  value?: GallbladderProtocol;
  onChange?: (value: GallbladderProtocol) => void;
}

const defaultState: GallbladderProtocol = {
  length: "",
  width: "",
  wallThickness: "",
  shape: "",
  constriction: "",
  contentType: "",
  concretions: "Не определяются",
  concretionsList: [],
  polyps: "Не определяются",
  polypsList: [],
  content: "",
  cysticDuct: "",
  commonBileDuct: "",
  additional: "",
  conclusion: "",
};

export const Gallbladder: React.FC<GallbladderProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<GallbladderProtocol>(value ?? defaultState);

  // Добавляем useFieldFocus для полей желчного пузыря
  const conclusionFocus = useFieldFocus('gallbladder', 'conclusion');
  const lengthFocus = useFieldFocus('gallbladder', 'length');
  const widthFocus = useFieldFocus('gallbladder', 'width');
  const wallThicknessFocus = useFieldFocus('gallbladder', 'wallThickness');
  const cysticDuctFocus = useFieldFocus('gallbladder', 'cysticDuct');
  const commonBileDuctFocus = useFieldFocus('gallbladder', 'commonBileDuct');

  const updateField = (field: keyof GallbladderProtocol, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    onChange?.(updated);
  };

  const addConcretion = () => {
    const updated = {
      ...form,
      concretionsList: [...form.concretionsList, { size: "", position: "" }]
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updateConcretion = (index: number, field: keyof Concretion, val: string) => {
    const updatedList = form.concretionsList.map((item, i) =>
      i === index ? { ...item, [field]: val } : item
    );
    const updated = { ...form, concretionsList: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const addPolyp = () => {
    const updated = {
      ...form,
      polypsList: [...form.polypsList, { size: "", position: "" }]
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updatePolyp = (index: number, field: keyof Polyp, val: string) => {
    const updatedList = form.polypsList.map((item, i) =>
      i === index ? { ...item, [field]: val } : item
    );
    const updated = { ...form, polypsList: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  // Глобальный обработчик для добавления текста только в заключение желчного пузыря
  React.useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ } = event.detail;
      
      // Проверяем, что текст предназначен для желчного пузыря
      if (organ === 'gallbladder') {
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
  const buttonClasses = "px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Желчный пузырь
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
            normalRange={normalRanges.gallbladder.length}
            label="Длина"
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
            normalRange={normalRanges.gallbladder.width}
            label="Ширина"
          />
        </div>
      </fieldset>

      {/* Размеры стенки */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Размеры стенки</legend>
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
            />
          </label>
          <RangeIndicator 
            value={form.wallThickness}
            normalRange={normalRanges.gallbladder.wallThickness}
            label="Толщина стенки"
          />
        </div>
      </fieldset>

      {/* Форма */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Форма</legend>
        <div className="space-y-2">
          <label className={labelClasses}>
            Форма желчного пузыря
            <select
              className={inputClasses}
              value={form.shape}
              onChange={e => updateField("shape", e.target.value)}
            >
              <option value=""></option>
              <option value="Правильная">Правильная</option>
              <option value="S-образная">S-образная</option>
              <option value="С загибом">С загибом</option>
            </select>
          </label>
          <label className={labelClasses}>
            Перетяжка
            <select
              className={inputClasses}
              value={form.constriction}
              onChange={e => updateField("constriction", e.target.value)}
            >
              <option value=""></option>
              <option value="в проксимальной трети">в проксимальной трети</option>
              <option value="в средней трети">в средней трети</option>
              <option value="в дистальной трети">в дистальной трети</option>
            </select>
          </label>
        </div>
      </fieldset>

      {/* Содержимое */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Содержимое</legend>
        <div className="space-y-2">
          <label className={labelClasses}>
            Тип содержимого
            <select
              className={inputClasses}
              value={form.contentType}
              onChange={e => updateField("contentType", e.target.value)}
            >
              <option value=""></option>
              <option value="Однородное">Однородное</option>
              <option value="Взвесь">Взвесь</option>
              <option value="Сладж">Сладж</option>
            </select>
          </label>

          <label className={labelClasses}>
            Конкременты
            <select
              className={inputClasses}
              value={form.concretions}
              onChange={e => updateField("concretions", e.target.value)}
            >
              <option value="Не определяются">Не определяются</option>
              <option value="Определяются">Определяются</option>
            </select>
          </label>

          {form.concretions === "Определяются" && (
            <div className="space-y-2 ml-4">
              <button
                type="button"
                className={buttonClasses}
                onClick={addConcretion}
              >
                Добавить
              </button>
              {form.concretionsList.map((concretion, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                    {index + 1}.
                  </span>
                  <label className="flex-1">
                    <span className="text-xs text-gray-500">Размеры (мм)</span>
                    <input
                      type="text"
                      className={`${inputClasses} text-xs py-1`}
                      value={concretion.size}
                      onChange={e => updateConcretion(index, "size", e.target.value)}
                    />
                  </label>
                  <label className="flex-1">
                    <span className="text-xs text-gray-500">Положение</span>
                    <select
                      className={`${inputClasses} text-xs py-1`}
                      value={concretion.position}
                      onChange={e => updateConcretion(index, "position", e.target.value)}
                    >
                      <option value=""></option>
                      <option value="проксимальная треть">проксимальная треть</option>
                      <option value="средняя треть">средняя треть</option>
                      <option value="дистальная треть">дистальная треть</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>
          )}

          <label className={labelClasses}>
            Полипы
            <select
              className={inputClasses}
              value={form.polyps}
              onChange={e => updateField("polyps", e.target.value)}
            >
              <option value="Не определяются">Не определяются</option>
              <option value="Определяются">Определяются</option>
            </select>
          </label>

          {form.polyps === "Определяются" && (
            <div className="space-y-2 ml-4">
              <button
                type="button"
                className={buttonClasses}
                onClick={addPolyp}
              >
                Добавить
              </button>
              {form.polypsList.map((polyp, index) => (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                    {index + 1}.
                  </span>
                  <label className="flex-1">
                    <span className="text-xs text-gray-500">Размеры (мм)</span>
                    <input
                      type="text"
                      className={`${inputClasses} text-xs py-1`}
                      value={polyp.size}
                      onChange={e => updatePolyp(index, "size", e.target.value)}
                    />
                  </label>
                  <label className="flex-1">
                    <span className="text-xs text-gray-500">Положение</span>
                    <select
                      className={`${inputClasses} text-xs py-1`}
                      value={polyp.position}
                      onChange={e => updatePolyp(index, "position", e.target.value)}
                    >
                      <option value=""></option>
                      <option value="проксимальная треть">проксимальная треть</option>
                      <option value="средняя треть">средняя треть</option>
                      <option value="дистальная треть">дистальная треть</option>
                    </select>
                  </label>
                </div>
              ))}
            </div>
          )}

          <label className="block w-full">
            Дополнительно
            <textarea
              rows={2}
              className={inputClasses + " resize-y"}
              value={form.content}
              onChange={e => updateField("content", e.target.value)}
            />
          </label>
        </div>
      </fieldset>

      {/* Протоки */}
      <fieldset className={fieldsetClasses}>
        <legend className={legendClasses}>Протоки</legend>
        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Пузырный проток (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.cysticDuct}
              onChange={e => updateField("cysticDuct", e.target.value)}
              onFocus={cysticDuctFocus.handleFocus}
              onBlur={cysticDuctFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.cysticDuct}
            normalRange={normalRanges.gallbladder.cysticDuct}
            label="Пузырный проток"
          />
        </div>
        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Общий желчный проток (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.commonBileDuct}
              onChange={e => updateField("commonBileDuct", e.target.value)}
              onFocus={commonBileDuctFocus.handleFocus}
              onBlur={commonBileDuctFocus.handleBlur}
            />
          </label>
          <RangeIndicator 
            value={form.commonBileDuct}
            normalRange={normalRanges.gallbladder.commonBileDuct}
            label="Общий желчный проток"
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
            rows={3}
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

export default Gallbladder;