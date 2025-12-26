import React, { useState, useEffect } from "react";

import { normalRanges, SizeRow, Fieldset } from "@common";
import { useFieldFocus } from "@hooks/useFieldFocus";
import { inputClasses, labelClasses, buttonClasses } from "@utils/formClasses";


export interface Concretion {
  size: string;    // мм
  position: string; // проксимальная треть / средняя треть / дистальная треть
}

export interface Polyp {
  size: string;    // мм
  position: string; // проксимальная треть / средняя треть / дистальная треть
}

export interface GallbladderProtocol {
  // Размеры
  length: string;
  width: string;

  // Стенка
  wallThickness: string;

  // Форма
  shape: string;
  constriction: string;

  // Содержимое
  contentType: string;
  concretions: string;
  concretionsList: Concretion[];
  polyps: string;
  polypsList: Polyp[];
  content: string;

  // Протоки
  cysticDuct: string;
  commonBileDuct: string;

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

  const conclusionFocus = useFieldFocus("gallbladder", "conclusion");
  const lengthFocus = useFieldFocus("gallbladder", "gallbladderLength");
  const widthFocus = useFieldFocus("gallbladder", "gallbladderWidth");
  const wallThicknessFocus = useFieldFocus("gallbladder", "wallThickness");
  const cysticDuctFocus = useFieldFocus("gallbladder", "cysticDuct");
  const commonBileDuctFocus = useFieldFocus("gallbladder", "commonBileDuct");

  const updateField = (field: keyof GallbladderProtocol, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    onChange?.(updated);
  };

  const addConcretion = () => {
    const updated = {
      ...form,
      concretionsList: [...form.concretionsList, { size: "", position: "" }],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updateConcretion = (
    index: number,
    field: keyof Concretion,
    val: string,
  ) => {
    const updatedList = form.concretionsList.map((item, i) =>
      i === index ? { ...item, [field]: val } : item,
    );
    const updated = { ...form, concretionsList: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const removeConcretion = (index: number) => {
    const updatedList = form.concretionsList.filter((_, i) => i !== index);
    const updated = { ...form, concretionsList: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const addPolyp = () => {
    const updated = {
      ...form,
      polypsList: [...form.polypsList, { size: "", position: "" }],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updatePolyp = (index: number, field: keyof Polyp, val: string) => {
    const updatedList = form.polypsList.map((item, i) =>
      i === index ? { ...item, [field]: val } : item,
    );
    const updated = { ...form, polypsList: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const removePolyp = (index: number) => {
    const updatedList = form.polypsList.filter((_, i) => i !== index);
    const updated = { ...form, polypsList: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  // добавление текста в заключение для органа gallbladder
  useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ } = event.detail;

      if (organ === "gallbladder") {
        setForm(prev => ({
          ...prev,
          conclusion: prev.conclusion
            ? prev.conclusion +
              (prev.conclusion.endsWith(".") ? " " : ". ") +
              text
            : text,
        }));
      }
    };

    window.addEventListener(
      "add-conclusion-text",
      handleAddText as EventListener,
    );

    return () => {
      window.removeEventListener(
        "add-conclusion-text",
        handleAddText as EventListener,
      );
    };
  }, []);

  const handleConclusionFocus = () => {
    conclusionFocus.handleFocus();
  };

  const handleConclusionBlur = () => {
    conclusionFocus.handleBlur();
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Желчный пузырь
      </h3>

      {/* Размеры */}
      <Fieldset title="Размеры">
        <SizeRow
          label="Длина (мм)"
          value={form.length}
          onChange={val => updateField("length", val)}
          focus={lengthFocus}
          range={normalRanges.gallbladder.length}
        />

        <SizeRow
          label="Ширина (мм)"
          value={form.width}
          onChange={val => updateField("width", val)}
          focus={widthFocus}
          range={normalRanges.gallbladder.width}
        />
      </Fieldset>

      {/* Размеры стенки */}
      <Fieldset title="Размеры стенки">
        <SizeRow
          label="Толщина стенки (мм)"
          value={form.wallThickness}
          onChange={val => updateField("wallThickness", val)}
          focus={wallThicknessFocus}
          range={normalRanges.gallbladder.wallThickness}
        />
      </Fieldset>

      {/* Форма */}
      <Fieldset title="Форма">
        <div className="space-y-2">
          <label className={labelClasses}>
            Форма желчного пузыря
            <select
              className={inputClasses}
              value={form.shape}
              onChange={e => updateField("shape", e.target.value)}
            >
              <option value="" />
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
              <option value="" />
              <option value="шейка">шейка</option>
              <option value="тело">тело</option>
              <option value="дно">дно</option>
            </select>
          </label>
        </div>
      </Fieldset>

      {/* Содержимое */}
      <Fieldset title="Содержимое">
        <div className="space-y-2">
          <label className={labelClasses}>
            Тип содержимого
            <select
              className={inputClasses}
              value={form.contentType}
              onChange={e => updateField("contentType", e.target.value)}
            >
              <option value="" />
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
                      onChange={e =>
                        updateConcretion(index, "size", e.target.value)
                      }
                    />
                  </label>

                  <label className="flex-1">
                    <span className="text-xs text-gray-500">Положение</span>
                    <select
                      className={`${inputClasses} text-xs py-1`}
                      value={concretion.position}
                      onChange={e =>
                        updateConcretion(index, "position", e.target.value)
                      }
                    >
                      <option value="" />
                      <option value="проксимальная треть">проксимальная треть</option>
                      <option value="средняя треть">средняя треть</option>
                      <option value="дистальная треть">дистальная треть</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                    onClick={() => removeConcretion(index)}
                    title="Удалить"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
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
                      onChange={e =>
                        updatePolyp(index, "size", e.target.value)
                      }
                    />
                  </label>

                  <label className="flex-1">
                    <span className="text-xs text-gray-500">Положение</span>
                    <select
                      className={`${inputClasses} text-xs py-1`}
                      value={polyp.position}
                      onChange={e =>
                        updatePolyp(index, "position", e.target.value)
                      }
                    >
                      <option value="" />
                      <option value="проксимальная треть">проксимальная треть</option>
                      <option value="средняя треть">средняя треть</option>
                      <option value="дистальная треть">дистальная треть</option>
                    </select>
                  </label>

                  <button
                    type="button"
                    className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                    onClick={() => removePolyp(index)}
                    title="Удалить"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
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
      </Fieldset>

      {/* Протоки */}
      <Fieldset title="Протоки">
        <SizeRow
          label="Пузырный проток (мм)"
          value={form.cysticDuct}
          onChange={val => updateField("cysticDuct", val)}
          focus={cysticDuctFocus}
          range={normalRanges.gallbladder.cysticDuct}
        />

        <SizeRow
          label="Общий желчный проток (мм)"
          value={form.commonBileDuct}
          onChange={val => updateField("commonBileDuct", val)}
          focus={commonBileDuctFocus}
          range={normalRanges.gallbladder.commonBileDuct}
        />
      </Fieldset>

      {/* Дополнительно */}
      <Fieldset title="Дополнительно">
        <div>
          <textarea
            rows={3}
            className={inputClasses + " resize-y"}
            value={form.additional}
            onChange={e => updateField("additional", e.target.value)}
          />
        </div>
      </Fieldset>

      {/* Заключение */}
      <Fieldset title="Заключение">
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
      </Fieldset>
    </div>
  );
};

export default Gallbladder;
