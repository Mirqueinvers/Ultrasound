// путь: /components/organs/Uterus.tsx
import React, { useEffect } from "react";
import { normalRanges } from "@components/common";
import { Fieldset, SizeRow, ButtonSelect, SelectWithTextarea } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate, useFieldFocus, useConclusion } from "@hooks";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { UterusProtocol, UterusProps } from "@types";
import { defaultUterusState } from "@types";

export const Uterus: React.FC<UterusProps> = ({ value, onChange }) => {
  const initialValue: UterusProtocol = {
    ...defaultUterusState,
    ...(value || {}),
  };

  const [form, setForm] = useFormState<UterusProtocol>(initialValue);
  const updateField = useFieldUpdate(form, setForm, onChange);
  useConclusion(setForm, "uterus");

  const lengthFocus = useFieldFocus("uterus", "uterusLength");
  const widthFocus = useFieldFocus("uterus", "uterusWidth");
  const apDimensionFocus = useFieldFocus("uterus", "uterusApDimension");
  const volumeFocus = useFieldFocus("uterus", "uterusVolume");
  const endometriumSizeFocus = useFieldFocus("uterus", "endometriumSize");
  const cervixSizeFocus = useFieldFocus("uterus", "cervixSize");

  const status = form.uterusStatus || "обычное";
  const isNormal = status === "обычное";
  const isSubtotal = status === "субтотальная гистерэктомия";
  const isTotalLike =
    status === "тотальная гистерэктомия" ||
    status === "гистеросальпингоовариэктомия" ||
    status === "радикальная гистерэктомия";

  // Автоматический расчет дня цикла (только при обычной матке)
  useEffect(() => {
    if (!isNormal) return;
    if (form.lastMenstruationDate) {
      const lastMenstruation = new Date(form.lastMenstruationDate);
      const today = new Date();
      const diffTime = today.getTime() - lastMenstruation.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0 && diffDays.toString() !== form.cycleDay) {
        updateField("cycleDay", diffDays.toString());
      }
    }
  }, [form.lastMenstruationDate, isNormal]);

  // Автоматический расчет объема (только при обычной матке)
  useEffect(() => {
    if (!isNormal) return;
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
      const volume = ((length * width * apDimension * 0.523) / 1000).toFixed(2);
      if (volume !== form.volume) {
        updateField("volume", volume);
      }
    }
  }, [form.length, form.width, form.apDimension, isNormal]);

  return (
    <ResearchSectionCard title="Матка" headerClassName="bg-sky-500">
      <div className="flex flex-col gap-6">
        {/* Положение (тип матки / гистерэктомия) */}
        <Fieldset title="Положение">
          <ButtonSelect
            label=""
            value={status}
            onChange={(val) => updateField("uterusStatus", val)}
            options={[
              { value: "обычное", label: "Обычное" },
              { value: "субтотальная гистерэктомия", label: "Субтотальная гистерэктомия" },
              { value: "тотальная гистерэктомия", label: "Тотальная гистерэктомия" },
              { value: "гистеросальпингоовариэктомия", label: "Гистеросальпингоовариэктомия" },
              { value: "радикальная гистерэктомия", label: "Радикальная гистерэктомия" },
            ]}
          />
        </Fieldset>

        {/* Информация об исследовании */}
        <Fieldset title="Информация об исследовании">
          <ButtonSelect
            label="Вид исследования"
            value={form.studyType}
            onChange={(val) => updateField("studyType", val)}
            options={[
              { value: "трансабдоминальное", label: "трансабдоминальное" },
              { value: "трансвагинальное", label: "трансвагинальное" },
            ]}
          />

          {isNormal && (
            <>
              <div>
                <label className={labelClasses}>
                  Дата последней менструации
                  <input
                    type="date"
                    className={inputClasses}
                    value={form.lastMenstruationDate}
                    onChange={(e) =>
                      updateField("lastMenstruationDate", e.target.value)
                    }
                  />
                </label>
              </div>

              <div>
                <label className={labelClasses}>
                  День цикла
                  <input
                    type="text"
                    className={inputClasses + " bg-gray-50"}
                    value={form.cycleDay || ""}
                    readOnly
                    disabled
                    placeholder="Рассчитывается автоматически"
                  />
                </label>
              </div>

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
            </>
          )}
        </Fieldset>

        {/* Остальные блоки показываем только если не тотальная/радикальная и т.п. */}
        {isNormal && (
          <>
            <Fieldset title="Размеры">
              <SizeRow
                label="Длина (мм)"
                value={form.length}
                onChange={(val) => updateField("length", val)}
                focus={lengthFocus}
                range={normalRanges.uterus?.length}
              />
              <SizeRow
                label="Ширина (мм)"
                value={form.width}
                onChange={(val) => updateField("width", val)}
                focus={widthFocus}
                range={normalRanges.uterus?.width}
              />
              <SizeRow
                label="ПЗР (мм)"
                value={form.apDimension}
                onChange={(val) => updateField("apDimension", val)}
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

            <Fieldset title="Положение">
              <ButtonSelect
                label=""
                value={form.position}
                onChange={(val) => updateField("position", val)}
                options={[
                  { value: "антефлексио", label: "Антефлексио" },
                  { value: "ретрофлексио", label: "Ретрофлексио" },
                  { value: "антеверзия", label: "Антеверзия" },
                  { value: "ретроверзия", label: "Ретроверзия" },
                ]}
              />
            </Fieldset>

            <Fieldset title="Строение миометрия">
              <ButtonSelect
                label="Структура"
                value={form.myometriumStructure}
                onChange={(val) => updateField("myometriumStructure", val)}
                options={[
                  { value: "однородная", label: "однородное" },
                  { value: "неоднородная", label: "неоднородное" },
                ]}
              />

              {form.myometriumStructure === "неоднородное" && (
                <div>
                  <label className={labelClasses}>
                    Описание
                    <textarea
                      rows={2}
                      className={inputClasses + " resize-y"}
                      value={form.myometriumStructureText}
                      onChange={(e) =>
                        updateField("myometriumStructureText", e.target.value)
                      }
                      placeholder="Опишите характер неоднородности..."
                    />
                  </label>
                </div>
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

              <SelectWithTextarea
                label="Полость матки"
                selectValue={form.uterineCavity}
                textareaValue={form.uterineCavityText}
                onSelectChange={(val) => updateField("uterineCavity", val)}
                onTextareaChange={(val) =>
                  updateField("uterineCavityText", val)
                }
                options={[
                  { value: "не расширена", label: "не расширена" },
                  { value: "расширена", label: "расширена" },
                ]}
                triggerValue="расширена"
                textareaLabel="Описание расширения"
              />
            </Fieldset>

            <Fieldset title="Эндометрий">
              <SizeRow
                label="Размер (мм)"
                value={form.endometriumSize}
                onChange={(val) => updateField("endometriumSize", val)}
                focus={endometriumSizeFocus}
                range={normalRanges.uterus?.endometriumSize}
              />

              <ButtonSelect
                label="Структура эндометрия"
                value={form.endometriumStructure}
                onChange={(val) => updateField("endometriumStructure", val)}
                options={[
                  { value: "однородная", label: "однородная" },
                  { value: "неоднородная", label: "неоднородная" },
                  {
                    value: "диффузно-неоднородная",
                    label: "диффузно-неоднородная",
                  },
                ]}
              />
            </Fieldset>
          </>
        )}

        {/* При субтотальной показываем шейку, жидкость, дополнительно */}
        {(isNormal || isSubtotal) && (
          <Fieldset title="Шейка матки">
            <SizeRow
              label="Размер (мм)"
              value={form.cervixSize}
              onChange={(val) => updateField("cervixSize", val)}
              focus={cervixSizeFocus}
              range={normalRanges.uterus?.cervixSize}
            />

            <SelectWithTextarea
              label="Эхоструктура шейки матки"
              selectValue={form.cervixEchostructure}
              textareaValue={form.cervixEchostructureText}
              onSelectChange={(val) => updateField("cervixEchostructure", val)}
              onTextareaChange={(val) =>
                updateField("cervixEchostructureText", val)
              }
              options={[
                { value: "однородная", label: "однородная" },
                { value: "неоднородная", label: "неоднородная" },
              ]}
              triggerValue="неоднородная"
              textareaLabel="Описание неоднородности"
            />

            <SelectWithTextarea
              label="Цервикальный канал"
              selectValue={form.cervicalCanal}
              textareaValue={form.cervicalCanalText}
              onSelectChange={(val) => updateField("cervicalCanal", val)}
              onTextareaChange={(val) =>
                updateField("cervicalCanalText", val)
              }
              options={[
                { value: "сомкнут", label: "сомкнут" },
                { value: "расширен", label: "расширен" },
              ]}
              triggerValue="расширен"
              textareaLabel="Описание расширения"
            />
          </Fieldset>
        )}

        {/* Свободная жидкость и дополнительно – всегда оставляем */}
        <Fieldset title="Свободная жидкость в малом тазу">
          <SelectWithTextarea
            label=""
            selectValue={form.freeFluid}
            textareaValue={form.freeFluidText}
            onSelectChange={(val) => updateField("freeFluid", val)}
            onTextareaChange={(val) => updateField("freeFluidText", val)}
            options={[
              { value: "не определяется", label: "не определяется" },
              { value: "определяется", label: "определяется" },
            ]}
            triggerValue="определяется"
            textareaLabel="Описание"
          />
        </Fieldset>

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

export default Uterus;
export type { UterusProtocol } from "@types";
