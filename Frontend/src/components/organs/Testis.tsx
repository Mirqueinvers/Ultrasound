import React, { useEffect } from "react";
import { normalRanges } from "@common";
import { ButtonSelect, Fieldset, SizeRow } from "@/UI";
import {
  useFormState,
  useFieldUpdate,
  useFieldFocus,
  useConclusion,
} from "@hooks";
import { inputClasses } from "@utils/formClasses";
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
  const [form, setForm] = useFormState<SingleTestisProtocol>(
    defaultSingleTestisState,
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
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        {title}
      </h3>

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
        />
      </Fieldset>

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

      <Fieldset title="Контур">
        <ButtonSelect
          label=""
          value={form.contour}
          onChange={(val) => updateField("contour", val)}
          options={[
            { value: "четкий ровный", label: "четкий ровный" },
            { value: "четкий не ровный", label: "четкий не ровный" },
            { value: "не четкий", label: "не четкий" },
          ]}
        />
      </Fieldset>

      <Fieldset title="Капсула">
        <div className="space-y-3">
          <ButtonSelect
            label=""
            value={form.capsule}
            onChange={(val) => updateField("capsule", val)}
            options={[
              { value: "не изменена", label: "не изменена" },
              { value: "изменена", label: "изменена" },
            ]}
          />

          {form.capsule === "изменена" && (
            <label className="block w-full">
              <span className="text-sm text-gray-700">Описание</span>
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.capsuleText}
                onChange={(e) => updateField("capsuleText", e.target.value)}
                placeholder="Опишите изменения капсулы..."
              />
            </label>
          )}
        </div>
      </Fieldset>

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

      <Fieldset title="Эхоструктура">
        <div className="space-y-3">
          <ButtonSelect
            label=""
            value={form.echotexture}
            onChange={(val) => updateField("echotexture", val)}
            options={[
              { value: "однородная", label: "однородная" },
              { value: "неоднородная", label: "неоднородная" },
              {
                value: "диффузно-неоднородная",
                label: "диффузно-неоднородная",
              },
            ]}
          />

          {form.echotexture === "неоднородная" && (
            <label className="block w-full">
              <span className="text-sm text-gray-700">Описание</span>
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.echotextureText}
                onChange={(e) =>
                  updateField("echotextureText", e.target.value)
                }
                placeholder="Опишите характер неоднородности..."
              />
            </label>
          )}
        </div>
      </Fieldset>

      <Fieldset title="Структура средостения">
        <div className="space-y-3">
          <ButtonSelect
            label=""
            value={form.mediastinum}
            onChange={(val) => updateField("mediastinum", val)}
            options={[
              { value: "не изменена", label: "не изменена" },
              { value: "изменена", label: "изменена" },
            ]}
          />

          {form.mediastinum === "изменена" && (
            <label className="block w-full">
              <span className="text-sm text-gray-700">Описание</span>
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.mediastinumText}
                onChange={(e) =>
                  updateField("mediastinumText", e.target.value)
                }
                placeholder="Опишите изменения средостения..."
              />
            </label>
          )}
        </div>
      </Fieldset>

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

      <Fieldset title="Придаток яичка">
        <div className="space-y-3">
          <ButtonSelect
            label=""
            value={form.appendage}
            onChange={(val) => updateField("appendage", val)}
            options={[
              { value: "не изменен", label: "не изменен" },
              { value: "изменен", label: "изменен" },
            ]}
          />

          {form.appendage === "изменен" && (
            <label className="block w-full">
              <span className="text-sm text-gray-700">Описание</span>
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.appendageText}
                onChange={(e) =>
                  updateField("appendageText", e.target.value)
                }
                placeholder="Опишите изменения придатка..."
              />
            </label>
          )}
        </div>
      </Fieldset>

      <Fieldset title="Количество жидкости в оболочках">
        <div className="space-y-3">
          <ButtonSelect
            label=""
            value={form.fluidAmount}
            onChange={(val) => updateField("fluidAmount", val)}
            options={[
              { value: "не изменено", label: "не изменено" },
              { value: "увеличено", label: "увеличено" },
            ]}
          />

          {form.fluidAmount === "увеличено" && (
            <label className="block w-full">
              <span className="text-sm text-gray-700">Описание</span>
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.fluidAmountText}
                onChange={(e) =>
                  updateField("fluidAmountText", e.target.value)
                }
                placeholder="Опишите количество/характер жидкости..."
              />
            </label>
          )}
        </div>
      </Fieldset>

      <Fieldset title="Дополнительно">
        <div>
          <textarea
            rows={3}
            className={inputClasses + " resize-y"}
            value={form.additional}
            onChange={(e) => updateField("additional", e.target.value)}
          />
        </div>
      </Fieldset>
    </div>
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
      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <TestisSide side="right" value={form.rightTestis} onChange={updateRight} />
      </div>

      <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        <TestisSide side="left" value={form.leftTestis} onChange={updateLeft} />
      </div>
    </div>
  );
};

export default Testis;
export type { TestisProtocol } from "@types";
