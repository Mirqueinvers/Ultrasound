import React, { useState } from "react";
import { Fieldset } from "../common/Fieldset";
import { inputClasses, labelClasses } from "../common/formClasses";

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

  const showContentsText = form.contents === "неоднородное";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Мочевой пузырь
      </h3>

      <Fieldset title="Размеры">
        <div>
          <label className={labelClasses}>
            Длина (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.length}
              onChange={e => updateField("length", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Ширина (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.width}
              onChange={e => updateField("width", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Передне-задний (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.depth}
              onChange={e => updateField("depth", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Объем (мл)
            <input
              type="text"
              className={inputClasses + " bg-gray-100"}
              value={form.volume}
              readOnly
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Толщина стенки (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.wallThickness}
              onChange={e => updateField("wallThickness", e.target.value)}
            />
          </label>
        </div>
      </Fieldset>

      {/* Объем остаточной мочи */}
      <Fieldset title="Объем остаточной мочи">
        <div>
          <label className={labelClasses}>
            Длина (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.residualLength}
              onChange={e => updateField("residualLength", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Ширина (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.residualWidth}
              onChange={e => updateField("residualWidth", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Передне-задний (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.residualDepth}
              onChange={e => updateField("residualDepth", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Объем остаточной мочи (мл)
            <input
              type="text"
              className={inputClasses + " bg-gray-100"}
              value={form.residualVolume}
              readOnly
            />
          </label>
        </div>
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
