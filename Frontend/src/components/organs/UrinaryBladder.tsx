import React, { useState } from "react";
import { Fieldset } from "../common/Fieldset";
import { inputClasses, labelClasses } from "../../utils/formClasses";
import { normalRanges } from "../common/NormalRange";
import { SizeRow } from "../common/SizeRow";
import { useFieldFocus } from "../../hooks/useFieldFocus";

export interface UrinaryBladderProtocol {
  // Размеры до мочеиспускания
  length: string;
  width: string;
  depth: string;
  volume: string; // рассчитывается из length * width * depth * 0.523
  wallThickness: string;

  // Объем остаточной мочи
  residualLength: string;
  residualWidth: string;
  residualDepth: string;
  residualVolume: string; // рассчитывается так же

  // Содержимое
  contents: string;            // однородное / неоднородное
  contentsText: string;        // описание, если неоднородное

  // Дополнительно
  additional: string;
}

interface UrinaryBladderProps {
  value?: UrinaryBladderProtocol;
  onChange?: (value: UrinaryBladderProtocol) => void;
}

const defaultState: UrinaryBladderProtocol = {
  length: "",
  width: "",
  depth: "",
  volume: "",
  wallThickness: "",
  residualLength: "",
  residualWidth: "",
  residualDepth: "",
  residualVolume: "",
  contents: "",
  contentsText: "",
  additional: "",
};

export const UrinaryBladder: React.FC<UrinaryBladderProps> = ({
  value,
  onChange,
}) => {
  const [form, setForm] = useState<UrinaryBladderProtocol>(
    value ?? defaultState,
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

  const updateField = (field: keyof UrinaryBladderProtocol, val: string) => {
    const updated: UrinaryBladderProtocol = { ...form, [field]: val };

    // пересчет объема основного мочевого пузыря
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
        const volume = (length * width * depth * 0.523)/1000;
        updated.volume = volume.toFixed(0); // целое значение мл
      } else {
        updated.volume = "";
      }
    }

    // пересчет объема остаточной мочи
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
        const volume = (length * width * depth * 0.523)/1000;
        updated.residualVolume = volume.toFixed(0);
      } else {
        updated.residualVolume = "";
      }
    }

    // если содержимое однородное – очищаем описание
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
          <label className={labelClasses}>
            Характер содержимого
            <select
              className={inputClasses}
              value={form.contents}
              onChange={e => updateField("contents", e.target.value)}
            >
              <option value="" />
              <option value="однородное">однородное</option>
              <option value="неоднородное">неоднородное</option>
            </select>
          </label>
        </div>

        {showContentsText && (
          <div>
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
