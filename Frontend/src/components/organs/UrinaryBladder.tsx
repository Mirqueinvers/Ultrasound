import React from "react";
import { Fieldset, normalRanges, SizeRow } from "@common";
import { useFormState, useFieldFocus } from "@hooks";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { UrinaryBladderProtocol, UrinaryBladderProps } from "@types";
import { defaultUrinaryBladderState } from "@types";

export const UrinaryBladder: React.FC<UrinaryBladderProps> = ({
  value,
  onChange,
}) => {
  // Используем кастомный хук для управления состоянием формы
  const [form, setForm] = useFormState<UrinaryBladderProtocol>(
    defaultUrinaryBladderState,
    value,
  );

  // Создаём фокусы для всех полей с размерами
  const lengthFocus = useFieldFocus("urinaryBladder", "length");
  const widthFocus = useFieldFocus("urinaryBladder", "width");
  const depthFocus = useFieldFocus("urinaryBladder", "depth");
  const volumeFocus = useFieldFocus("urinaryBladder", "volume");
  const wallThicknessFocus = useFieldFocus("urinaryBladder", "wallThickness");
  const residualLengthFocus = useFieldFocus("urinaryBladder", "residualLength");
  const residualWidthFocus = useFieldFocus("urinaryBladder", "residualWidth");
  const residualDepthFocus = useFieldFocus("urinaryBladder", "residualDepth");
  const residualVolumeFocus = useFieldFocus("urinaryBladder", "residualVolume");

  // Кастомная функция обновления с автоматическим расчетом объема
  const updateField = (field: keyof UrinaryBladderProtocol, val: string) => {
    const updated: UrinaryBladderProtocol = { ...form, [field]: val };

    // Пересчет объема основного мочевого пузыря
    if (field === "length" || field === "width" || field === "depth") {
      const length = parseFloat(
        field === "length" ? val : updated.length || "0",
      );
      const width = parseFloat(
        field === "width" ? val : updated.width || "0",
      );
      const depth = parseFloat(
        field === "depth" ? val : updated.depth || "0",
      );

      if (length > 0 && width > 0 && depth > 0) {
        const volume = (length * width * depth * 0.523) / 1000;
        updated.volume = volume.toFixed(0); // целое значение мл
      } else {
        updated.volume = "";
      }
    }

    // Пересчет объема остаточной мочи
    if (
      field === "residualLength" ||
      field === "residualWidth" ||
      field === "residualDepth"
    ) {
      const length = parseFloat(
        field === "residualLength" ? val : updated.residualLength || "0",
      );
      const width = parseFloat(
        field === "residualWidth" ? val : updated.residualWidth || "0",
      );
      const depth = parseFloat(
        field === "residualDepth" ? val : updated.residualDepth || "0",
      );

      if (length > 0 && width > 0 && depth > 0) {
        const volume = (length * width * depth * 0.523) / 1000;
        updated.residualVolume = volume.toFixed(0);
      } else {
        updated.residualVolume = "";
      }
    }

    // Если содержимое однородное – очищаем описание
    if (field === "contents" && val === "однородное") {
      updated.contentsText = "";
    }

    setForm(updated);
    onChange?.(updated);
  };

  const ranges = normalRanges.urinaryBladder;

  const showContentsText = form.contents === "неоднородное";

  // Создаём пустой range для полей без валидации (можно определить в normalRanges если нужно)
  const emptyRange = { min: 0, max: 999999, unit: "мм" };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Мочевой пузырь
      </h3>

      <Fieldset title="Размеры">
        <SizeRow
          label="Длина (мм)"
          value={form.length}
          onChange={val => updateField("length", val)}
          focus={lengthFocus}
          range={emptyRange}
        />

        <SizeRow
          label="Ширина (мм)"
          value={form.width}
          onChange={val => updateField("width", val)}
          focus={widthFocus}
          range={emptyRange}
        />

        <SizeRow
          label="Передне-задний (мм)"
          value={form.depth}
          onChange={val => updateField("depth", val)}
          focus={depthFocus}
          range={emptyRange}
        />

        <SizeRow
          label="Объем (мл)"
          value={form.volume}
          onChange={val => updateField("volume", val)}
          focus={volumeFocus}
          range={emptyRange}
          readOnly={true}
        />

        <SizeRow
          label="Толщина стенки (мм)"
          value={form.wallThickness}
          onChange={val => updateField("wallThickness", val)}
          focus={wallThicknessFocus}
          range={ranges.wallThickness}
        />
      </Fieldset>

      {/* Объем остаточной мочи */}
      <Fieldset title="Объем остаточной мочи">
        <SizeRow
          label="Длина (мм)"
          value={form.residualLength}
          onChange={val => updateField("residualLength", val)}
          focus={residualLengthFocus}
          range={emptyRange}
        />

        <SizeRow
          label="Ширина (мм)"
          value={form.residualWidth}
          onChange={val => updateField("residualWidth", val)}
          focus={residualWidthFocus}
          range={emptyRange}
        />

        <SizeRow
          label="Передне-задний (мм)"
          value={form.residualDepth}
          onChange={val => updateField("residualDepth", val)}
          focus={residualDepthFocus}
          range={emptyRange}
        />

        <SizeRow
          label="Объем остаточной мочи (мл)"
          value={form.residualVolume}
          onChange={val => updateField("residualVolume", val)}
          focus={residualVolumeFocus}
          range={ranges.residualVolume}
          readOnly={true}
        />
      </Fieldset>

      {/* Содержимое */}
      <Fieldset title="Содержимое">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            Характер содержимого
          </label>
          <div className="flex flex-wrap gap-2">
            {["однородное", "неоднородное"].map((option) => (
              <button
                key={option}
                onClick={() => updateField("contents", option)}
                className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
                  form.contents === option
                    ? "bg-blue-500 text-white"
                    : "bg-slate-200 text-slate-700 hover:bg-slate-300"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {showContentsText && (
          <div className="mt-4">
            <label className={labelClasses}>
              Описание содержимого
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                value={form.contentsText}
                onChange={e => updateField("contentsText", e.target.value)}
              />
            </label>
          </div>
        )}
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
    </div>
  );
};

export default UrinaryBladder;
export type { UrinaryBladderProtocol } from "@types";