import React, { useEffect } from "react";
import { normalRanges } from "@common";
import { Fieldset, SizeRow, ButtonSelect } from "@/UI";
import { useFormState, useFieldUpdate, useFieldFocus, useConclusion } from "@hooks";
import { inputClasses } from "@utils/formClasses";
import type { UterusProtocol, UterusProps } from "@types";
import { defaultUterusState } from "@types";

export const Uterus: React.FC<UterusProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<UterusProtocol>(defaultUterusState, value);
  const updateField = useFieldUpdate(form, setForm, onChange);
  useConclusion(setForm, "uterus");

  const lengthFocus = useFieldFocus("uterus", "uterusLength");
  const widthFocus = useFieldFocus("uterus", "uterusWidth");
  const apDimensionFocus = useFieldFocus("uterus", "uterusApDimension");
  const volumeFocus = useFieldFocus("uterus", "uterusVolume");
  const endometriumSizeFocus = useFieldFocus("uterus", "endometriumSize");
  const cervixSizeFocus = useFieldFocus("uterus", "cervixSize");

  // Автоматический расчет дня цикла
  useEffect(() => {
    if (form.lastMenstruationDate) {
      const lastMenstruation = new Date(form.lastMenstruationDate);
      const today = new Date();
      const diffTime = today.getTime() - lastMenstruation.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > 0 && diffDays.toString() !== form.cycleDay) {
        updateField("cycleDay", diffDays.toString());
      }
    }
  }, [form.lastMenstruationDate]);

  // Автоматический расчет объема
  useEffect(() => {
    const length = parseFloat(form.length);
    const width = parseFloat(form.width);
    const apDimension = parseFloat(form.apDimension);

    if (!isNaN(length) && !isNaN(width) && !isNaN(apDimension) && length > 0 && width > 0 && apDimension > 0) {
      const volume = ((length * width * apDimension * 0.523) / 1000).toFixed(2);
      if (volume !== form.volume) {
        updateField("volume", volume);
      }
    }
  }, [form.length, form.width, form.apDimension]);

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Матка
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
              { value: "трансвагинальное", label: "трансвагинальное" },
            ]}
          />

          <label className="block w-full max-w-[25%]">
            <span className="text-sm text-gray-700">Дата последней менструации</span>
            <input
              type="date"
              className={inputClasses}
              value={form.lastMenstruationDate}
              onChange={e => updateField("lastMenstruationDate", e.target.value)}
            />
          </label>

          <label className="block w-full max-w-[25%]">
            <span className="text-sm text-gray-700">День цикла</span>
            <input
              type="text"
              className={inputClasses + " bg-gray-50"}
              value={form.cycleDay || ""}
              readOnly
              disabled
              placeholder="Рассчитывается автоматически"
            />
          </label>

          <ButtonSelect
            label="Менопауза"
            value={form.menopause}
            onChange={(val) => updateField("menopause", val)}
            options={[
              { value: "пременопауза", label: "пременопауза" },
              { value: "менопауза", label: "менопауза" },
              { value: "постменопауза", label: "постменопауза" },
            ]}
          />
        </div>
      </Fieldset>

      {/* Размеры */}
      <Fieldset title="Размеры">
        <SizeRow
          label="Длина (мм)"
          value={form.length}
          onChange={val => updateField("length", val)}
          focus={lengthFocus}
          range={normalRanges.uterus?.length}
        />

        <SizeRow
          label="Ширина (мм)"
          value={form.width}
          onChange={val => updateField("width", val)}
          focus={widthFocus}
          range={normalRanges.uterus?.width}
        />

        <SizeRow
          label="ПЗР (мм)"
          value={form.apDimension}
          onChange={val => updateField("apDimension", val)}
          focus={apDimensionFocus}
          range={normalRanges.uterus?.apDimension}
        />

        <SizeRow
          label="Объем (см³)"
          value={form.volume || ""}
          onChange={() => {}}
          focus={volumeFocus}
          range={normalRanges.uterus?.volume}
          readOnly
        />
      </Fieldset>

      {/* Форма матки */}
      <Fieldset title="Форма матки">
        <ButtonSelect
          label=""
          value={form.shape}
          onChange={(val) => updateField("shape", val)}
          options={[
            { value: "грушевидная", label: "грушевидная" },
            { value: "округлая", label: "округлая" },
          ]}
        />
      </Fieldset>

      {/* Положение */}
      <Fieldset title="Положение">
        <ButtonSelect
          label=""
          value={form.position}
          onChange={(val) => updateField("position", val)}
          options={[
            { value: "Антефлексио", label: "Антефлексио" },
            { value: "Ретрофлексио", label: "Ретрофлексио" },
            { value: "Антеверзия", label: "Антеверзия" },
            { value: "Ретроверзия", label: "Ретроверзия" },
          ]}
        />
      </Fieldset>

      {/* Строение миометрия */}
      <Fieldset title="Строение миометрия">
        <div className="space-y-3">
          <ButtonSelect
            label="Структура"
            value={form.myometriumStructure}
            onChange={(val) => updateField("myometriumStructure", val)}
            options={[
              { value: "однородное", label: "однородное" },
              { value: "неоднородное", label: "неоднородное" },
            ]}
          />

          {form.myometriumStructure === "неоднородное" && (
            <label className="block w-full">
              <span className="text-sm text-gray-700">Описание</span>
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.myometriumStructureText}
                onChange={e => updateField("myometriumStructureText", e.target.value)}
                placeholder="Опишите характер неоднородности..."
              />
            </label>
          )}

          <ButtonSelect
            label="Эхогенность"
            value={form.myometriumEchogenicity}
            onChange={(val) => updateField("myometriumEchogenicity", val)}
            options={[
              { value: "средняя", label: "средняя" },
              { value: "повышенная", label: "повышенная" },
              { value: "пониженная", label: "пониженная" },
            ]}
          />

          <ButtonSelect
            label="Полость матки"
            value={form.uterineCavity}
            onChange={(val) => updateField("uterineCavity", val)}
            options={[
              { value: "не расширена", label: "не расширена" },
              { value: "расширена", label: "расширена" },
            ]}
          />

          {form.uterineCavity === "расширена" && (
            <label className="block w-full">
              <span className="text-sm text-gray-700">Описание</span>
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.uterineCavityText}
                onChange={e => updateField("uterineCavityText", e.target.value)}
                placeholder="Опишите характер расширения..."
              />
            </label>
          )}
        </div>
      </Fieldset>

      {/* Эндометрий */}
      <Fieldset title="Эндометрий">
        <SizeRow
          label="Размер (мм)"
          value={form.endometriumSize}
          onChange={val => updateField("endometriumSize", val)}
          focus={endometriumSizeFocus}
          range={normalRanges.uterus?.endometriumSize}
        />

        <div className="mt-2">
          <ButtonSelect
            label="Структура эндометрия"
            value={form.endometriumStructure}
            onChange={(val) => updateField("endometriumStructure", val)}
            options={[
              { value: "однородная", label: "однородная" },
              { value: "неоднородная", label: "неоднородная" },
              { value: "диффузно-неоднородная", label: "диффузно-неоднородная" },
            ]}
          />
        </div>
      </Fieldset>

      {/* Шейка матки */}
      <Fieldset title="Шейка матки">
        <SizeRow
          label="Размер (мм)"
          value={form.cervixSize}
          onChange={val => updateField("cervixSize", val)}
          focus={cervixSizeFocus}
          range={normalRanges.uterus?.cervixSize}
        />

        <div className="mt-2 space-y-3">
          <ButtonSelect
            label="Эхоструктура шейки матки"
            value={form.cervixEchostructure}
            onChange={(val) => updateField("cervixEchostructure", val)}
            options={[
              { value: "однородная", label: "однородная" },
              { value: "неоднородная", label: "неоднородная" },
            ]}
          />

          {form.cervixEchostructure === "неоднородная" && (
            <label className="block w-full">
              <span className="text-sm text-gray-700">Описание</span>
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.cervixEchostructureText}
                onChange={e => updateField("cervixEchostructureText", e.target.value)}
                placeholder="Опишите характер неоднородности..."
              />
            </label>
          )}

          <ButtonSelect
            label="Цервикальный канал"
            value={form.cervicalCanal}
            onChange={(val) => updateField("cervicalCanal", val)}
            options={[
              { value: "сомкнут", label: "сомкнут" },
              { value: "расширен", label: "расширен" },
            ]}
          />

          {form.cervicalCanal === "расширен" && (
            <label className="block w-full">
              <span className="text-sm text-gray-700">Описание</span>
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.cervicalCanalText}
                onChange={e => updateField("cervicalCanalText", e.target.value)}
                placeholder="Опишите характер расширения..."
              />
            </label>
          )}
        </div>
      </Fieldset>


      {/* Свободная жидкость в малом тазу */}
      <Fieldset title="Свободная жидкость в малом тазу">
        <ButtonSelect
          label=""
          value={form.freeFluid}
          onChange={(val) => updateField("freeFluid", val)}
          options={[
            { value: "не определяется", label: "не определяется" },
            { value: "определяется", label: "определяется" },
          ]}
        />

        {form.freeFluid === "определяется" && (
          <label className="block w-full mt-2">
            <span className="text-sm text-gray-700">Описание</span>
            <textarea
              rows={2}
              className={inputClasses + " resize-y"}
              value={form.freeFluidText}
              onChange={e => updateField("freeFluidText", e.target.value)}
              placeholder="Опишите локализацию и количество жидкости..."
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
    </div>
  );
};

export default Uterus;
export type { UterusProtocol } from "@types";
