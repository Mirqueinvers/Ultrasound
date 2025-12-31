// Frontend/src/components/organs/thyroid/ThyroidCommon.tsx
import React, { useEffect } from "react";
import { Fieldset, ButtonSelect } from "@components/common";
import { useFormState, useFieldUpdate } from "@hooks";
import { ThyroidLobe } from "./ThyroidLobe";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { ThyroidProtocol, ThyroidLobeProtocol } from "@types";
import { defaultThyroidState } from "@types";

interface ThyroidCommonProps {
  value?: ThyroidProtocol;
  onChange?: (value: ThyroidProtocol) => void;
}

export const ThyroidCommon: React.FC<ThyroidCommonProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<ThyroidProtocol>(
    defaultThyroidState,
    value
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  // Автоматический расчет общего объема
  useEffect(() => {
    const rightVolume = parseFloat(form.rightLobe.volume) || 0;
    const leftVolume = parseFloat(form.leftLobe.volume) || 0;
    const total = (rightVolume + leftVolume).toFixed(2);

    if (form.totalVolume !== total) {
      const draft = { ...form, totalVolume: total };
      setForm(draft);
      onChange?.(draft);
    }
  }, [form.rightLobe.volume, form.leftLobe.volume]);

  // Автоматический расчет соотношения правой доли к левой
  useEffect(() => {
    const rightVolume = parseFloat(form.rightLobe.volume) || 0;
    const leftVolume = parseFloat(form.leftLobe.volume) || 0;

    if (rightVolume > 0 && leftVolume > 0) {
      const ratio = (rightVolume / leftVolume).toFixed(2);
      if (form.rightToLeftRatio !== ratio) {
        const draft = { ...form, rightToLeftRatio: ratio };
        setForm(draft);
        onChange?.(draft);
      }
    } else if (form.rightToLeftRatio !== "") {
      const draft = { ...form, rightToLeftRatio: "" };
      setForm(draft);
      onChange?.(draft);
    }
  }, [form.rightLobe.volume, form.leftLobe.volume]);

  const handleLobeChange = (side: "right" | "left") => (
    value: ThyroidLobeProtocol
  ) => {
    const draft = {
      ...form,
      [side === "right" ? "rightLobe" : "leftLobe"]: value,
    };
    setForm(draft);
    onChange?.(draft);
  };

  return (
    <div className="flex flex-col gap-6">
      <ThyroidLobe
        side="right"
        value={form.rightLobe}
        onChange={handleLobeChange("right")}
      />

      <ThyroidLobe
        side="left"
        value={form.leftLobe}
        onChange={handleLobeChange("left")}
      />

      <Fieldset title="Перешеек">
        <div>
          <label className={labelClasses}>
            Размер перешейка (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.isthmusSize}
              onChange={(e) => updateField("isthmusSize", e.target.value)}
            />
          </label>
        </div>
      </Fieldset>

      <Fieldset title="Общие показатели">
        <div>
          <label className={labelClasses}>
            Общий объем щитовидной железы (мл)
            <input
              type="text"
              className={inputClasses + " bg-gray-100"}
              value={form.totalVolume}
              readOnly
              disabled
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Соотношение правой доли к левой
            <input
              type="text"
              className={inputClasses + " bg-gray-100"}
              value={form.rightToLeftRatio}
              readOnly
              disabled
            />
          </label>
        </div>

        <ButtonSelect
          label="Эхогенность железы"
          value={form.echogenicity}
          onChange={(val) => updateField("echogenicity", val)}
          options={[
            { value: "средняя", label: "средняя" },
            { value: "повышенная", label: "повышенная" },
            { value: "пониженная", label: "пониженная" },
          ]}
        />

        <ButtonSelect
          label="Эхоструктура"
          value={form.echostructure}
          onChange={(val) => updateField("echostructure", val)}
          options={[
            { value: "однородная", label: "однородная" },
            { value: "диффузно-неоднородная", label: "диффузно-неоднородная" },
          ]}
        />

        <ButtonSelect
          label="Контур"
          value={form.contour}
          onChange={(val) => updateField("contour", val)}
          options={[
            { value: "четкий ровный", label: "четкий ровный" },
            { value: "четкий не ровный", label: "четкий не ровный" },
            { value: "не четкий", label: "не четкий" },
          ]}
        />

        <ButtonSelect
          label="Симметричность"
          value={form.symmetry}
          onChange={(val) => updateField("symmetry", val)}
          options={[
            { value: "сохранена", label: "сохранена" },
            { value: "ассиметричная", label: "ассиметричная" },
          ]}
        />

        <ButtonSelect
          label="Положение"
          value={form.position}
          onChange={(val) => updateField("position", val)}
          options={[
            { value: "обычное", label: "обычное" },
            { value: "правосторонняя гемитиреоидэктомия", label: "правосторонняя гемитиреоидэктомия" },
            { value: "левосторонняя гемитиреоидэктомия", label: "левосторонняя гемитиреоидэктомия" },
            { value: "резекция щитовидной железы", label: "резекция щитовидной железы" },
          ]}
        />
      </Fieldset>
    </div>
  );
};

export default ThyroidCommon;
export type { ThyroidProtocol } from "@types";
