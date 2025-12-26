import React, { useState, useEffect } from "react";
import { RangeIndicator, normalRanges } from "../common/NormalRange";
import { useFieldFocus } from "../hooks/useFieldFocus";
import { Fieldset } from "../common/Fieldset";
import { inputClasses, labelClasses } from "../common/formClasses";
import { SelectWithTextarea } from "../common/SelectWithTextarea";

export interface SpleenProtocol {
  // Размеры
  length: string; // мм (длина)
  width: string;  // мм (ширина)

  // Структура
  echogenicity: string;              // Эхогенность
  echostructure: string;            // Эхоструктура
  contours: string;                 // Контур
  pathologicalFormations: string;   // Патологические образования
  pathologicalFormationsText: string; // описание, если определяются

  // Сосуды
  splenicVein: string;   // мм (селезеночная вена)
  splenicArtery: string; // мм (селезеночная артерия)

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

  const conclusionFocus = useFieldFocus("spleen", "conclusion");
  const lengthFocus = useFieldFocus("spleen", "spleenLength");
  const widthFocus = useFieldFocus("spleen", "spleenWidth");
  const splenicVeinFocus = useFieldFocus("spleen", "splenicVein");
  const splenicArteryFocus = useFieldFocus("spleen", "splenicArtery");

  const updateField = (field: keyof SpleenProtocol, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    onChange?.(updated);
  };

  useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ } = event.detail;

      if (organ === "spleen") {
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

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Селезенка
      </h3>

      {/* Размеры */}
      <Fieldset title="Размеры">
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
      </Fieldset>

      {/* Структура */}
      <Fieldset title="Структура">
        <div>
          <label className={labelClasses}>
            Эхогенность
            <select
              className={inputClasses}
              value={form.echogenicity}
              onChange={e => updateField("echogenicity", e.target.value)}
            >
              <option value="" />
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
              <option value="" />
              <option value="однородная">однородная</option>
              <option value="неоднородная">неоднородная</option>
              <option value="диффузно-неоднородная">
                диффузно-неоднородная
              </option>
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
              <option value="" />
              <option value="ровные">четкий, ровный</option>
              <option value="неровные">четкий, неровный</option>
              <option value="бугристые">бугристый</option>
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
      </Fieldset>

      {/* Сосуды */}
      <Fieldset title="Сосуды">
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
            rows={4}
            className={inputClasses + " resize-y"}
            value={form.conclusion}
            onChange={e => updateField("conclusion", e.target.value)}
            onFocus={conclusionFocus.handleFocus}
            onBlur={conclusionFocus.handleBlur}
          />
        </div>
      </Fieldset>
    </div>
  );
};

export default Spleen;
