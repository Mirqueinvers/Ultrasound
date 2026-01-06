import React from "react";
import { normalRanges } from "@common";
import { SizeRow, Fieldset, ButtonSelect } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate, useFieldFocus, useConclusion, useListManager } from "@hooks";
import { inputClasses, buttonClasses } from "@utils/formClasses";
import type { Concretion, Polyp, GallbladderProtocol, GallbladderProps } from "@types";
import { defaultGallbladderState } from "@types";

export const Gallbladder: React.FC<GallbladderProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<GallbladderProtocol>(defaultGallbladderState, value);

  const updateField = useFieldUpdate(form, setForm, onChange);
  useConclusion(setForm, "gallbladder");

  const lengthFocus = useFieldFocus("gallbladder", "gallbladderLength");
  const widthFocus = useFieldFocus("gallbladder", "gallbladderWidth");
  const wallThicknessFocus = useFieldFocus("gallbladder", "wallThickness");
  const cysticDuctFocus = useFieldFocus("gallbladder", "cysticDuct");
  const commonBileDuctFocus = useFieldFocus("gallbladder", "commonBileDuct");

  const concretionsManager = useListManager<Concretion>(
    form.concretionsList,
    form,
    setForm,
    onChange,
    "concretionsList"
  );

  const polypsManager = useListManager<Polyp>(
    form.polypsList,
    form,
    setForm,
    onChange,
    "polypsList"
  );

  return (
    <ResearchSectionCard title="Желчный пузырь" headerClassName="bg-sky-500">
      <div className="flex flex-col gap-6">
        {/* Размеры */}
        <Fieldset title="Размеры">
          <SizeRow
            label="Длина (мм)"
            value={form.length}
            onChange={(val) => updateField("length", val)}
            focus={lengthFocus}
            range={normalRanges.gallbladder.length}
          />

          <SizeRow
            label="Ширина (мм)"
            value={form.width}
            onChange={(val) => updateField("width", val)}
            focus={widthFocus}
            range={normalRanges.gallbladder.width}
          />
        </Fieldset>

        {/* Размеры стенки */}
        <Fieldset title="Размеры стенки">
          <SizeRow
            label="Толщина стенки (мм)"
            value={form.wallThickness}
            onChange={(val) => updateField("wallThickness", val)}
            focus={wallThicknessFocus}
            range={normalRanges.gallbladder.wallThickness}
          />
        </Fieldset>

        {/* Форма */}
        <Fieldset title="Форма">
          <div className="space-y-2">
            <ButtonSelect
              label="Форма желчного пузыря"
              value={form.shape}
              onChange={(val) => updateField("shape", val)}
              options={[
                { value: "Правильная", label: "Правильная" },
                { value: "S-образная", label: "S-образная" },
                { value: "С загибом", label: "С загибом" },
              ]}
            />

            <ButtonSelect
              label="Перетяжка"
              value={form.constriction}
              onChange={(val) => updateField("constriction", val)}
              options={[
                { value: "шейка", label: "шейка" },
                { value: "тело", label: "тело" },
                { value: "дно", label: "дно" },
              ]}
            />
          </div>
        </Fieldset>

        {/* Содержимое */}
        <Fieldset title="Содержимое">
          <div className="space-y-2">
            <ButtonSelect
              label="Тип содержимого"
              value={form.contentType}
              onChange={(val) => updateField("contentType", val)}
              options={[
                { value: "Однородное", label: "Однородное" },
                { value: "Взвесь", label: "Взвесь" },
                { value: "Сладж", label: "Сладж" },
              ]}
            />

            <ButtonSelect
              label="Конкременты"
              value={form.concretions}
              onChange={(val) => updateField("concretions", val)}
              options={[
                { value: "Не определяются", label: "Не определяются" },
                { value: "Определяются", label: "Определяются" },
              ]}
            />

            {form.concretions === "Определяются" && (
              <div className="space-y-2 ml-4">
                <button
                  type="button"
                  className={buttonClasses}
                  onClick={() =>
                    concretionsManager.addItem({ size: "", position: "" })
                  }
                >
                  Добавить
                </button>

                {form.concretionsList.map((concretion, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                      {index + 1}.
                    </span>

                    <label className="flex-1">
                      <span className="text-xs text-gray-500">Размеры (мм)</span>
                      <input
                        type="text"
                        className={`${inputClasses} text-xs py-1`}
                        value={concretion.size}
                        onChange={(e) =>
                          concretionsManager.updateItem(
                            index,
                            "size",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label className="flex-1">
                      <span className="text-xs text-gray-500">Положение</span>
                      <select
                        className={`${inputClasses} text-xs py-1`}
                        value={concretion.position}
                        onChange={(e) =>
                          concretionsManager.updateItem(
                            index,
                            "position",
                            e.target.value
                          )
                        }
                      >
                        <option value="" />
                        <option value="проксимальная треть">проксимальная треть</option>
                        <option value="средняя треть">средняя треть</option>
                        <option value="дистальная треть">дистальная треть</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                      onClick={() => concretionsManager.removeItem(index)}
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
              </div>
            )}

            <ButtonSelect
              label="Полипы"
              value={form.polyps}
              onChange={(val) => updateField("polyps", val)}
              options={[
                { value: "Не определяются", label: "Не определяются" },
                { value: "Определяются", label: "Определяются" },
              ]}
            />

            {form.polyps === "Определяются" && (
              <div className="space-y-2 ml-4">
                <button
                  type="button"
                  className={buttonClasses}
                  onClick={() =>
                    polypsManager.addItem({ size: "", position: "" })
                  }
                >
                  Добавить
                </button>

                {form.polypsList.map((polyp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-700 min-w-[20px]">
                      {index + 1}.
                    </span>

                    <label className="flex-1">
                      <span className="text-xs text-gray-500">Размеры (мм)</span>
                      <input
                        type="text"
                        className={`${inputClasses} text-xs py-1`}
                        value={polyp.size}
                        onChange={(e) =>
                          polypsManager.updateItem(
                            index,
                            "size",
                            e.target.value
                          )
                        }
                      />
                    </label>

                    <label className="flex-1">
                      <span className="text-xs text-gray-500">Положение</span>
                      <select
                        className={`${inputClasses} text-xs py-1`}
                        value={polyp.position}
                        onChange={(e) =>
                          polypsManager.updateItem(
                            index,
                            "position",
                            e.target.value
                          )
                        }
                      >
                        <option value="" />
                        <option value="проксимальная треть">проксимальная треть</option>
                        <option value="средняя треть">средняя треть</option>
                        <option value="дистальная треть">дистальная треть</option>
                      </select>
                    </label>

                    <button
                      type="button"
                      className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
                      onClick={() => polypsManager.removeItem(index)}
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
              </div>
            )}

            <label className="block w-full">
              Дополнительно
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.content}
                onChange={(e) => updateField("content", e.target.value)}
              />
            </label>
          </div>
        </Fieldset>

        {/* Протоки */}
        <Fieldset title="Протоки">
          <SizeRow
            label="Пузырный проток (мм)"
            value={form.cysticDuct}
            onChange={(val) => updateField("cysticDuct", val)}
            focus={cysticDuctFocus}
            range={normalRanges.gallbladder.cysticDuct}
          />

          <SizeRow
            label="Общий желчный проток (мм)"
            value={form.commonBileDuct}
            onChange={(val) => updateField("commonBileDuct", val)}
            focus={commonBileDuctFocus}
            range={normalRanges.gallbladder.commonBileDuct}
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

export default Gallbladder;
export type { GallbladderProtocol } from "@types";
