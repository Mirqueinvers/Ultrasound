import React from "react";
import { normalRanges, SizeRow, Fieldset, ButtonSelect } from "@common";
import { useFormState, useFieldUpdate, useFieldFocus, useConclusion, useListManager } from "@hooks";
import { inputClasses, buttonClasses } from "@utils/formClasses";
import type { Follicle, OvaryProtocol, OvaryProps } from "@types";
import { defaultOvaryState } from "@types";

export const Ovary: React.FC<OvaryProps> = ({ value, onChange, side }) => {
  const [form, setForm] = useFormState<OvaryProtocol>(defaultOvaryState, value);
  const updateField = useFieldUpdate(form, setForm, onChange);
  useConclusion(setForm, side === 'left' ? "leftOvary" : "rightOvary");

  const conclusionFocus = useFieldFocus(side === 'left' ? "leftOvary" : "rightOvary", "conclusion");
  const lengthFocus = useFieldFocus(side === 'left' ? "leftOvary" : "rightOvary", "ovaryLength");
  const widthFocus = useFieldFocus(side === 'left' ? "leftOvary" : "rightOvary", "ovaryWidth");
  const thicknessFocus = useFieldFocus(side === 'left' ? "leftOvary" : "rightOvary", "ovaryThickness");
  const volumeFocus = useFieldFocus(side === 'left' ? "leftOvary" : "rightOvary", "ovaryVolume");

  const folliclesManager = useListManager<Follicle>(
    form.folliclesList,
    form,
    setForm,
    onChange,
    "folliclesList"
  );

  const sideLabel = side === 'left' ? 'Левый' : 'Правый';

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        {sideLabel} яичник
      </h3>

      {/* Размеры */}
      <Fieldset title="Размеры">
        <SizeRow
          label="Длина (мм)"
          value={form.length}
          onChange={val => updateField("length", val)}
          focus={lengthFocus}
          range={normalRanges.ovary?.length}
        />

        <SizeRow
          label="Ширина (мм)"
          value={form.width}
          onChange={val => updateField("width", val)}
          focus={widthFocus}
          range={normalRanges.ovary?.width}
        />

        <SizeRow
          label="Толщина (мм)"
          value={form.thickness}
          onChange={val => updateField("thickness", val)}
          focus={thicknessFocus}
          range={normalRanges.ovary?.thickness}
        />

        <SizeRow
          label="Объем (см³)"
          value={form.volume}
          onChange={val => updateField("volume", val)}
          focus={volumeFocus}
          range={normalRanges.ovary?.volume}
        />
      </Fieldset>

      {/* Эхоструктура */}
      <Fieldset title="Эхоструктура">
        <ButtonSelect
          label="Структура"
          value={form.echostructure}
          onChange={(val) => updateField("echostructure", val)}
          options={[
            { value: "однородная", label: "однородная" },
            { value: "неоднородная", label: "неоднородная" },
          ]}
        />

        {form.echostructure === "неоднородная" && (
          <label className="block w-full mt-2">
            <span className="text-sm text-gray-700">Описание</span>
            <textarea
              rows={2}
              className={inputClasses + " resize-y"}
              value={form.echostructureText}
              onChange={e => updateField("echostructureText", e.target.value)}
              placeholder="Опишите характер неоднородности..."
            />
          </label>
        )}
      </Fieldset>

      {/* Фолликулы */}
      <Fieldset title="Фолликулы">
        <ButtonSelect
          label="Наличие фолликулов"
          value={form.follicles}
          onChange={(val) => updateField("follicles", val)}
          options={[
            { value: "Не определяются", label: "Не определяются" },
            { value: "Определяются", label: "Определяются" },
          ]}
        />

        {form.follicles === "Определяются" && (
          <div className="space-y-2 mt-2">
            <button
              type="button"
              className={buttonClasses}
              onClick={() => folliclesManager.addItem({ size: "" })}
            >
              Добавить фолликул
            </button>

            {form.folliclesList.map((follicle, index) => (
              <div key={index} className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                  {index + 1}.
                </span>

                <label className="flex-1">
                  <span className="text-xs text-gray-500">Размер (мм)</span>
                  <input
                    type="text"
                    className={`${inputClasses} text-xs py-1`}
                    value={follicle.size}
                    onChange={e =>
                      folliclesManager.updateItem(index, "size", e.target.value)
                    }
                  />
                </label>

                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                  onClick={() => folliclesManager.removeItem(index)}
                  title="Удалить"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}

            <label className="block w-full mt-2">
              <span className="text-sm text-gray-700">Доминантный фолликул (мм)</span>
              <input
                type="text"
                className={inputClasses}
                value={form.dominantFollicle}
                onChange={e => updateField("dominantFollicle", e.target.value)}
              />
            </label>
          </div>
        )}
      </Fieldset>

      {/* Патологические образования */}
      <Fieldset title="Патологические образования">
        <ButtonSelect
          label="Наличие образований"
          value={form.formations}
          onChange={(val) => updateField("formations", val)}
          options={[
            { value: "Не определяются", label: "Не определяются" },
            { value: "Определяются", label: "Определяются" },
          ]}
        />

        {form.formations === "Определяются" && (
          <label className="block w-full mt-2">
            <span className="text-sm text-gray-700">Описание</span>
            <textarea
              rows={2}
              className={inputClasses + " resize-y"}
              value={form.formationsText}
              onChange={e => updateField("formationsText", e.target.value)}
              placeholder="Опишите локализацию, размеры, структуру образований..."
            />
          </label>
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

      {/* Заключение */}
      <Fieldset title="Заключение">
        <div>
          <textarea
            rows={3}
            className={inputClasses + " resize-y"}
            value={form.conclusion}
            onChange={e => updateField("conclusion", e.target.value)}
            onFocus={conclusionFocus.handleFocus}
            onBlur={conclusionFocus.handleBlur}
          />
        </div>
      </Fieldset>
    </div>
  );
};

export default Ovary;
