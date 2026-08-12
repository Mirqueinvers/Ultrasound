// Frontend/src/components/organs/Testis.tsx
// Презентационный компонент: вся логика вынесена в hooks/organs/useTestis.ts
import React from "react";
import { normalRanges } from "@components/common";
import {
  ButtonSelect,
  Fieldset,
  SizeRow,
  SelectWithTextarea,
} from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFieldFocus } from "@hooks";
import { useTestis, useTestisSide } from "@hooks/organs/useTestis";
import { inputClasses } from "@utils/formClasses";
import type {
  TestisProps,
  SingleTestisProtocol,
} from "@types";
import type { SectionKey } from "@components/common/OrgNavigation";
import { SECTION_KEYS } from "@/domain/sectionKeys";

type ScrotumSectionKey = Extract<
  SectionKey,
  | typeof SECTION_KEYS.SCROTUM_RIGHT_TESTIS
  | typeof SECTION_KEYS.SCROTUM_LEFT_TESTIS
>;

interface TestisWithSectionsProps extends TestisProps {
  sectionRefs?: Record<
    ScrotumSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}

export const TestisSide: React.FC<{
  side: "right" | "left";
  value?: SingleTestisProtocol | null;
  onChange: (val: SingleTestisProtocol) => void;
  sectionRefs?: Record<
    ScrotumSectionKey,
    React.RefObject<HTMLDivElement | null>
  >;
}> = ({ side, value, onChange, sectionRefs }) => {
  const { form, updateField } = useTestisSide(side, value, onChange);

  const key = side === "right" ? "rightTestis" : "leftTestis";

  const lengthFocus = useFieldFocus(key, "length");
  const widthFocus = useFieldFocus(key, "width");
  const depthFocus = useFieldFocus(key, "depth");
  const volumeFocus = useFieldFocus(key, "volume");

  const title = side === "right" ? "Правое яичко" : "Левое яичко";

  const sectionKey: ScrotumSectionKey =
    side === "right"
      ? SECTION_KEYS.SCROTUM_RIGHT_TESTIS
      : SECTION_KEYS.SCROTUM_LEFT_TESTIS;

  return (
    <div ref={sectionRefs?.[sectionKey]}>
      <ResearchSectionCard title={title}>
        <div className="flex flex-col gap-6">
          {/* Размеры */}
          <Fieldset title="Размеры">
            <SizeRow
              label="Длина (мм)"
              value={form.length}
              onChange={(val) => updateField("length", val)}
              focus={lengthFocus}
              range={normalRanges.testis?.length}
            />

            <SizeRow
              label="Ширина (мм)"
              value={form.width}
              onChange={(val) => updateField("width", val)}
              focus={widthFocus}
              range={normalRanges.testis?.width}
            />

            <SizeRow
              label="Глубина (мм)"
              value={form.depth}
              onChange={(val) => updateField("depth", val)}
              focus={depthFocus}
              range={normalRanges.testis?.depth}
            />

            <SizeRow
              label="Объем (см³)"
              value={form.volume || ""}
              onChange={() => {}}
              focus={volumeFocus}
              readOnly
              range={normalRanges.testis?.volume}
              autoCalculated={true}
              customInputClass="w-full px-4 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-300 rounded-lg font-semibold text-sky-900"
            />
          </Fieldset>

          {/* Расположение */}
          <Fieldset title="Расположение">
            <ButtonSelect
              label=""
              value={form.location}
              onChange={(val) => updateField("location", val)}
              options={[
                { value: "в мошонке", label: "в мошонке" },
                { value: "не в мошонке", label: "не в мошонке" },
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

          {/* Капсула */}
          <Fieldset title="Капсула">
            <SelectWithTextarea
              label=""
              selectValue={form.capsule}
              textareaValue={form.capsuleText}
              onSelectChange={(val) => updateField("capsule", val)}
              onTextareaChange={(val) => updateField("capsuleText", val)}
              options={[
                { value: "не изменена", label: "не изменена" },
                { value: "изменена", label: "изменена" },
              ]}
              triggerValue="изменена"
              textareaLabel="Описание"
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
                { value: "повышена", label: "повышена" },
                { value: "понижена", label: "понижена" },
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

          {/* Структура средостения */}
          <Fieldset title="Структура средостения">
            <SelectWithTextarea
              label=""
              selectValue={form.mediastinum}
              textareaValue={form.mediastinumText}
              onSelectChange={(val) => updateField("mediastinum", val)}
              onTextareaChange={(val) => updateField("mediastinumText", val)}
              options={[
                { value: "не изменена", label: "не изменена" },
                { value: "изменена", label: "изменена" },
              ]}
              triggerValue="изменена"
              textareaLabel="Описание"
            />
          </Fieldset>

          {/* Кровоток в яичке */}
          <Fieldset title="Кровоток в яичке">
            <ButtonSelect
              label=""
              value={form.bloodFlow}
              onChange={(val) => updateField("bloodFlow", val)}
              options={[
                { value: "не изменен", label: "не изменен" },
                { value: "усилен", label: "усилен" },
                { value: "ослаблен", label: "ослаблен" },
              ]}
            />
          </Fieldset>

          {/* Придаток яичка */}
          <Fieldset title="Придаток яичка">
            <SelectWithTextarea
              label=""
              selectValue={form.appendage}
              textareaValue={form.appendageText}
              onSelectChange={(val) => updateField("appendage", val)}
              onTextareaChange={(val) => updateField("appendageText", val)}
              options={[
                { value: "не изменен", label: "не изменен" },
                { value: "изменен", label: "изменен" },
              ]}
              triggerValue="изменен"
              textareaLabel="Описание"
            />
          </Fieldset>

          {/* Количество жидкости в оболочках */}
          <Fieldset title="Количество жидкости в оболочках">
            <SelectWithTextarea
              label=""
              selectValue={form.fluidAmount}
              textareaValue={form.fluidAmountText}
              onSelectChange={(val) => updateField("fluidAmount", val)}
              onTextareaChange={(val) => updateField("fluidAmountText", val)}
              options={[
                { value: "не изменено", label: "не изменено" },
                { value: "увеличено", label: "увеличено" },
              ]}
              triggerValue="увеличено"
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
    </div>
  );
};

export const Testis: React.FC<TestisWithSectionsProps> = ({
  value,
  onChange,
  sectionRefs,
}) => {
  const { form, updateRight, updateLeft } = useTestis(value, onChange);

  return (
    <div className="flex flex-col gap-6">
      <TestisSide
        side="right"
        value={form.rightTestis}
        onChange={updateRight}
        sectionRefs={sectionRefs}
      />
      <TestisSide
        side="left"
        value={form.leftTestis}
        onChange={updateLeft}
        sectionRefs={sectionRefs}
      />
    </div>
  );
};

export default Testis;
export type { TestisProtocol } from "@types";