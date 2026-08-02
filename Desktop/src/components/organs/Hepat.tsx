import React from "react";
import { normalRanges } from "@common";
import { SizeRow, Fieldset, ButtonSelect, SelectWithTextarea } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFieldFocus } from "@hooks";
import { useHepat } from "@hooks/organs/useHepat";
import { inputClasses } from "@utils/formClasses";
import { DETECTION_OPTIONS } from "@utils/constants";
import type { HepatProps } from "@types";

export const Hepat: React.FC<HepatProps> = ({ value, onChange }) => {
  const { form, updateFieldWithTotals } = useHepat(value, onChange);

  const rightLobeFocus = useFieldFocus("liver", "rightLobeAP");
  const leftLobeFocus = useFieldFocus("liver", "leftLobeAP");
  const portalVeinFocus = useFieldFocus("liver", "portalVeinDiameter");
  const ivcFocus = useFieldFocus("liver", "ivc");

  const rightLobeCCRFocus = useFieldFocus("liver", "rightLobeCCR");
  const rightLobeCVRFocus = useFieldFocus("liver", "rightLobeCVR");
  const leftLobeCCRFocus = useFieldFocus("liver", "leftLobeCCR");
  const rightLobeTotalFocus = useFieldFocus("liver", "rightLobeTotal");
  const leftLobeTotalFocus = useFieldFocus("liver", "leftLobeTotal");

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
    <ResearchSectionCard title="Печень">
      <div className="flex flex-col gap-6">
        {/* Размеры */}
        <Fieldset title="Размеры">
          <SizeRow
            label="Правая доля, ПЗР (мм)"
            value={form.rightLobeAP}
            onChange={(val) => updateFieldWithTotals("rightLobeAP", val)}
            focus={rightLobeFocus}
            range={normalRanges.liver.rightLobeAP}
          />

          <SizeRow
            label="Левая доля, ПЗР (мм)"
            value={form.leftLobeAP}
            onChange={(val) => updateFieldWithTotals("leftLobeAP", val)}
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
                onChange={(val) => updateFieldWithTotals("rightLobeCCR", val)}
                focus={rightLobeCCRFocus}
                range={normalRanges.liver.rightLobeCCR}
              />

              <SizeRow
                label="Правая доля, КВР (мм)"
                value={form.rightLobeCVR}
                onChange={(val) => updateFieldWithTotals("rightLobeCVR", val)}
                focus={rightLobeCVRFocus}
                range={normalRanges.liver.rightLobeCVR}
              />

              <SizeRow
                label="Правая доля, ККР + ПЗР (мм)"
                value={form.rightLobeTotal}
                onChange={(val) => updateFieldWithTotals("rightLobeTotal", val)}
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
                onChange={(val) => updateFieldWithTotals("leftLobeCCR", val)}
                focus={leftLobeCCRFocus}
                range={normalRanges.liver.leftLobeCCR}
              />

              <SizeRow
                label="Левая доля, ККР + ПЗР (мм)"
                value={form.leftLobeTotal}
                onChange={(val) => updateFieldWithTotals("leftLobeTotal", val)}
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
            onChange={(val) => updateFieldWithTotals("echogenicity", val)}
            options={[
              { value: "средняя", label: "средняя" },
              { value: "повышена", label: "повышена" },
              { value: "снижена", label: "снижена" },
            ]}
          />

          <ButtonSelect
            label="Эхоструктура"
            value={form.homogeneity}
            onChange={(val) => updateFieldWithTotals("homogeneity", val)}
            options={[
              { value: "однородная", label: "однородная" },
              { value: "неоднородная", label: "неоднородная" },
              { value: "диффузно-неоднородная", label: "диффузно-неоднородная" },
            ]}
          />

          <ButtonSelect
            label="Контур"
            value={form.contours}
            onChange={(val) => updateFieldWithTotals("contours", val)}
            options={[
              { value: "четкий, ровный", label: "четкий, ровный" },
              { value: "четкий, неровный", label: "четкий, неровный" },
              { value: "бугристый", label: "бугристый" },
            ]}
          />
          <ButtonSelect
            label="Угол нижнего края"
            value={form.lowerEdgeAngle}
            onChange={(val) => updateFieldWithTotals("lowerEdgeAngle", val)}
            options={[
              { value: "заострён", label: "заострён" },
              { value: "закруглён", label: "закруглён" },
            ]}
          />

          <SelectWithTextarea
            label="Патологические образования"
            selectValue={form.focalLesionsPresence}
            textareaValue={form.focalLesions}
            onSelectChange={(val) => updateFieldWithTotals("focalLesionsPresence", val)}
            onTextareaChange={(val) => updateFieldWithTotals("focalLesions", val)}
            options={[...DETECTION_OPTIONS]}
            triggerValue="определяются"
            textareaLabel="Описание патологических образований"
          />
        </Fieldset>

        {/* Сосуды */}
        <Fieldset title="Сосуды">
          <ButtonSelect
            label="Сосудистый рисунок"
            value={form.vascularPattern}
            onChange={(val) => updateFieldWithTotals("vascularPattern", val)}
            options={[
              { value: "не изменен", label: "не изменен" },
              { value: "обеднен", label: "обеднен" },
              { value: "усилен", label: "усилен" },
            ]}
          />

          <SizeRow
            label="Воротная вена, диаметр (мм)"
            value={form.portalVeinDiameter}
            onChange={(val) => updateFieldWithTotals("portalVeinDiameter", val)}
            focus={portalVeinFocus}
            range={normalRanges.liver.portalVeinDiameter}
          />

          <SizeRow
            label="Нижняя полая вена, диаметр (мм)"
            value={form.ivc}
            onChange={(val) => updateFieldWithTotals("ivc", val)}
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
            onChange={(e) => updateFieldWithTotals("additional", e.target.value)}
          />
        </Fieldset>
      </div>
    </ResearchSectionCard>
  );
};

export default Hepat;
export type { LiverProtocol } from "@types";