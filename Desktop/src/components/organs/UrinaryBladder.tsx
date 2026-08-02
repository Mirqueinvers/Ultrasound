// /components/organs/UrinaryBladder.tsx
// Презентационный компонент: вся логика вынесена в hooks/organs/useUrinaryBladder.ts
import React from "react";
import { normalRanges } from "@common";
import { Fieldset, SizeRow, ButtonSelect } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFieldFocus } from "@hooks";
import { useUrinaryBladder } from "@hooks/organs/useUrinaryBladder";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { UrinaryBladderProps } from "@types";

export const UrinaryBladder: React.FC<UrinaryBladderProps> = ({
  value,
  onChange,
}) => {
  const { form, updateField, updateContents } = useUrinaryBladder(value, onChange);

  const lengthFocus = useFieldFocus("urinaryBladder", "length");
  const widthFocus = useFieldFocus("urinaryBladder", "width");
  const depthFocus = useFieldFocus("urinaryBladder", "depth");
  const volumeFocus = useFieldFocus("urinaryBladder", "volume");
  const wallThicknessFocus = useFieldFocus("urinaryBladder", "wallThickness");
  const residualLengthFocus = useFieldFocus("urinaryBladder", "residualLength");
  const residualWidthFocus = useFieldFocus("urinaryBladder", "residualWidth");
  const residualDepthFocus = useFieldFocus("urinaryBladder", "residualDepth");
  const residualVolumeFocus = useFieldFocus("urinaryBladder", "residualVolume");

  const ranges = normalRanges.urinaryBladder;
  const showContentsText = form.contents === "неоднородное";
  const emptyRange = { min: 0, max: 999999, unit: "мм" };

  return (
    <ResearchSectionCard title="Мочевой пузырь">
      <div className="flex flex-col gap-6">
        <Fieldset title="Размеры">
          <SizeRow
            label="Длина (мм)"
            value={form.length}
            onChange={(val) => updateField("length", val)}
            focus={lengthFocus}
            range={emptyRange}
          />

          <SizeRow
            label="Ширина (мм)"
            value={form.width}
            onChange={(val) => updateField("width", val)}
            focus={widthFocus}
            range={emptyRange}
          />

          <SizeRow
            label="Передне-задний (мм)"
            value={form.depth}
            onChange={(val) => updateField("depth", val)}
            focus={depthFocus}
            range={emptyRange}
          />

          <SizeRow
            label="Объем (мл)"
            value={form.volume}
            onChange={(val) => updateField("volume", val)}
            focus={volumeFocus}
            range={emptyRange}
            readOnly={true}
            autoCalculated={true}
            customInputClass="w-full px-4 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-300 rounded-lg font-semibold text-sky-900"
          />

          <SizeRow
            label="Толщина стенки (мм)"
            value={form.wallThickness}
            onChange={(val) => updateField("wallThickness", val)}
            focus={wallThicknessFocus}
            range={ranges.wallThickness}
          />
        </Fieldset>

        {/* Переключатель остаточной мочи */}
        <Fieldset title="Объем остаточной мочи">
          <ButtonSelect
            label="Мочевой пузырь (после микции)"
            value={form.residualStatus ?? ""}
            onChange={(val) => updateField("residualStatus", val)}
            options={[
              { value: "определяется", label: "определяется" },
              { value: "не определяется", label: "не определяется" },
            ]}
          />

          {form.residualStatus === "определяется" && (
            <>
              <SizeRow
                label="Длина (мм)"
                value={form.residualLength}
                onChange={(val) => updateField("residualLength", val)}
                focus={residualLengthFocus}
                range={emptyRange}
              />

              <SizeRow
                label="Ширина (мм)"
                value={form.residualWidth}
                onChange={(val) => updateField("residualWidth", val)}
                focus={residualWidthFocus}
                range={emptyRange}
              />

              <SizeRow
                label="Передне-задний (мм)"
                value={form.residualDepth}
                onChange={(val) => updateField("residualDepth", val)}
                focus={residualDepthFocus}
                range={emptyRange}
              />

              <SizeRow
                label="Объем остаточной мочи (мл)"
                value={form.residualVolume}
                onChange={(val) => updateField("residualVolume", val)}
                focus={residualVolumeFocus}
                range={ranges.residualVolume}
                readOnly={true}
                autoCalculated={true}
                customInputClass="w-full px-4 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-300 rounded-lg font-semibold text-sky-900"
              />
            </>
          )}
        </Fieldset>

        {/* Содержимое */}
        <Fieldset title="Содержимое">
          <ButtonSelect
            label="Характер содержимого"
            value={form.contents ?? ""}
            onChange={(val) => updateContents("contents", val)}
            options={[
              { value: "однородное", label: "однородное" },
              { value: "неоднородное", label: "неоднородное" },
            ]}
          />

          {showContentsText && (
            <div className="mt-4">
              <label className={labelClasses + " w-full"}>
                Описание содержимого
                <textarea
                  rows={3}
                  className={inputClasses + " w-full resize-y"}
                  value={form.contentsText}
                  onChange={(e) => updateContents("contentsText", e.target.value)}
                />
              </label>
            </div>
          )}
        </Fieldset>

        {/* Дополнительно */}
        <Fieldset title="Дополнительно">
          <textarea
            rows={3}
            className={inputClasses + " w-full resize-y"}
            value={form.additional}
            onChange={(e) => updateField("additional", e.target.value)}
          />
        </Fieldset>
      </div>
    </ResearchSectionCard>
  );
};

export default UrinaryBladder;
export type { UrinaryBladderProtocol } from "@types";