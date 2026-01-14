import React from "react";
import { normalRanges } from "@common";
import { SizeRow, Fieldset, ButtonSelect, SelectWithTextarea } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldFocus, useConclusion } from "@hooks";
import { inputClasses } from "@utils/formClasses";
import type { LiverProtocol, HepatProps } from "@types";
import { defaultLiverState } from "@types";

export const Hepat: React.FC<HepatProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<LiverProtocol>(defaultLiverState, value);

  useConclusion(setForm, "liver");

  const rightLobeFocus = useFieldFocus("liver", "rightLobeAP");
  const leftLobeFocus = useFieldFocus("liver", "leftLobeAP");
  const portalVeinFocus = useFieldFocus("liver", "portalVeinDiameter");
  const ivcFocus = useFieldFocus("liver", "ivc");

  const rightLobeCCRFocus = useFieldFocus("liver", "rightLobeCCR");
  const rightLobeCVRFocus = useFieldFocus("liver", "rightLobeCVR");
  const leftLobeCCRFocus = useFieldFocus("liver", "leftLobeCCR");
  const rightLobeTotalFocus = useFieldFocus("liver", "rightLobeTotal");
  const leftLobeTotalFocus = useFieldFocus("liver", "leftLobeTotal");

  const updateField = (field: keyof LiverProtocol, val: string) => {
    const updated: LiverProtocol = { ...form, [field]: val };

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

  return (
    <ResearchSectionCard title="Печень" headerClassName="bg-sky-500">
      <div className="flex flex-col gap-6">
        {/* Размеры */}
        <Fieldset title="Размеры">
          <SizeRow
            label="Правая доля, ПЗР (мм)"
            value={form.rightLobeAP}
            onChange={(val) => updateField("rightLobeAP", val)}
            focus={rightLobeFocus}
            range={normalRanges.liver.rightLobeAP}
          />

          <SizeRow
            label="Левая доля, ПЗР (мм)"
            value={form.leftLobeAP}
            onChange={(val) => updateField("leftLobeAP", val)}
            focus={leftLobeFocus}
            range={normalRanges.liver.leftLobeAP}
          />

          {showRightLobeAdditional && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h5 className="text-xs font-semibold text-amber-800 mb-3">
                ⚠️ ПЗР правой доли превышает норму — дополнительные измерения:
              </h5>

              <SizeRow
                label="Правая доля, ККР (мм)"
                value={form.rightLobeCCR}
                onChange={(val) => updateField("rightLobeCCR", val)}
                focus={rightLobeCCRFocus}
                range={normalRanges.liver.rightLobeCCR}
              />

              <SizeRow
                label="Правая доля, КВР (мм)"
                value={form.rightLobeCVR}
                onChange={(val) => updateField("rightLobeCVR", val)}
                focus={rightLobeCVRFocus}
                range={normalRanges.liver.rightLobeCVR}
              />

              <SizeRow
                label="Правая доля, ККР + ПЗР (мм)"
                value={form.rightLobeTotal}
                onChange={(val) => updateField("rightLobeTotal", val)}
                focus={rightLobeTotalFocus}
                range={normalRanges.liver.rightLobeTotal}
                readOnly={true}
              />
            </div>
          )}

          {showLeftLobeAdditional && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h5 className="text-xs font-semibold text-amber-800 mb-3">
                ⚠️ ПЗР левой доли превышает норму — дополнительные измерения:
              </h5>

              <SizeRow
                label="Левая доля, ККР (мм)"
                value={form.leftLobeCCR}
                onChange={(val) => updateField("leftLobeCCR", val)}
                focus={leftLobeCCRFocus}
                range={normalRanges.liver.leftLobeCCR}
              />

              <SizeRow
                label="Левая доля, ККР + ПЗР (мм)"
                value={form.leftLobeTotal}
                onChange={(val) => updateField("leftLobeTotal", val)}
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
              { value: "средняя", label: "средняя" },
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
              { value: "четкий,ровный", label: "четкий, ровный" },
              { value: "четкий, неровнй", label: "четкий, неровный" },
              { value: "бугристый", label: "бугристый" },
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
            onSelectChange={(val) => updateField("focalLesionsPresence", val)}
            onTextareaChange={(val) => updateField("focalLesions", val)}
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
            onChange={(val) => updateField("portalVeinDiameter", val)}
            focus={portalVeinFocus}
            range={normalRanges.liver.portalVeinDiameter}
          />

          <SizeRow
            label="Нижняя полая вена, диаметр (мм)"
            value={form.ivc}
            onChange={(val) => updateField("ivc", val)}
            focus={ivcFocus}
            range={normalRanges.liver.ivc}
          />
        </Fieldset>

        {/* Дополнительно */}
        <Fieldset title="Дополнительно">
          <textarea
            rows={3}
            className={inputClasses + " resize-y"}
            value={form.additional}
            onChange={(e) => updateField("additional", e.target.value)}
          />
        </Fieldset>
      </div>
    </ResearchSectionCard>
  );
};

export default Hepat;
export type { LiverProtocol } from "@types";
