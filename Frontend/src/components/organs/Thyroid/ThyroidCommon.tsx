// Frontend/src/components/organs/Thyroid/ThyroidCommon.tsx
import React, { useEffect } from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate } from "@hooks";
import { ThyroidLobe } from "./ThyroidLobe";
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
      {/* Правая доля */}
      <ResearchSectionCard title="Правая доля" headerClassName="bg-sky-500">
        <ThyroidLobe
          side="right"
          value={form.rightLobe}
          onChange={handleLobeChange("right")}
        />
      </ResearchSectionCard>

      {/* Левая доля */}
      <ResearchSectionCard title="Левая доля" headerClassName="bg-sky-500">
        <ThyroidLobe
          side="left"
          value={form.leftLobe}
          onChange={handleLobeChange("left")}
        />
      </ResearchSectionCard>

      {/* Перешеек */}
      <ResearchSectionCard title="Перешеек" headerClassName="bg-sky-500">
        <Fieldset title="">
          <div className="max-w-[400px]">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Размер перешейка (мм)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={form.isthmusSize}
              onChange={(e) => updateField("isthmusSize", e.target.value)}
              placeholder="Введите размер"
            />
          </div>
        </Fieldset>
      </ResearchSectionCard>

      {/* Общие показатели */}
      <ResearchSectionCard title="Общие показатели" headerClassName="bg-sky-500">
        <Fieldset title="">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
              <label className="block text-xs font-medium text-sky-700 mb-2">
                Общий объем (мл)
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-sky-300 rounded-lg text-sky-900 font-semibold"
                value={form.totalVolume}
                readOnly
                disabled
              />
            </div>

            <div className="bg-sky-50 rounded-xl p-4 border border-sky-200">
              <label className="block text-xs font-medium text-sky-700 mb-2">
                Соотношение правой к левой
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-white border border-sky-300 rounded-lg text-sky-900 font-semibold"
                value={form.rightToLeftRatio}
                readOnly
                disabled
              />
            </div>
          </div>

          <div className="space-y-4">
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
          </div>
        </Fieldset>
      </ResearchSectionCard>
    </div>
  );
};

export default ThyroidCommon;
export type { ThyroidProtocol } from "@types";
