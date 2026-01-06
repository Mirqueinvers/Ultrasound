import React, { useEffect } from "react";
import { normalRanges } from "@components/common";
import { ButtonSelect, Fieldset, SizeRow, SelectWithTextarea } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import {
  useFormState,
  useFieldUpdate,
  useFieldFocus,
  useConclusion,
} from "@hooks";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type {
  TestisProtocol,
  TestisProps,
  SingleTestisProtocol,
} from "@types";
import { defaultTestisState, defaultSingleTestisState } from "@types";

const TestisSide: React.FC<{
  side: "right" | "left";
  value?: SingleTestisProtocol | null;
  onChange: (val: SingleTestisProtocol) => void;
}> = ({ side, value, onChange }) => {
  const initialValue: SingleTestisProtocol = {
    ...defaultSingleTestisState,
    ...(value || {}),
  };

  const [form, setForm] = useFormState<SingleTestisProtocol>(
    initialValue,
    value ?? undefined
  );
  const updateField = useFieldUpdate(form, setForm, onChange);

  const key = side === "right" ? "rightTestis" : "leftTestis";

  useConclusion(setForm, key);

  const lengthFocus = useFieldFocus(key, "length");
  const widthFocus = useFieldFocus(key, "width");
  const depthFocus = useFieldFocus(key, "depth");
  const volumeFocus = useFieldFocus(key, "volume");

  useEffect(() => {
    const length = parseFloat(form.length);
    const width = parseFloat(form.width);
    const depth = parseFloat(form.depth);

    if (
      !isNaN(length) &&
      !isNaN(width) &&
      !isNaN(depth) &&
      length > 0 &&
      width > 0 &&
      depth > 0
    ) {
      const volume = ((length * width * depth * 0.52) / 1000).toFixed(2);
      if (volume !== form.volume) {
        updateField("volume", volume);
      }
    }
  }, [form.length, form.width, form.depth]);

  const title = side === "right" ? "Правое яичко" : "Левое яичко";

  return (
    <ResearchSectionCard title={title} headerClassName="bg-sky-500">
      <div className="flex flex-col gap-6">
        {/* Размеры */}
        <Fieldset title="Размеры">
          <SizeRow
            label="Длина (мм)"
            value={form.length}
            onChange={(val) => updateField("length", val)}
            focus={lengthFocus}
            range={normalRanges.testis?.length}
          />

          <SizeRow
            label="Ширина (мм)"
            value={form.width}
            onChange={(val) => updateField("width", val)}
            focus={widthFocus}
            range={normalRanges.testis?.width}
          />

          <SizeRow
            label="Глубина (мм)"
            value={form.depth}
            onChange={(val) => updateField("depth", val)}
            focus={depthFocus}
            range={normalRanges.testis?.depth}
          />

          <SizeRow
            label="Объем (см³)"
            value={form.volume || ""}
            onChange={() => {}}
            focus={volumeFocus}
            readOnly
            range={normalRanges.testis?.volume}
            autoCalculated={true}
            customInputClass="w-full px-4 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-300 rounded-lg font-semibold text-sky-900"
          />
        </Fieldset>

        {/* Расположение */}
        <Fieldset title="Расположение">
          <ButtonSelect
            label=""
            value={form.location}
            onChange={(val) => updateField("location", val)}
            options={[
              { value: "в мошонке", label: "в мошонке" },
              { value: "не в мошонке", label: "не в мошонке" },
            ]}
          />
        </Fieldset>

        {/* Контур */}
        <Fieldset title="Контур">
          <ButtonSelect
            label=""
            value={form.contour}
            onChange={(val) => updateField("contour", val)}
            options={[
              { value: "четкий ровный", label: "четкий ровный" },
              { value: "четкий неровный", label: "четкий неровный" },
              { value: "нечеткий", label: "нечеткий" },
            ]}
          />
        </Fieldset>

        {/* Капсула */}
        <Fieldset title="Капсула">
          <SelectWithTextarea
            label=""
            selectValue={form.capsule}
            textareaValue={form.capsuleText}
            onSelectChange={(val) => updateField("capsule", val)}
            onTextareaChange={(val) => updateField("capsuleText", val)}
            options={[
              { value: "не изменена", label: "не изменена" },
              { value: "изменена", label: "изменена" },
            ]}
            triggerValue="изменена"
            textareaLabel="Описание"
          />
        </Fieldset>

        {/* Эхогенность */}
        <Fieldset title="Эхогенность">
          <ButtonSelect
            label=""
            value={form.echogenicity}
            onChange={(val) => updateField("echogenicity", val)}
            options={[
              { value: "средняя", label: "средняя" },
              { value: "повышена", label: "повышена" },
              { value: "понижена", label: "понижена" },
            ]}
          />
        </Fieldset>

        {/* Эхоструктура */}
        <Fieldset title="Эхоструктура">
          <SelectWithTextarea
            label=""
            selectValue={form.echotexture}
            textareaValue={form.echotextureText}
            onSelectChange={(val) => updateField("echotexture", val)}
            onTextareaChange={(val) => updateField("echotextureText", val)}
            options={[
              { value: "однородная", label: "однородная" },
              { value: "неоднородная", label: "неоднородная" },
              {
                value: "диффузно-неоднородная",
                label: "диффузно-неоднородная",
              },
            ]}
            triggerValue="неоднородная"
            textareaLabel="Описание"
          />
        </Fieldset>

        {/* Структура средостения */}
        <Fieldset title="Структура средостения">
          <SelectWithTextarea
            label=""
            selectValue={form.mediastinum}
            textareaValue={form.mediastinumText}
            onSelectChange={(val) => updateField("mediastinum", val)}
            onTextareaChange={(val) => updateField("mediastinumText", val)}
            options={[
              { value: "не изменена", label: "не изменена" },
              { value: "изменена", label: "изменена" },
            ]}
            triggerValue="изменена"
            textareaLabel="Описание"
          />
        </Fieldset>

        {/* Кровоток в яичке */}
        <Fieldset title="Кровоток в яичке">
          <ButtonSelect
            label=""
            value={form.bloodFlow}
            onChange={(val) => updateField("bloodFlow", val)}
            options={[
              { value: "не изменен", label: "не изменен" },
              { value: "усилен", label: "усилен" },
              { value: "ослаблен", label: "ослаблен" },
            ]}
          />
        </Fieldset>

        {/* Придаток яичка */}
        <Fieldset title="Придаток яичка">
          <SelectWithTextarea
            label=""
            selectValue={form.appendage}
            textareaValue={form.appendageText}
            onSelectChange={(val) => updateField("appendage", val)}
            onTextareaChange={(val) => updateField("appendageText", val)}
            options={[
              { value: "не изменен", label: "не изменен" },
              { value: "изменен", label: "изменен" },
            ]}
            triggerValue="изменен"
            textareaLabel="Описание"
          />
        </Fieldset>

        {/* Количество жидкости в оболочках */}
        <Fieldset title="Количество жидкости в оболочках">
          <SelectWithTextarea
            label=""
            selectValue={form.fluidAmount}
            textareaValue={form.fluidAmountText}
            onSelectChange={(val) => updateField("fluidAmount", val)}
            onTextareaChange={(val) => updateField("fluidAmountText", val)}
            options={[
              { value: "не изменено", label: "не изменено" },
              { value: "увеличено", label: "увеличено" },
            ]}
            triggerValue="увеличено"
            textareaLabel="Описание"
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

export const Testis: React.FC<TestisProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<TestisProtocol>(
    defaultTestisState,
    value
  );

  const updateRight = (right: SingleTestisProtocol) => {
    const updated: TestisProtocol = { ...form, rightTestis: right };
    setForm(updated);
    onChange?.(updated);
  };

  const updateLeft = (left: SingleTestisProtocol) => {
    const updated: TestisProtocol = { ...form, leftTestis: left };
    setForm(updated);
    onChange?.(updated);
  };

  return (
    <div className="flex flex-col gap-6">
      <TestisSide side="right" value={form.rightTestis} onChange={updateRight} />
      <TestisSide side="left" value={form.leftTestis} onChange={updateLeft} />
    </div>
  );
};

export default Testis;
export type { TestisProtocol } from "@types";
