import React from "react";
import { normalRanges } from "@common";
import { SizeRow, Fieldset, ButtonSelect } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import {
  useFormState,
  useFieldUpdate,
  useFieldFocus,
  useConclusion,
  useListManager,
} from "@hooks";
import { inputClasses } from "@utils/formClasses";
import type {
  Concretion,
  Polyp,
  GallbladderProtocol,
  GallbladderProps,
} from "@types";
import { defaultGallbladderState } from "@types";
import { GallbladderConcretions } from "./GallbladderConcretions";
import { GallbladderPolyps } from "./GallbladderPolyps";


export const Gallbladder: React.FC<GallbladderProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<GallbladderProtocol>(
    defaultGallbladderState,
    value
  );

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

  const isCholecystectomy = form.position === "холецистэктомия";

  return (
    <ResearchSectionCard title="Желчный пузырь" headerClassName="bg-sky-500">
      <div className="flex flex-col gap-6">
        {/* Положение */}
        <Fieldset title="Положение">
          <ButtonSelect
            label="Положение желчного пузыря"
            value={form.position}
            onChange={(val) => updateField("position", val)}
            options={[
              { value: "обычное", label: "Обычное" },
              { value: "холецистэктомия", label: "Холецистэктомия" },
            ]}
          />
        </Fieldset>

        {/* Всё кроме финального "Дополнительно" скрываем при холецистэктомии */}
        {!isCholecystectomy && (
          <>
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
                    { value: "шейки", label: "шейка" },
                    { value: "тела", label: "тело" },
                    { value: "дна", label: "дно" },
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

                {/* Конкременты */}
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
                    <GallbladderConcretions
                      items={form.concretionsList}
                      onAdd={() =>
                        concretionsManager.addItem({ size: "", position: "" })
                      }
                      onUpdate={(index, field, value) =>
                        concretionsManager.updateItem(index, field, value)
                      }
                      onRemove={(index) =>
                        concretionsManager.removeItem(index)
                      }
                    />
                  </div>
                )}

                {/* Полипы */}
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
                    <GallbladderPolyps
                      items={form.polypsList}
                      onAdd={() =>
                        polypsManager.addItem({
                          size: "",
                          position: "",
                          wall: "",
                        })
                      }
                      onUpdate={(index, field, value) =>
                        polypsManager.updateItem(index, field, value)
                      }
                      onRemove={(index) => polypsManager.removeItem(index)}
                    />
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
          </>
        )}

        {/* Финальное Дополнительно — всегда видно */}
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
