// Frontend/src/components/organs/Breast/BreastCommon.tsx
import React, { useEffect } from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import { useFormState, useFieldUpdate } from "@hooks";
import { BreastSide } from "./BreastSide";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { BreastProtocol, BreastSideProtocol } from "@types";
import { defaultBreastState } from "@types";

interface BreastCommonProps {
  value?: BreastProtocol;
  onChange?: (value: BreastProtocol) => void;
}

export const BreastCommon: React.FC<BreastCommonProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<BreastProtocol>(
    defaultBreastState,
    value
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  useEffect(() => {
    if (!form.lastMenstruationDate) {
      if (form.cycleDay !== "") {
        const draft = { ...form, cycleDay: "" };
        setForm(draft);
        onChange?.(draft);
      }
      return;
    }

    const lastMenstruation = new Date(form.lastMenstruationDate);
    const today = new Date();
    
    if (isNaN(lastMenstruation.getTime())) {
      return;
    }

    const diffTime = today.getTime() - lastMenstruation.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    const cycleDay = (diffDays + 1).toString();

    if (form.cycleDay !== cycleDay) {
      const draft = { ...form, cycleDay };
      setForm(draft);
      onChange?.(draft);
    }
  }, [form.lastMenstruationDate]);

  const handleBreastChange = (side: "right" | "left") => (
    value: BreastSideProtocol
  ) => {
    const draft = {
      ...form,
      [side === "right" ? "rightBreast" : "leftBreast"]: value,
    };
    setForm(draft);
    onChange?.(draft);
  };

  return (
    <div className="flex flex-col gap-6">
      <Fieldset title="Общая информация">
        <div>
          <label className={labelClasses}>
            Дата последней менструации
            <input
              type="date"
              className={inputClasses}
              value={form.lastMenstruationDate}
              onChange={(e) => updateField("lastMenstruationDate", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            День цикла
            <input
              type="text"
              className={inputClasses + " bg-gray-100"}
              value={form.cycleDay}
              readOnly
              disabled
            />
          </label>
        </div>
      </Fieldset>

      <BreastSide
        side="right"
        value={form.rightBreast}
        onChange={handleBreastChange("right")}
      />

      <BreastSide
        side="left"
        value={form.leftBreast}
        onChange={handleBreastChange("left")}
      />

      <Fieldset title="Структура молочных желез">
        <ButtonSelect
          label=""
          value={form.structure}
          onChange={(val) => updateField("structure", val)}
          options={[
            { value: "преимущественно жировая ткань", label: "преимущественно жировая ткань" },
            { value: "преимущественно железистая ткань", label: "преимущественно железистая ткань" },
            { value: "жировая и железистая", label: "жировая и железистая" },
            { value: "жировая и фиброзная", label: "жировая и фиброзная" },
            { value: "жировая железистая и фиброзная", label: "жировая железистая и фиброзная" },
          ]}
        />
      </Fieldset>
    </div>
  );
};

export default BreastCommon;
export type { BreastProtocol } from "@types";
