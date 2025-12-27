import React, { useState } from "react";
import { normalRanges, SizeRow, Fieldset, SelectWithTextarea, ButtonSelect } from "@components/common";
import { useFieldFocus } from "@hooks/useFieldFocus";
import { Concrements } from "./Concrements";
import { Cysts } from "./Cysts";
import { inputClasses, labelClasses } from "@utils/formClasses";

export interface Concrement {
  size: string;
  location: string;
}

export interface Cyst {
  size: string;
  location: string;
}

export interface KidneyProtocol {
  length: string;
  width: string;
  thickness: string;
  parenchymaSize: string;
  parenchymaEchogenicity: string;
  parenchymaStructure: string;
  parenchymaConcrements: string;
  parenchymaConcrementslist: Concrement[];
  parenchymaCysts: string;
  parenchymaCystslist: Cyst[];
  parenchymaMultipleCysts: boolean;
  parenchymaMultipleCystsSize: string;
  parenchymaPathologicalFormations: string;
  parenchymaPathologicalFormationsText: string;
  pcsSize: string;
  pcsMicroliths: string;
  pcsMicrolithsSize: string;
  pcsConcrements: string;
  pcsConcrementslist: Concrement[];
  pcsCysts: string;
  pcsCystslist: Cyst[];
  pcsMultipleCysts: boolean;
  pcsMultipleCystsSize: string;
  pcsPathologicalFormations: string;
  pcsPathologicalFormationsText: string;
  sinus: string;
  adrenalArea: string;
  adrenalAreaText: string;
  contour: string;
  additional: string;
}

interface KidneyCommonProps {
  side: "left" | "right";
  value?: KidneyProtocol;
  onChange?: (value: KidneyProtocol) => void;
}

const defaultState: KidneyProtocol = {
  length: "",
  width: "",
  thickness: "",
  parenchymaSize: "",
  parenchymaEchogenicity: "",
  parenchymaStructure: "",
  parenchymaConcrements: "не определяются",
  parenchymaConcrementslist: [],
  parenchymaCysts: "не определяются",
  parenchymaCystslist: [],
  parenchymaMultipleCysts: false,
  parenchymaMultipleCystsSize: "",
  parenchymaPathologicalFormations: "не определяются",
  parenchymaPathologicalFormationsText: "",
  pcsSize: "",
  pcsMicroliths: "не определяются",
  pcsMicrolithsSize: "",
  pcsConcrements: "не определяются",
  pcsConcrementslist: [],
  pcsCysts: "не определяются",
  pcsCystslist: [],
  pcsMultipleCysts: false,
  pcsMultipleCystsSize: "",
  pcsPathologicalFormations: "не определяются",
  pcsPathologicalFormationsText: "",
  sinus: "",
  adrenalArea: "",
  adrenalAreaText: "",
  contour: "",
  additional: "",
};

const pushItem = <T,>(list: T[], item: T) => [...list, item];
const updateListItem = <T,>(
  list: T[],
  index: number,
  patch: Partial<T>,
): T[] => list.map((item, i) => (i === index ? { ...item, ...patch } : item));
const removeListItem = <T,>(list: T[], index: number): T[] =>
  list.filter((_, i) => i !== index);

export const KidneyCommon: React.FC<KidneyCommonProps> = ({
  side,
  value,
  onChange,
}) => {
  const initialValue: KidneyProtocol = {
    ...defaultState,
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

  const [form, setForm] = useState<KidneyProtocol>(initialValue);

  const organName = side === "left" ? "leftKidney" : "rightKidney";
  const title = side === "left" ? "Левая почка" : "Правая почка";
  const ranges =
    side === "left" ? normalRanges.leftKidney : normalRanges.rightKidney;

  const lengthFocus = useFieldFocus(organName, "length");
  const widthFocus = useFieldFocus(organName, "width");
  const thicknessFocus = useFieldFocus(organName, "thickness");
  const parenchymaSizeFocus = useFieldFocus(organName, "parenchymaSize");

  const setAndNotify = (draft: KidneyProtocol) => {
    setForm(draft);
    onChange?.(draft);
  };

  const updateField = (field: keyof KidneyProtocol, value: string) => {
    const draft: KidneyProtocol = { ...form, [field]: value };
    setAndNotify(draft);
  };

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
    setAndNotify(draft);
  };

  const toggleParenchymaMultipleCysts = () => {
    const draft: KidneyProtocol = {
      ...form,
      parenchymaMultipleCysts: !form.parenchymaMultipleCysts,
      parenchymaMultipleCystsSize: !form.parenchymaMultipleCysts
        ? form.parenchymaMultipleCystsSize
        : "",
    };
    setAndNotify(draft);
  };

  const togglePcsMultipleCysts = () => {
    const draft: KidneyProtocol = {
      ...form,
      pcsMultipleCysts: !form.pcsMultipleCysts,
      pcsMultipleCystsSize: !form.pcsMultipleCysts
        ? form.pcsMultipleCystsSize
        : "",
    };
    setAndNotify(draft);
  };

  const addParenchymaConcrement = () => {
    const draft: KidneyProtocol = {
      ...form,
      parenchymaConcrementslist: pushItem(form.parenchymaConcrementslist, {
        size: "",
        location: "",
      }),
    };
    setAndNotify(draft);
  };

  const updateParenchymaConcrement = (
    index: number,
    field: keyof Concrement,
    value: string,
  ) => {
    const draft: KidneyProtocol = {
      ...form,
      parenchymaConcrementslist: updateListItem(
        form.parenchymaConcrementslist,
        index,
        { [field]: value } as Partial<Concrement>,
      ),
    };
    setAndNotify(draft);
  };

  const removeParenchymaConcrement = (index: number) => {
    const draft: KidneyProtocol = {
      ...form,
      parenchymaConcrementslist: removeListItem(
        form.parenchymaConcrementslist,
        index,
      ),
    };
    setAndNotify(draft);
  };

  const addParenchymaCyst = () => {
    const draft: KidneyProtocol = {
      ...form,
      parenchymaCystslist: pushItem(form.parenchymaCystslist, {
        size: "",
        location: "",
      }),
    };
    setAndNotify(draft);
  };

  const updateParenchymaCyst = (
    index: number,
    field: keyof Cyst,
    value: string,
  ) => {
    const draft: KidneyProtocol = {
      ...form,
      parenchymaCystslist: updateListItem(
        form.parenchymaCystslist,
        index,
        { [field]: value } as Partial<Cyst>,
      ),
    };
    setAndNotify(draft);
  };

  const removeParenchymaCyst = (index: number) => {
    const draft: KidneyProtocol = {
      ...form,
      parenchymaCystslist: removeListItem(form.parenchymaCystslist, index),
    };
    setAndNotify(draft);
  };

  const addPcsConcrement = () => {
    const draft: KidneyProtocol = {
      ...form,
      pcsConcrementslist: pushItem(form.pcsConcrementslist, {
        size: "",
        location: "",
      }),
    };
    setAndNotify(draft);
  };

  const updatePcsConcrement = (
    index: number,
    field: keyof Concrement,
    value: string,
  ) => {
    const draft: KidneyProtocol = {
      ...form,
      pcsConcrementslist: updateListItem(
        form.pcsConcrementslist,
        index,
        { [field]: value } as Partial<Concrement>,
      ),
    };
    setAndNotify(draft);
  };

  const removePcsConcrement = (index: number) => {
    const draft: KidneyProtocol = {
      ...form,
      pcsConcrementslist: removeListItem(form.pcsConcrementslist, index),
    };
    setAndNotify(draft);
  };

  const addPcsCyst = () => {
    const draft: KidneyProtocol = {
      ...form,
      pcsCystslist: pushItem(form.pcsCystslist, {
        size: "",
        location: "",
      }),
    };
    setAndNotify(draft);
  };

  const updatePcsCyst = (index: number, field: keyof Cyst, value: string) => {
    const draft: KidneyProtocol = {
      ...form,
      pcsCystslist: updateListItem(
        form.pcsCystslist,
        index,
        { [field]: value } as Partial<Cyst>,
      ),
    };
    setAndNotify(draft);
  };

  const removePcsCyst = (index: number) => {
    const draft: KidneyProtocol = {
      ...form,
      pcsCystslist: removeListItem(form.pcsCystslist, index),
    };
    setAndNotify(draft);
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
          label="Характеристика"
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
            onAdd={addParenchymaConcrement}
            onUpdate={updateParenchymaConcrement}
            onRemove={removeParenchymaConcrement}
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
            onAdd={addParenchymaCyst}
            onUpdate={updateParenchymaCyst}
            onRemove={removeParenchymaCyst}
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
            onAdd={addPcsConcrement}
            onUpdate={updatePcsConcrement}
            onRemove={removePcsConcrement}
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
            onAdd={addPcsCyst}
            onUpdate={updatePcsCyst}
            onRemove={removePcsCyst}
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
          label="Состояние"
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
          label="Состояние"
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
