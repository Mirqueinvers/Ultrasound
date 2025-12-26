import React, { useState } from "react";
import { normalRanges } from "../../common/NormalRange";
import { useFieldFocus } from "../../../hooks/useFieldFocus";
import { SizeRow } from "../../common/SizeRow";
import { Concrements } from "./Concrements";
import { Cysts } from "./Cysts";
import { Fieldset } from "../../common/Fieldset";
import { inputClasses, labelClasses } from "../../../utils/formClasses";
import { SelectWithTextarea } from "../../common/SelectWithTextarea";

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
  parenchymaConcrements: "",
  parenchymaConcrementslist: [],
  parenchymaCysts: "",
  parenchymaCystslist: [],
  parenchymaMultipleCysts: false,
  parenchymaMultipleCystsSize: "",
  parenchymaPathologicalFormations: "",
  parenchymaPathologicalFormationsText: "",
  pcsSize: "",
  pcsMicroliths: "",
  pcsMicrolithsSize: "",
  pcsConcrements: "",
  pcsConcrementslist: [],
  pcsCysts: "",
  pcsCystslist: [],
  pcsMultipleCysts: false,
  pcsMultipleCystsSize: "",
  pcsPathologicalFormations: "",
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
        <div>
          <label className={labelClasses}>
            Характеристика
            <select
              className={inputClasses}
              value={form.contour}
              onChange={e => updateField("contour", e.target.value)}
            >
              <option value="" />
              <option value="четкий ровный">четкий, ровный</option>
              <option value="четкий неровный">четкий, неровный</option>
              <option value="нечеткий">нечеткий</option>
            </select>
          </label>
        </div>
      </Fieldset>

      <Fieldset title="Паренхима">
        <SizeRow
          label="Размер паренхимы (мм)"
          value={form.parenchymaSize}
          onChange={val => updateField("parenchymaSize", val)}
          focus={parenchymaSizeFocus}
          range={ranges.parenchyma}
        />

        <div>
          <label className={labelClasses}>
            Эхогенность
            <select
              className={inputClasses}
              value={form.parenchymaEchogenicity}
              onChange={e =>
                updateField("parenchymaEchogenicity", e.target.value)
              }
            >
              <option value="" />
              <option value="средняя">средняя</option>
              <option value="повышена">повышена</option>
              <option value="понижена">понижена</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Структура
            <select
              className={inputClasses}
              value={form.parenchymaStructure}
              onChange={e =>
                updateField("parenchymaStructure", e.target.value)
              }
            >
              <option value="" />
              <option value="однородная">однородная</option>
              <option value="диффузно-неоднородная">диффузно-неоднородная</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Конкременты
            <select
              className={inputClasses}
              value={form.parenchymaConcrements}
              onChange={e =>
                updateSelect("parenchymaConcrements", e.target.value)
              }
            >
              <option value="" />
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

        {form.parenchymaConcrements === "определяются" && (
          <Concrements
            items={form.parenchymaConcrementslist}
            onAdd={addParenchymaConcrement}
            onUpdate={updateParenchymaConcrement}
            onRemove={removeParenchymaConcrement}
          />
        )}

        <div>
          <label className={labelClasses}>
            Кисты
            <select
              className={inputClasses}
              value={form.parenchymaCysts}
              onChange={e => updateSelect("parenchymaCysts", e.target.value)}
            >
              <option value="" />
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

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
        <div>
          <label className={labelClasses}>
            Размер
            <select
              className={inputClasses}
              value={form.pcsSize}
              onChange={e => updateField("pcsSize", e.target.value)}
            >
              <option value="" />
              <option value="не изменена">не изменена</option>
              <option value="расширена">расширена</option>
            </select>
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Микролиты
            <select
              className={inputClasses}
              value={form.pcsMicroliths}
              onChange={e =>
                updateSelect("pcsMicroliths", e.target.value, draft => {
                  if (draft.pcsMicroliths === "не определяются") {
                    draft.pcsMicrolithsSize = "";
                  }
                })
              }
            >
              <option value="" />
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

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

        <div>
          <label className={labelClasses}>
            Конкременты
            <select
              className={inputClasses}
              value={form.pcsConcrements}
              onChange={e =>
                updateSelect("pcsConcrements", e.target.value)
              }
            >
              <option value="" />
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

        {form.pcsConcrements === "определяются" && (
          <Concrements
            items={form.pcsConcrementslist}
            onAdd={addPcsConcrement}
            onUpdate={updatePcsConcrement}
            onRemove={removePcsConcrement}
          />
        )}

        <div>
          <label className={labelClasses}>
            Кисты
            <select
              className={inputClasses}
              value={form.pcsCysts}
              onChange={e => updateSelect("pcsCysts", e.target.value)}
            >
              <option value="" />
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

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
        <div>
          <label className={labelClasses}>
            Состояние
            <select
              className={inputClasses}
              value={form.sinus}
              onChange={e => updateField("sinus", e.target.value)}
            >
              <option value="" />
              <option value="без включений">без включений</option>
              <option value="с включениями">с включениями</option>
            </select>
          </label>
        </div>
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
