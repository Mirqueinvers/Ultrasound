import React, { useEffect } from "react";
import { Fieldset, SizeRow, ButtonSelect, normalRanges } from "@common";
import {
  useFormState,
  useFieldUpdate,
  useFieldFocus,
  useConclusion,
} from "@hooks";
import { inputClasses } from "@utils/formClasses";
import type { ProstateProtocol, ProstateProps } from "@types";
import { defaultProstateState } from "@types";


export const Prostate: React.FC<ProstateProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<ProstateProtocol>(
    defaultProstateState,
    value
  );
  const updateField = useFieldUpdate(form, setForm, onChange);
  useConclusion(setForm, "prostate");

  const lengthFocus = useFieldFocus("prostate", "length");
  const widthFocus = useFieldFocus("prostate", "width");
  const apDimensionFocus = useFieldFocus("prostate", "apDimension");
  const volumeFocus = useFieldFocus("prostate", "volume");
  const conclusionFocus = useFieldFocus("prostate", "conclusion");

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
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Простата
      </h3>

      {/* Информация об исследовании */}
      <Fieldset title="Информация об исследовании">
        <div className="space-y-3">
          <ButtonSelect
            label="Вид исследования"
            value={form.studyType}
            onChange={(val) => updateField("studyType", val)}
            options={[
              { value: "трансабдоминальное", label: "трансабдоминальное" },
              { value: "трансректальное", label: "трансректальное" },
            ]}
          />
        </div>
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

      {/* В просвет мочевого пузыря */}
      <Fieldset title="В просвет мочевого пузыря">
        <div className="space-y-3">
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
            <label className="block w-full max-w-[25%]">
              <span className="text-sm text-gray-700">Выступает на (мм)</span>
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
        </div>
      </Fieldset>

      {/* Патологические образования */}
      <Fieldset title="Патологические образования">
        <div className="space-y-3">
          <ButtonSelect
            label=""
            value={form.pathologicLesions}
            onChange={(val) => updateField("pathologicLesions", val)}
            options={[
              { value: "не определяются", label: "не определяются" },
              { value: "определяются", label: "определяются" },
            ]}
          />

          {form.pathologicLesions === "определяются" && (
            <label className="block w-full">
              <span className="text-sm text-gray-700">Описание</span>
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.pathologicLesionsText}
                onChange={(e) =>
                  updateField("pathologicLesionsText", e.target.value)
                }
                placeholder="Опишите характер образований..."
              />
            </label>
          )}
        </div>
      </Fieldset>

      {/* Дополнительно */}
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

      {/* Заключение */}
      <Fieldset title="Заключение">
        <div>
          <textarea
            rows={3}
            className={inputClasses + " resize-y"}
            value={form.conclusion}
            onChange={(e) => updateField("conclusion", e.target.value)}
            onFocus={conclusionFocus.handleFocus}
            onBlur={conclusionFocus.handleBlur}
          />
        </div>
      </Fieldset>
    </div>
  );
};

export default Prostate;
export type { ProstateProtocol } from "@types";
