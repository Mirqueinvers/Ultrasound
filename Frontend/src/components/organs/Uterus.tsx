import React from "react";
import { normalRanges, SizeRow, Fieldset, ButtonSelect } from "@common";
import { useFormState, useFieldUpdate, useFieldFocus, useConclusion } from "@hooks";
import { inputClasses } from "@utils/formClasses";
import type { UterusProtocol, UterusProps } from "@types";
import { defaultUterusState } from "@types";

export const Uterus: React.FC<UterusProps> = ({ value, onChange }) => {
  const [form, setForm] = useFormState<UterusProtocol>(defaultUterusState, value);
  const updateField = useFieldUpdate(form, setForm, onChange);
  useConclusion(setForm, "uterus");

  const conclusionFocus = useFieldFocus("uterus", "conclusion");
  const lengthFocus = useFieldFocus("uterus", "uterusLength");
  const widthFocus = useFieldFocus("uterus", "uterusWidth");
  const apDimensionFocus = useFieldFocus("uterus", "uterusApDimension");
  const volumeFocus = useFieldFocus("uterus", "uterusVolume");
  const endometriumSizeFocus = useFieldFocus("uterus", "endometriumSize");
  const cervixSizeFocus = useFieldFocus("uterus", "cervixSize");

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">
        Матка
      </h3>

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
          value={form.volume}
          onChange={val => updateField("volume", val)}
          focus={volumeFocus}
          range={normalRanges.uterus?.volume}
        />
      </Fieldset>

      {/* Форма матки */}
      <Fieldset title="Форма матки">
        <ButtonSelect
          label="Форма"
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
          label="Положение матки"
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
          <label className="block w-full mt-2">
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

        <div className="mt-2">
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
            <label className="block w-full mt-2">
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
        </div>
      </Fieldset>

      {/* Цервикальный канал */}
      <Fieldset title="Цервикальный канал">
        <ButtonSelect
          label="Состояние"
          value={form.cervicalCanal}
          onChange={(val) => updateField("cervicalCanal", val)}
          options={[
            { value: "сомкнут", label: "сомкнут" },
            { value: "расширен", label: "расширен" },
          ]}
        />
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

export default Uterus;
