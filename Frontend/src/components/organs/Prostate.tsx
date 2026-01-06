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
import type { ProstateProtocol, ProstateProps } from "@types";
import { defaultProstateState } from "@types";

export const Prostate: React.FC<ProstateProps> = ({ value, onChange }) => {
  const initialValue: ProstateProtocol = {
    ...defaultProstateState,
    ...(value || {}),
  };

  const [form, setForm] = useFormState<ProstateProtocol>(initialValue, value);
  const updateField = useFieldUpdate(form, setForm, onChange);
  useConclusion(setForm, "prostate");

  const lengthFocus = useFieldFocus("prostate", "length");
  const widthFocus = useFieldFocus("prostate", "width");
  const apDimensionFocus = useFieldFocus("prostate", "apDimension");
  const volumeFocus = useFieldFocus("prostate", "volume");

  // Автоматический расчет объема (как в матке)
  useEffect(() => {
    const length = parseFloat(form.length);
    const width = parseFloat(form.width);
    const apDimension = parseFloat(form.apDimension);

    if (
      !isNaN(length) &&
      !isNaN(width) &&
      !isNaN(apDimension) &&
      length > 0 &&
      width > 0 &&
      apDimension > 0
    ) {
      const volume = (
        (length * width * apDimension * 0.523) /
        1000
      ).toFixed(2);
      if (volume !== form.volume) {
        updateField("volume", volume);
      }
    }
  }, [form.length, form.width, form.apDimension]);

  return (
    <ResearchSectionCard title="Простата" headerClassName="bg-sky-500">
      <div className="flex flex-col gap-6">
        {/* Информация об исследовании */}
        <Fieldset title="Информация об исследовании">
          <ButtonSelect
            label="Вид исследования"
            value={form.studyType}
            onChange={(val) => updateField("studyType", val)}
            options={[
              { value: "трансабдоминальное", label: "трансабдоминальное" },
              { value: "трансректальное", label: "трансректальное" },
            ]}
          />
        </Fieldset>

        {/* Размеры */}
        <Fieldset title="Размеры">
          <SizeRow
            label="Длина (мм)"
            value={form.length}
            onChange={(val) => updateField("length", val)}
            focus={lengthFocus}
            range={normalRanges.prostate?.length}
          />

          <SizeRow
            label="Ширина (мм)"
            value={form.width}
            onChange={(val) => updateField("width", val)}
            focus={widthFocus}
            range={normalRanges.prostate?.width}
          />

          <SizeRow
            label="ПЗР (мм)"
            value={form.apDimension}
            onChange={(val) => updateField("apDimension", val)}
            focus={apDimensionFocus}
            range={normalRanges.prostate?.apPZR}
          />

          <SizeRow
            label="Объем (см³)"
            value={form.volume || ""}
            onChange={() => {}}
            focus={volumeFocus}
            readOnly
            range={normalRanges.prostate?.volume}
            autoCalculated={true}
            customInputClass="w-full px-4 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-300 rounded-lg font-semibold text-sky-900"
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

        {/* Симметричность */}
        <Fieldset title="Симметричность">
          <ButtonSelect
            label=""
            value={form.symmetry}
            onChange={(val) => updateField("symmetry", val)}
            options={[
              { value: "сохранена", label: "сохранена" },
              { value: "ассиметрична", label: "ассиметрична" },
            ]}
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
              { value: "треугольная", label: "треугольная" },
            ]}
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
              { value: "повышенная", label: "повышенная" },
              { value: "пониженная", label: "пониженная" },
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

        {/* В просвет мочевого пузыря */}
        <Fieldset title="В просвет мочевого пузыря">
          <ButtonSelect
            label=""
            value={form.bladderProtrusion}
            onChange={(val) => updateField("bladderProtrusion", val)}
            options={[
              { value: "не выступает", label: "не выступает" },
              { value: "выступает", label: "выступает" },
            ]}
          />

          {form.bladderProtrusion === "выступает" && (
            <label className={labelClasses + " mt-3 max-w-[25%]"}>
              Выступает на (мм)
              <input
                type="number"
                className={inputClasses}
                value={form.bladderProtrusionMm}
                onChange={(e) =>
                  updateField("bladderProtrusionMm", e.target.value)
                }
              />
            </label>
          )}
        </Fieldset>

        {/* Патологические образования */}
        <Fieldset title="Патологические образования">
          <SelectWithTextarea
            label=""
            selectValue={form.pathologicLesions}
            textareaValue={form.pathologicLesionsText}
            onSelectChange={(val) => updateField("pathologicLesions", val)}
            onTextareaChange={(val) => updateField("pathologicLesionsText", val)}
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

export default Prostate;
export type { ProstateProtocol } from "@types";
