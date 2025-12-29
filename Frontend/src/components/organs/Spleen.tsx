import React, { useState, useEffect } from "react";
import { normalRanges, SizeRow, Fieldset, SelectWithTextarea, ButtonSelect } from "@common";
import { useFieldFocus } from "@hooks/useFieldFocus";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { SpleenProtocol, SpleenProps } from "@types";
import { defaultSpleenState } from "@types";

export const Spleen: React.FC<SpleenProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<SpleenProtocol>(value ?? defaultSpleenState);

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
        <SizeRow
          label="Длина (мм)"
          value={form.length}
          onChange={val => updateField("length", val)}
          focus={lengthFocus}
          range={normalRanges.spleen.length}
        />

        <SizeRow
          label="Ширина (мм)"
          value={form.width}
          onChange={val => updateField("width", val)}
          focus={widthFocus}
          range={normalRanges.spleen.width}
        />
      </Fieldset>

      {/* Структура */}
      <Fieldset title="Структура">
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
          value={form.contours}
          onChange={(val) => updateField("contours", val)}
          options={[
            { value: "ровные", label: "четкий, ровный" },
            { value: "неровные", label: "четкий, неровный" },
            { value: "бугристые", label: "бугристый" },
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
      </Fieldset>

      {/* Сосуды */}
      <Fieldset title="Сосуды">
        <SizeRow
          label="Селезеночная вена, диаметр (мм)"
          value={form.splenicVein}
          onChange={val => updateField("splenicVein", val)}
          focus={splenicVeinFocus}
          range={normalRanges.spleen.splenicVein}
        />

        <SizeRow
          label="Селезеночная артерия, диаметр (мм)"
          value={form.splenicArtery}
          onChange={val => updateField("splenicArtery", val)}
          focus={splenicArteryFocus}
          range={normalRanges.spleen.splenicArtery}
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
