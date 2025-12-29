import React, { useState, useEffect } from "react";
import { normalRanges, SizeRow, Fieldset, SelectWithTextarea, ButtonSelect } from "@common";
import { useFieldFocus } from "@hooks/useFieldFocus";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { LiverProtocol, HepatProps } from "@types";
import { defaultLiverState } from "@types";

export const Hepat: React.FC<HepatProps> = ({ value, onChange }) => {
  const [form, setForm] = useState<LiverProtocol>(value ?? defaultLiverState);

  const conclusionFocus = useFieldFocus("liver", "conclusion");
  const rightLobeFocus = useFieldFocus("liver", "rightLobeAP");
  const leftLobeFocus = useFieldFocus("liver", "leftLobeAP");
  const portalVeinFocus = useFieldFocus("liver", "portalVeinDiameter");
  const ivcFocus = useFieldFocus("liver", "ivc");

  // дополнительные поля
  const rightLobeCCRFocus = useFieldFocus("liver", "rightLobeCCR");
  const rightLobeCVRFocus = useFieldFocus("liver", "rightLobeCVR");
  const leftLobeCCRFocus = useFieldFocus("liver", "leftLobeCCR");
  const rightLobeTotalFocus = useFieldFocus("liver", "rightLobeTotal");
  const leftLobeTotalFocus = useFieldFocus("liver", "leftLobeTotal");

  const updateField = (field: keyof LiverProtocol, val: string) => {
    const updated: LiverProtocol = { ...form, [field]: val };

    // авторасчет сумм (ККР + ПЗР), только когда оба значения есть
    if (field === "rightLobeAP" || field === "rightLobeCCR") {
      const ap =
        parseFloat(field === "rightLobeAP" ? val : form.rightLobeAP) || 0;
      const ccr =
        parseFloat(field === "rightLobeCCR" ? val : form.rightLobeCCR) || 0;

      updated.rightLobeTotal = ap > 0 && ccr > 0 ? (ccr + ap).toString() : "";
    }

    if (field === "leftLobeAP" || field === "leftLobeCCR") {
      const ap =
        parseFloat(field === "leftLobeAP" ? val : form.leftLobeAP) || 0;
      const ccr =
        parseFloat(field === "leftLobeCCR" ? val : form.leftLobeCCR) || 0;

      updated.leftLobeTotal = ap > 0 && ccr > 0 ? (ccr + ap).toString() : "";
    }

    setForm(updated);
    onChange?.(updated);
  };

  // значения для логики показа доп. полей
  const rightLobeAPValue = parseFloat(form.rightLobeAP) || 0;
  const leftLobeAPValue = parseFloat(form.leftLobeAP) || 0;
  const rightLobeCCRValue = parseFloat(form.rightLobeCCR) || 0;
  const rightLobeCVRValue = parseFloat(form.rightLobeCVR) || 0;
  const rightLobeTotalValue = parseFloat(form.rightLobeTotal) || 0;
  const leftLobeCCRValue = parseFloat(form.leftLobeCCR) || 0;
  const leftLobeTotalValue = parseFloat(form.leftLobeTotal) || 0;

  const normalRightLobeAP = 125;
  const normalLeftLobeAP = 90;
  const normalRightLobeCCR = 140;
  const normalRightLobeCVR = 150;
  const normalRightLobeTotal = 260;
  const normalLeftLobeCCR = 100;
  const normalLeftLobeTotal = 160;

  const showRightLobeAdditional =
    rightLobeAPValue > normalRightLobeAP ||
    rightLobeCCRValue > normalRightLobeCCR ||
    rightLobeCVRValue > normalRightLobeCVR ||
    rightLobeTotalValue > normalRightLobeTotal;

  const showLeftLobeAdditional =
    leftLobeAPValue > normalLeftLobeAP ||
    leftLobeCCRValue > normalLeftLobeCCR ||
    leftLobeTotalValue > normalLeftLobeTotal;

  const handleConclusionFocus = () => {
    conclusionFocus.handleFocus();
  };

  const handleConclusionBlur = () => {
    conclusionFocus.handleBlur();
  };

  // обработчик добавления текста в заключение для печени
  useEffect(() => {
    const handleAddText = (event: CustomEvent) => {
      const { text, organ } = event.detail;

      if (organ === "liver") {
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
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">Печень</h3>

      {/* Размеры */}
      <Fieldset title="Размеры">
        <SizeRow
          label="Правая доля, ПЗР (мм)"
          value={form.rightLobeAP}
          onChange={val => updateField("rightLobeAP", val)}
          focus={rightLobeFocus}
          range={normalRanges.liver.rightLobeAP}
        />

        <SizeRow
          label="Левая доля, ПЗР (мм)"
          value={form.leftLobeAP}
          onChange={val => updateField("leftLobeAP", val)}
          focus={leftLobeFocus}
          range={normalRanges.liver.leftLobeAP}
        />

        {/* Дополнительные размеры правой доли */}
        {showRightLobeAdditional && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h5 className="text-xs font-semibold text-yellow-800 mb-3">
              ⚠️ ПЗР правой доли превышает норму — дополнительные измерения:
            </h5>

            <SizeRow
              label="Правая доля, ККР (мм)"
              value={form.rightLobeCCR}
              onChange={val => updateField("rightLobeCCR", val)}
              focus={rightLobeCCRFocus}
              range={normalRanges.liver.rightLobeCCR}
            />

            <SizeRow
              label="Правая доля, КВР (мм)"
              value={form.rightLobeCVR}
              onChange={val => updateField("rightLobeCVR", val)}
              focus={rightLobeCVRFocus}
              range={normalRanges.liver.rightLobeCVR}
            />

            <SizeRow
              label="Правая доля, ККР + ПЗР (мм)"
              value={form.rightLobeTotal}
              onChange={val => updateField("rightLobeTotal", val)}
              focus={rightLobeTotalFocus}
              range={normalRanges.liver.rightLobeTotal}
              readOnly={true}
            />
          </div>
        )}

        {/* Дополнительные размеры левой доли */}
        {showLeftLobeAdditional && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <h5 className="text-xs font-semibold text-yellow-800 mb-3">
              ⚠️ ПЗР левой доли превышает норму — дополнительные измерения:
            </h5>

            <SizeRow
              label="Левая доля, ККР (мм)"
              value={form.leftLobeCCR}
              onChange={val => updateField("leftLobeCCR", val)}
              focus={leftLobeCCRFocus}
              range={normalRanges.liver.leftLobeCCR}
            />

            <SizeRow
              label="Левая доля, ККР + ПЗР (мм)"
              value={form.leftLobeTotal}
              onChange={val => updateField("leftLobeTotal", val)}
              focus={leftLobeTotalFocus}
              range={normalRanges.liver.leftLobeTotal}
              readOnly={true}
            />
          </div>
        )}
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
          value={form.homogeneity}
          onChange={(val) => updateField("homogeneity", val)}
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

        <ButtonSelect
          label="Угол нижнего края"
          value={form.lowerEdgeAngle}
          onChange={(val) => updateField("lowerEdgeAngle", val)}
          options={[
            { value: "заострён", label: "заострён" },
            { value: "закруглён", label: "закруглён" },
          ]}
        />

        <SelectWithTextarea
          label="Патологические образования"
          selectValue={form.focalLesionsPresence}
          textareaValue={form.focalLesions}
          onSelectChange={val => updateField("focalLesionsPresence", val)}
          onTextareaChange={val => updateField("focalLesions", val)}
          options={[
            { value: "не определяются", label: "не определяются" },
            { value: "определяются", label: "определяются" },
          ]}
          triggerValue="определяются"
          textareaLabel="Описание патологических образований"
        />
      </Fieldset>

      {/* Сосуды */}
      <Fieldset title="Сосуды">
        <ButtonSelect
          label="Сосудистый рисунок"
          value={form.vascularPattern}
          onChange={(val) => updateField("vascularPattern", val)}
          options={[
            { value: "не изменен", label: "не изменен" },
            { value: "обеднен", label: "обеднен" },
            { value: "усилен", label: "усилен" },
          ]}
        />

        <SizeRow
          label="Воротная вена, диаметр (мм)"
          value={form.portalVeinDiameter}
          onChange={val => updateField("portalVeinDiameter", val)}
          focus={portalVeinFocus}
          range={normalRanges.liver.portalVeinDiameter}
        />

        <SizeRow
          label="Нижняя полая вена, диаметр (мм)"
          value={form.ivc}
          onChange={val => updateField("ivc", val)}
          focus={ivcFocus}
          range={normalRanges.liver.ivc}
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
            onFocus={handleConclusionFocus}
            onBlur={handleConclusionBlur}
          />
        </div>
      </Fieldset>
    </div>
  );
};

export default Hepat;

