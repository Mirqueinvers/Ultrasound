import React, { useEffect } from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { useFieldUpdate, useFormState } from "@hooks";
import { inputClasses, labelClasses } from "@utils/formClasses";
import { BreastSide } from "./BreastSide";
import type { BreastCommonProps, BreastProtocol } from "@types";
import { defaultBreastState } from "@/types/defaultStates";

const STRUCTURE_OPTIONS = [
  { value: "преимущественно жировая ткань", label: "преимущественно жировая ткань" },
  { value: "преимущественно железистая ткань", label: "преимущественно железистая ткань" },
  { value: "жировая и железистая", label: "жировая и железистая" },
  { value: "жировая и фиброзная", label: "жировая и фиброзная" },
  { value: "жировая железистая и фиброзная", label: "жировая железистая и фиброзная" },
];

const BreastCommon: React.FC<BreastCommonProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const initialValue: BreastProtocol = {
    ...defaultBreastState,
    ...(value || {}),
  };

  const [form, setForm] = useFormState<BreastProtocol>(initialValue);

  useEffect(() => {
    setForm({
      ...defaultBreastState,
      ...(value || {}),
    });
  }, [value, setForm]);

  const updateField = useFieldUpdate(form, setForm, onChange);


  useEffect(() => {
    if (!form.lastMenstruationDate) {
      if (form.cycleDay) {
        updateField("cycleDay", "");
      }
      return;
    }

    const parsed = new Date(form.lastMenstruationDate);
    if (Number.isNaN(parsed.getTime())) {
      if (form.cycleDay) {
        updateField("cycleDay", "");
      }
      return;
    }

    const diffTime = Date.now() - parsed.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const nextCycleDay = diffDays > 0 ? String(diffDays) : "";

    if (nextCycleDay !== form.cycleDay) {
      updateField("cycleDay", nextCycleDay);
    }
  }, [form.lastMenstruationDate, form.cycleDay]);

  return (
    <div className="flex flex-col gap-6">
      <Fieldset title="Общая информация">
        <label className={labelClasses + " w-full"}>
          Дата последней менструации
          <input
            type="date"
            className={inputClasses}
            value={form.lastMenstruationDate}
            onChange={(e) => updateField("lastMenstruationDate", e.target.value)}
          />
        </label>

        <label className={labelClasses + " w-full"}>
          День цикла
          <input
            type="text"
            className={`${inputClasses} bg-gray-50`}
            value={form.cycleDay || ""}
            readOnly
            disabled
            placeholder="Рассчитывается автоматически"
          />
        </label>

        <ButtonSelect
          label="Структура молочных желез"
          value={form.structure}
          onChange={(val) => updateField("structure", val)}
          options={STRUCTURE_OPTIONS}
        />
      </Fieldset>

      <div ref={sectionRefs?.["Молочные железы:правая железа"]}>
        <BreastSide
          side="right"
          value={form.rightBreast}
          onChange={(nextValue) => {
            const draft: BreastProtocol = { ...form, rightBreast: nextValue };
            setForm(draft);
            onChange?.(draft);
          }}
        />
      </div>

      <div ref={sectionRefs?.["Молочные железы:левая железа"]}>
        <BreastSide
          side="left"
          value={form.leftBreast}
          onChange={(nextValue) => {
            const draft: BreastProtocol = { ...form, leftBreast: nextValue };
            setForm(draft);
            onChange?.(draft);
          }}
        />
      </div>
    </div>
  );
};

export default BreastCommon;




