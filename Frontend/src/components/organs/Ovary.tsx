import React, { useEffect } from "react";
import { normalRanges } from "@components/common";
import { SizeRow, Fieldset, ButtonSelect, SelectWithTextarea } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate, useFieldFocus, useConclusion, useListManager } from "@hooks";
import { inputClasses, labelClasses } from "@utils/formClasses";
import { Plus, Trash2 } from "lucide-react";
import type { OvaryCyst, OvaryProtocol, OvaryProps } from "@types";
import { defaultOvaryState } from "@types";

export const Ovary: React.FC<OvaryProps> = ({ value, onChange, side }) => {
  const initialValue: OvaryProtocol = {
    ...defaultOvaryState,
    ...(value || {}),
  };

  const [form, setForm] = useFormState<OvaryProtocol>(initialValue);
  const updateField = useFieldUpdate(form, setForm, onChange);
  
  const organName = side === "left" ? "leftOvary" : "rightOvary";
  const title = side === "left" ? "Левый яичник" : "Правый яичник";
  
  useConclusion(setForm, organName);

  const lengthFocus = useFieldFocus(organName, "length");
  const widthFocus = useFieldFocus(organName, "width");
  const thicknessFocus = useFieldFocus(organName, "thickness");
  const volumeFocus = useFieldFocus(organName, "volume");

  const cystsManager = useListManager<OvaryCyst>(
    form.cystsList,
    form,
    setForm,
    onChange,
    "cystsList"
  );

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
    <ResearchSectionCard title={title} headerClassName="bg-sky-500">
      <div className="flex flex-col gap-6">
        {/* Размеры */}
        <Fieldset title="Размеры">
          <SizeRow
            label="Длина (мм)"
            value={form.length}
            onChange={(val) => updateField("length", val)}
            focus={lengthFocus}
            range={normalRanges.ovary?.length}
          />

          <SizeRow
            label="Ширина (мм)"
            value={form.width}
            onChange={(val) => updateField("width", val)}
            focus={widthFocus}
            range={normalRanges.ovary?.width}
          />

          <SizeRow
            label="Толщина (мм)"
            value={form.thickness}
            onChange={(val) => updateField("thickness", val)}
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
              { value: "четкий неровный", label: "четкий неровный" },
              { value: "нечеткий", label: "нечеткий" },
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
              { value: "не определяются", label: "не определяются" },
              { value: "определяются", label: "определяются" },
            ]}
          />

          {form.cysts === "определяются" && (
            <div className="mt-4 space-y-4">
              {/* Кнопка добавления (когда нет кист) */}
              {form.cystsList.length === 0 && (
                <div className="w-full text-center py-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <p className="text-slate-500 text-sm mb-4">Кисты не добавлены</p>
                  <button
                    type="button"
                    onClick={() => cystsManager.addItem({ size: "" })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    <Plus size={18} />
                    Добавить кисту
                  </button>
                </div>
              )}

              {/* Список кист */}
              {form.cystsList.map((cyst, index) => {
                const [size1, size2] = splitSize(cyst.size);

                return (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg"
                  >
                    <div className="bg-sky-500 px-4 py-2 flex items-center justify-between">
                      <span className="text-white font-bold text-sm">
                        Киста #{index + 1}
                      </span>
                      <button
                        type="button"
                        onClick={() => cystsManager.removeItem(index)}
                        className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                        title="Удалить кисту"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="p-4 flex flex-col gap-4">
                      {/* Размеры */}
                      <SizeRow
                        label="Размер 1 (мм)"
                        value={size1}
                        onChange={(val) => {
                          const newSize = val + (size2 ? `x${size2}` : "");
                          cystsManager.updateItem(index, "size", newSize);
                        }}
                      />

                      <SizeRow
                        label="Размер 2 (мм)"
                        value={size2}
                        onChange={(val) => {
                          const newSize = size1 + (val ? `x${val}` : "");
                          cystsManager.updateItem(index, "size", newSize);
                        }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Кнопка добавления (когда есть кисты) */}
              {form.cystsList.length > 0 && (
                <button
                  type="button"
                  onClick={() => cystsManager.addItem({ size: "" })}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all font-medium"
                >
                  <Plus size={18} />
                  Добавить кисту
                </button>
              )}
            </div>
          )}
        </Fieldset>

        {/* Патологические образования */}
        <Fieldset title="Патологические образования">
          <SelectWithTextarea
            label=""
            selectValue={form.formations}
            textareaValue={form.formationsText}
            onSelectChange={(val) => updateField("formations", val)}
            onTextareaChange={(val) => updateField("formationsText", val)}
            options={[
              { value: "не определяются", label: "не определяются" },
              { value: "определяются", label: "определяются" },
            ]}
            triggerValue="определяются"
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

export default Ovary;
export type { OvaryProtocol } from "@types";
