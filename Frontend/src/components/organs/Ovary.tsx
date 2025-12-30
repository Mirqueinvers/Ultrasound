import React, { useEffect } from "react";
import { normalRanges, SizeRow, Fieldset, ButtonSelect } from "@common";
import { useFormState, useFieldUpdate, useFieldFocus, useConclusion, useListManager } from "@hooks";
import { inputClasses, buttonClasses } from "@utils/formClasses";
import type { OvaryCyst, OvaryProtocol, OvaryProps } from "@types";
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

  const cystsManager = useListManager<OvaryCyst>(
    form.cystsList,
    form,
    setForm,
    onChange,
    "cystsList"
  );

  const sideLabel = side === 'left' ? 'Левый' : 'Правый';

  // Автоматический расчет объема
  useEffect(() => {
    const length = parseFloat(form.length);
    const width = parseFloat(form.width);
    const thickness = parseFloat(form.thickness);

    if (!isNaN(length) && !isNaN(width) && !isNaN(thickness) && length > 0 && width > 0 && thickness > 0) {
      const volume = ((length * width * thickness * 0.523) / 1000).toFixed(2);
      if (volume !== form.volume) {
        updateField("volume", volume);
      }
    }
  }, [form.length, form.width, form.thickness]);

  const splitSize = (size: string): [string, string] => {
    const [s1 = "", s2 = ""] = size.split("x");
    return [s1, s2];
  };

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
          value={form.volume || ""}
          onChange={() => {}}
          focus={volumeFocus}
          range={normalRanges.ovary?.volume}
          readOnly
        />
      </Fieldset>

      {/* Форма */}
      <Fieldset title="Форма">
        <ButtonSelect
          label=""
          value={form.shape}
          onChange={(val) => updateField("shape", val)}
          options={[
            { value: "овальная", label: "овальная" },
            { value: "округлая", label: "округлая" },
            { value: "неправильная", label: "неправильная" },
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
            { value: "четкий не ровный", label: "четкий не ровный" },
            { value: "не четкий", label: "не четкий" },
          ]}
        />
      </Fieldset>

      {/* Кисты */}
      <Fieldset title="Кисты">
        <ButtonSelect
          label=""
          value={form.cysts}
          onChange={(val) => updateField("cysts", val)}
          options={[
            { value: "Не определяются", label: "Не определяются" },
            { value: "Определяются", label: "Определяются" },
          ]}
        />

        {form.cysts === "Определяются" && (
          <div className="space-y-2 mt-2">
            <button
              type="button"
              className={buttonClasses}
              onClick={() => cystsManager.addItem({ size: "" })}
            >
              Добавить кисту
            </button>

            {form.cystsList.map((cyst, index) => {
              const [size1, size2] = splitSize(cyst.size);

              return (
                <div key={index} className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                    {index + 1}.
                  </span>

                  <div className="flex-1 flex items-end gap-1">
                    <label className="flex-1">
                      <span className="text-xs text-gray-500">Размер 1 (мм)</span>
                      <input
                        type="text"
                        className={`${inputClasses} text-xs py-1`}
                        value={size1}
                        onChange={e => {
                          const newSize1 = e.target.value;
                          const newSize = newSize1 + (size2 ? `x${size2}` : "");
                          cystsManager.updateItem(index, "size", newSize);
                        }}
                      />
                    </label>

                    <span className="text-gray-500 pb-1">×</span>

                    <label className="flex-1">
                      <span className="text-xs text-gray-500">Размер 2 (мм)</span>
                      <input
                        type="text"
                        className={`${inputClasses} text-xs py-1`}
                        value={size2}
                        onChange={e => {
                          const newSize2 = e.target.value;
                          const newSize = size1 + (newSize2 ? `x${newSize2}` : "");
                          cystsManager.updateItem(index, "size", newSize);
                        }}
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                    onClick={() => cystsManager.removeItem(index)}
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
              );
            })}
          </div>
        )}
      </Fieldset>

      {/* Патологические образования */}
      <Fieldset title="Патологические образования">
        <ButtonSelect
          label=""
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
export type { OvaryProtocol } from "@types";
