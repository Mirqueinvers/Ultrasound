import React from "react";
import { normalRanges, SizeRow, Fieldset, SelectWithTextarea, ButtonSelect } from "@components/common";
import { useFormState, useFieldUpdate, useFieldFocus, useListManager } from "@hooks";
import { Concrements } from "./Concrements";
import { Cysts } from "./Cysts";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { Concrement, Cyst, KidneyProtocol, KidneyCommonProps } from "@types";
import { defaultKidneyState } from "@types";

export const KidneyCommon: React.FC<KidneyCommonProps> = ({
  side,
  value,
  onChange,
}) => {
  const initialValue: KidneyProtocol = {
    ...defaultKidneyState,
    ...(value || {}),
    parenchymaConcrementslist: value?.parenchymaConcrementslist || [],
    parenchymaCystslist: value?.parenchymaCystslist || [],
    parenchymaMultipleCysts: value?.parenchymaMultipleCysts || false,
    parenchymaMultipleCystsSize: value?.parenchymaMultipleCystsSize || "",
    pcsConcrementslist: value?.pcsConcrementslist || [],
    pcsCystslist: value?.pcsCystslist || [],
    pcsMultipleCysts: value?.pcsMultipleCysts || false,
    pcsMultipleCystsSize: value?.pcsMultipleCystsSize || "",
  };

  // Используем кастомный хук для управления состоянием формы
  const [form, setForm] = useFormState<KidneyProtocol>(initialValue, value);

  // Используем хук для обновления полей
  const updateField = useFieldUpdate(form, setForm, onChange);

  const organName = side === "left" ? "leftKidney" : "rightKidney";
  const title = side === "left" ? "Левая почка" : "Правая почка";
  const ranges =
    side === "left" ? normalRanges.leftKidney : normalRanges.rightKidney;

  // Хуки для фокуса на полях размеров
  const lengthFocus = useFieldFocus(organName, "length");
  const widthFocus = useFieldFocus(organName, "width");
  const thicknessFocus = useFieldFocus(organName, "thickness");
  const parenchymaSizeFocus = useFieldFocus(organName, "parenchymaSize");

  // Используем хук для управления списком конкрементов паренхимы
  const parenchymaConcrementsManager = useListManager<Concrement>(
    form.parenchymaConcrementslist,
    form,
    setForm,
    onChange,
    "parenchymaConcrementslist"
  );

  // Используем хук для управления списком кист паренхимы
  const parenchymaCystsManager = useListManager<Cyst>(
    form.parenchymaCystslist,
    form,
    setForm,
    onChange,
    "parenchymaCystslist"
  );

  // Используем хук для управления списком конкрементов ЧЛС
  const pcsConcrementsManager = useListManager<Concrement>(
    form.pcsConcrementslist,
    form,
    setForm,
    onChange,
    "pcsConcrementslist"
  );

  // Используем хук для управления списком кист ЧЛС
  const pcsCystsManager = useListManager<Cyst>(
    form.pcsCystslist,
    form,
    setForm,
    onChange,
    "pcsCystslist"
  );

  const updateSelect = (
    field: keyof KidneyProtocol,
    value: string,
    cleanup?: (draft: KidneyProtocol) => void,
  ) => {
    const draft: KidneyProtocol = { ...form, [field]: value };

    if (field === "parenchymaConcrements" && value === "не определяются") {
      draft.parenchymaConcrementslist = [];
    }
    if (field === "parenchymaCysts" && value === "не определяются") {
      draft.parenchymaCystslist = [];
    }
    if (field === "pcsConcrements" && value === "не определяются") {
      draft.pcsConcrementslist = [];
    }
    if (field === "pcsCysts" && value === "не определяются") {
      draft.pcsCystslist = [];
    }

    cleanup?.(draft);
    setForm(draft);
    onChange?.(draft);
  };

  const toggleParenchymaMultipleCysts = () => {
    const draft: KidneyProtocol = {
      ...form,
      parenchymaMultipleCysts: !form.parenchymaMultipleCysts,
      parenchymaMultipleCystsSize: !form.parenchymaMultipleCysts
        ? form.parenchymaMultipleCystsSize
        : "",
    };
    setForm(draft);
    onChange?.(draft);
  };

  const togglePcsMultipleCysts = () => {
    const draft: KidneyProtocol = {
      ...form,
      pcsMultipleCysts: !form.pcsMultipleCysts,
      pcsMultipleCystsSize: !form.pcsMultipleCysts
        ? form.pcsMultipleCystsSize
        : "",
    };
    setForm(draft);
    onChange?.(draft);
  };

  const showMicrolithsSize = form.pcsMicroliths === "определяются";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">{title}</h3>

      <Fieldset title="Размеры">
        <SizeRow
          label="Длина (мм)"
          value={form.length}
          onChange={val => updateField("length", val)}
          focus={lengthFocus}
          range={ranges.length}
        />
        <SizeRow
          label="Ширина (мм)"
          value={form.width}
          onChange={val => updateField("width", val)}
          focus={widthFocus}
          range={ranges.width}
        />
        <SizeRow
          label="Толщина (мм)"
          value={form.thickness}
          onChange={val => updateField("thickness", val)}
          focus={thicknessFocus}
          range={ranges.thickness}
        />
      </Fieldset>

      <Fieldset title="Контур почки">
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

      <Fieldset title="Паренхима">
        <SizeRow
          label="Размер паренхимы (мм)"
          value={form.parenchymaSize}
          onChange={val => updateField("parenchymaSize", val)}
          focus={parenchymaSizeFocus}
          range={ranges.parenchyma}
        />

        <ButtonSelect
          label="Эхогенность"
          value={form.parenchymaEchogenicity}
          onChange={(val) => updateField("parenchymaEchogenicity", val)}
          options={[
            { value: "средняя", label: "средняя" },
            { value: "повышена", label: "повышена" },
            { value: "понижена", label: "понижена" },
          ]}
        />

        <ButtonSelect
          label="Структура"
          value={form.parenchymaStructure}
          onChange={(val) => updateField("parenchymaStructure", val)}
          options={[
            { value: "однородная", label: "однородная" },
            { value: "диффузно-неоднородная", label: "диффузно-неоднородная" },
          ]}
        />

        <ButtonSelect
          label="Конкременты"
          value={form.parenchymaConcrements}
          onChange={(val) => updateSelect("parenchymaConcrements", val)}
          options={[
            { value: "не определяются", label: "не определяются" },
            { value: "определяются", label: "определяются" },
          ]}
        />

        {form.parenchymaConcrements === "определяются" && (
          <Concrements
            items={form.parenchymaConcrementslist}
            onAdd={() => parenchymaConcrementsManager.addItem({ size: "", location: "" })}
            onUpdate={parenchymaConcrementsManager.updateItem}
            onRemove={parenchymaConcrementsManager.removeItem}
          />
        )}

        <ButtonSelect
          label="Кисты"
          value={form.parenchymaCysts}
          onChange={(val) => updateSelect("parenchymaCysts", val)}
          options={[
            { value: "не определяются", label: "не определяются" },
            { value: "определяются", label: "определяются" },
          ]}
        />

        {form.parenchymaCysts === "определяются" && (
          <Cysts
            items={form.parenchymaCystslist}
            onAdd={() => parenchymaCystsManager.addItem({ size: "", location: "" })}
            onUpdate={parenchymaCystsManager.updateItem}
            onRemove={parenchymaCystsManager.removeItem}
            multiple={form.parenchymaMultipleCysts}
            multipleSize={form.parenchymaMultipleCystsSize}
            onToggleMultiple={toggleParenchymaMultipleCysts}
            onChangeMultipleSize={value =>
              updateField("parenchymaMultipleCystsSize", value)
            }
          />
        )}

        <SelectWithTextarea
          label="Патологические образования"
          selectValue={form.parenchymaPathologicalFormations}
          textareaValue={form.parenchymaPathologicalFormationsText}
          onSelectChange={val =>
            updateField("parenchymaPathologicalFormations", val)
          }
          onTextareaChange={val =>
            updateField("parenchymaPathologicalFormationsText", val)
          }
          options={[
            { value: "не определяются", label: "не определяются" },
            { value: "определяются", label: "определяются" },
          ]}
          triggerValue="определяются"
          textareaLabel="Описание патологических образований"
        />
      </Fieldset>

      <Fieldset title="Чашечно-лоханочная система">
        <ButtonSelect
          label="Размер"
          value={form.pcsSize}
          onChange={(val) => updateField("pcsSize", val)}
          options={[
            { value: "не изменена", label: "не изменена" },
            { value: "расширена", label: "расширена" },
          ]}
        />

        <ButtonSelect
          label="Микролиты"
          value={form.pcsMicroliths}
          onChange={(val) =>
            updateSelect("pcsMicroliths", val, draft => {
              if (draft.pcsMicroliths === "не определяются") {
                draft.pcsMicrolithsSize = "";
              }
            })
          }
          options={[
            { value: "не определяются", label: "не определяются" },
            { value: "определяются", label: "определяются" },
          ]}
        />

        {showMicrolithsSize && (
          <div>
            <label className={labelClasses}>
              Размером до (мм)
              <input
                type="text"
                className={inputClasses}
                value={form.pcsMicrolithsSize}
                onChange={e =>
                  updateField("pcsMicrolithsSize", e.target.value)
                }
              />
            </label>
          </div>
        )}

        <ButtonSelect
          label="Конкременты"
          value={form.pcsConcrements}
          onChange={(val) =>
            updateSelect("pcsConcrements", val)
          }
          options={[
            { value: "не определяются", label: "не определяются" },
            { value: "определяются", label: "определяются" },
          ]}
        />

        {form.pcsConcrements === "определяются" && (
          <Concrements
            items={form.pcsConcrementslist}
            onAdd={() => pcsConcrementsManager.addItem({ size: "", location: "" })}
            onUpdate={pcsConcrementsManager.updateItem}
            onRemove={pcsConcrementsManager.removeItem}
          />
        )}

        <ButtonSelect
          label="Кисты"
          value={form.pcsCysts}
          onChange={(val) => updateSelect("pcsCysts", val)}
          options={[
            { value: "не определяются", label: "не определяются" },
            { value: "определяются", label: "определяются" },
          ]}
        />

        {form.pcsCysts === "определяются" && (
          <Cysts
            items={form.pcsCystslist}
            onAdd={() => pcsCystsManager.addItem({ size: "", location: "" })}
            onUpdate={pcsCystsManager.updateItem}
            onRemove={pcsCystsManager.removeItem}
            multiple={form.pcsMultipleCysts}
            multipleSize={form.pcsMultipleCystsSize}
            onToggleMultiple={togglePcsMultipleCysts}
            onChangeMultipleSize={value =>
              updateField("pcsMultipleCystsSize", value)
            }
          />
        )}

        <SelectWithTextarea
          label="Патологические образования"
          selectValue={form.pcsPathologicalFormations}
          textareaValue={form.pcsPathologicalFormationsText}
          onSelectChange={val =>
            updateField("pcsPathologicalFormations", val)
          }
          onTextareaChange={val =>
            updateField("pcsPathologicalFormationsText", val)
          }
          options={[
            { value: "не определяются", label: "не определяются" },
            { value: "определяются", label: "определяются" },
          ]}
          triggerValue="определяются"
          textareaLabel="Описание патологических образований"
        />
      </Fieldset>

      <Fieldset title="Синус">
        <ButtonSelect
          label=""
          value={form.sinus}
          onChange={(val) => updateField("sinus", val)}
          options={[
            { value: "без включений", label: "без включений" },
            { value: "с включениями", label: "с включениями" },
          ]}
        />
      </Fieldset>

      <Fieldset title="Область надпочечников">
        <SelectWithTextarea
          label=""
          selectValue={form.adrenalArea}
          textareaValue={form.adrenalAreaText}
          onSelectChange={val => updateField("adrenalArea", val)}
          onTextareaChange={val => updateField("adrenalAreaText", val)}
          options={[
            { value: "не изменена", label: "не изменена" },
            { value: "изменена", label: "изменена" },
          ]}
          triggerValue="изменена"
          textareaLabel="Описание изменений"
        />
      </Fieldset>

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

export default KidneyCommon;
export type { KidneyProtocol } from "@types";