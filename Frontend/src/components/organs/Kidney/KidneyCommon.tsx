import React, { useState } from "react";
import { RangeIndicator, normalRanges } from "../../common/NormalRange";
import { useFieldFocus } from "../../hooks/useFieldFocus";
import { Concrements } from "./Concrements";
import { Cysts } from "./Cysts";
import { Fieldset } from "../../common/Fieldset";
import { inputClasses, labelClasses } from "../../common/formClasses";

export interface Concrement {
  size: string; // мм
  location: string; // локализация
}

export interface Cyst {
  size: string; // мм
  location: string; // локализация
}

export interface KidneyProtocol {
  // Размеры
  length: string;
  width: string;
  thickness: string;

  // Паренхима
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

  // Чашечно-лоханочная система
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

  // Синус
  sinus: string;

  // Область надпочечников
  adrenalArea: string;
  adrenalAreaText: string;

  // Контур почки
  contour: string;

  // Дополнительно
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
  const ranges = side === "left" ? normalRanges.leftKidney : normalRanges.rightKidney;

  const lengthFocus = useFieldFocus(organName, "length");
  const widthFocus = useFieldFocus(organName, "width");
  const thicknessFocus = useFieldFocus(organName, "thickness");

  const updateField = (field: keyof KidneyProtocol, val: string) => {
    const updated: KidneyProtocol = { ...form, [field]: val };

    if (field === "parenchymaPathologicalFormations" && val === "не определяются") {
      updated.parenchymaPathologicalFormationsText = "";
    }

    if (field === "pcsPathologicalFormations" && val === "не определяются") {
      updated.pcsPathologicalFormationsText = "";
    }

    if (field === "pcsMicroliths" && val === "не определяются") {
      updated.pcsMicrolithsSize = "";
    }

    if (field === "adrenalArea" && val === "не изменена") {
      updated.adrenalAreaText = "";
    }

    if (field === "parenchymaConcrements" && val === "не определяются") {
      updated.parenchymaConcrementslist = [];
    }
    if (field === "parenchymaCysts" && val === "не определяются") {
      updated.parenchymaCystslist = [];
    }
    if (field === "pcsConcrements" && val === "не определяются") {
      updated.pcsConcrementslist = [];
    }
    if (field === "pcsCysts" && val === "не определяются") {
      updated.pcsCystslist = [];
    }

    setForm(updated);
    onChange?.(updated);
  };

  const toggleParenchymaMultipleCysts = () => {
    const updated: KidneyProtocol = {
      ...form,
      parenchymaMultipleCysts: !form.parenchymaMultipleCysts,
      parenchymaMultipleCystsSize: !form.parenchymaMultipleCysts
        ? form.parenchymaMultipleCystsSize
        : "",
    };
    setForm(updated);
    onChange?.(updated);
  };

  const togglePcsMultipleCysts = () => {
    const updated: KidneyProtocol = {
      ...form,
      pcsMultipleCysts: !form.pcsMultipleCysts,
      pcsMultipleCystsSize: !form.pcsMultipleCysts
        ? form.pcsMultipleCystsSize
        : "",
    };
    setForm(updated);
    onChange?.(updated);
  };

  // паренхима – конкременты
  const addParenchymaConcrement = () => {
    const updated = {
      ...form,
      parenchymaConcrementslist: [
        ...form.parenchymaConcrementslist,
        { size: "", location: "" },
      ],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updateParenchymaConcrement = (
    index: number,
    field: keyof Concrement,
    val: string,
  ) => {
    const updatedList = form.parenchymaConcrementslist.map((item, i) =>
      i === index ? { ...item, [field]: val } : item,
    );
    const updated = { ...form, parenchymaConcrementslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const removeParenchymaConcrement = (index: number) => {
    const updatedList = form.parenchymaConcrementslist.filter((_, i) => i !== index);
    const updated = { ...form, parenchymaConcrementslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  // паренхима – кисты
  const addParenchymaCyst = () => {
    const updated = {
      ...form,
      parenchymaCystslist: [...form.parenchymaCystslist, { size: "", location: "" }],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updateParenchymaCyst = (
    index: number,
    field: keyof Cyst,
    val: string,
  ) => {
    const updatedList = form.parenchymaCystslist.map((item, i) =>
      i === index ? { ...item, [field]: val } : item,
    );
    const updated = { ...form, parenchymaCystslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const removeParenchymaCyst = (index: number) => {
    const updatedList = form.parenchymaCystslist.filter((_, i) => i !== index);
    const updated = { ...form, parenchymaCystslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  // ЧЛС – конкременты
  const addPcsConcrement = () => {
    const updated = {
      ...form,
      pcsConcrementslist: [...form.pcsConcrementslist, { size: "", location: "" }],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updatePcsConcrement = (
    index: number,
    field: keyof Concrement,
    val: string,
  ) => {
    const updatedList = form.pcsConcrementslist.map((item, i) =>
      i === index ? { ...item, [field]: val } : item,
    );
    const updated = { ...form, pcsConcrementslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const removePcsConcrement = (index: number) => {
    const updatedList = form.pcsConcrementslist.filter((_, i) => i !== index);
    const updated = { ...form, pcsConcrementslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  // ЧЛС – кисты
  const addPcsCyst = () => {
    const updated = {
      ...form,
      pcsCystslist: [...form.pcsCystslist, { size: "", location: "" }],
    };
    setForm(updated);
    onChange?.(updated);
  };

  const updatePcsCyst = (index: number, field: keyof Cyst, val: string) => {
    const updatedList = form.pcsCystslist.map((item, i) =>
      i === index ? { ...item, [field]: val } : item,
    );
    const updated = { ...form, pcsCystslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const removePcsCyst = (index: number) => {
    const updatedList = form.pcsCystslist.filter((_, i) => i !== index);
    const updated = { ...form, pcsCystslist: updatedList };
    setForm(updated);
    onChange?.(updated);
  };

  const showParenchymaPathologicalTextarea =
    form.parenchymaPathologicalFormations === "определяются";
  const showPcsPathologicalTextarea =
    form.pcsPathologicalFormations === "определяются";
  const showMicrolithsSize = form.pcsMicroliths === "определяются";
  const showAdrenalAreaTextarea = form.adrenalArea === "изменена";

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">{title}</h3>

      {/* Размеры */}
      <Fieldset title="Размеры">
        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Длина (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.length}
              onChange={e => updateField("length", e.target.value)}
              onFocus={lengthFocus.handleFocus}
              onBlur={lengthFocus.handleBlur}
            />
          </label>
          <RangeIndicator value={form.length} normalRange={ranges?.length} />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Ширина (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.width}
              onChange={e => updateField("width", e.target.value)}
              onFocus={widthFocus.handleFocus}
              onBlur={widthFocus.handleBlur}
            />
          </label>
          <RangeIndicator value={form.width} normalRange={ranges?.width} />
        </div>

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Толщина (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.thickness}
              onChange={e => updateField("thickness", e.target.value)}
              onFocus={thicknessFocus.handleFocus}
              onBlur={thicknessFocus.handleBlur}
            />
          </label>
          <RangeIndicator value={form.thickness} normalRange={ranges?.thickness} />
        </div>
      </Fieldset>

      {/* Контур почки */}
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

      {/* Паренхима */}
      <Fieldset title="Паренхима">
        <div>
          <label className={labelClasses}>
            Размер (мм)
            <input
              type="text"
              className={inputClasses}
              value={form.parenchymaSize}
              onChange={e => updateField("parenchymaSize", e.target.value)}
            />
          </label>
        </div>

        <div>
          <label className={labelClasses}>
            Эхогенность
            <select
              className={inputClasses}
              value={form.parenchymaEchogenicity}
              onChange={e => updateField("parenchymaEchogenicity", e.target.value)}
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
              onChange={e => updateField("parenchymaStructure", e.target.value)}
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
              onChange={e => updateField("parenchymaConcrements", e.target.value)}
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
              onChange={e => updateField("parenchymaCysts", e.target.value)}
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

        <div>
          <label className={labelClasses}>
            Патологические образования
            <select
              className={inputClasses}
              value={form.parenchymaPathologicalFormations}
              onChange={e => {
                const val = e.target.value;
                const updated: KidneyProtocol = {
                  ...form,
                  parenchymaPathologicalFormations: val,
                };
                if (val === "не определяются") {
                  updated.parenchymaPathologicalFormationsText = "";
                }
                setForm(updated);
                onChange?.(updated);
              }}
            >
              <option value="" />
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>
        </div>

        {showParenchymaPathologicalTextarea && (
          <div>
            <label className={labelClasses}>
              Описание патологических образований
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                value={form.parenchymaPathologicalFormationsText}
                onChange={e =>
                  updateField("parenchymaPathologicalFormationsText", e.target.value)
                }
              />
            </label>
          </div>
        )}
      </Fieldset>

      {/* Чашечно-лоханочная система */}
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

        <div className="flex items-center gap-4">
          <label className={labelClasses}>
            Микролиты
            <select
              className={inputClasses}
              value={form.pcsMicroliths}
              onChange={e => {
                const val = e.target.value;
                const updated: KidneyProtocol = { ...form, pcsMicroliths: val };
                if (val === "не определяются") {
                  updated.pcsMicrolithsSize = "";
                }
                setForm(updated);
                onChange?.(updated);
              }}
            >
              <option value="" />
              <option value="не определяются">не определяются</option>
              <option value="определяются">определяются</option>
            </select>
          </label>

          {showMicrolithsSize && (
            <label className={labelClasses}>
              Размером до (мм)
              <input
                type="text"
                className={inputClasses}
                value={form.pcsMicrolithsSize}
                onChange={e => updateField("pcsMicrolithsSize", e.target.value)}
              />
            </label>
          )}
        </div>

        <div>
          <label className={labelClasses}>
            Конкременты
            <select
              className={inputClasses}
              value={form.pcsConcrements}
              onChange={e => updateField("pcsConcrements", e.target.value)}
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
              onChange={e => updateField("pcsCysts", e.target.value)}
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

        <div>
          <label className={labelClasses}>
            Патологические образования
            <select
              className={inputClasses}
              value={form.pcsPathologicalFormations}
              onChange={e => {
                const val = e.target.value;
                const updated: KidneyProtocol = {
                  ...form,
                  pcsPathologicalFormations: val,
                };
                if (val === "не определяются") {
                  updated.pcsPathologicalFormationsText = "";
                }
                setForm(updated);
                onChange?.(updated);
              }}
            >
              <option value="" />
              <option value="определяются">определяются</option>
              <option value="не определяются">не определяются</option>
            </select>
          </label>
        </div>

        {showPcsPathologicalTextarea && (
          <div>
            <label className={labelClasses}>
              Описание патологических образований
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                value={form.pcsPathologicalFormationsText}
                onChange={e =>
                  updateField("pcsPathologicalFormationsText", e.target.value)
                }
              />
            </label>
          </div>
        )}
      </Fieldset>

      {/* Синус */}
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

      {/* Область надпочечников */}
      <Fieldset title="Область надпочечников">
        <div>
          <label className={labelClasses}>
            Состояние
            <select
              className={inputClasses}
              value={form.adrenalArea}
              onChange={e => {
                const val = e.target.value;
                const updated: KidneyProtocol = { ...form, adrenalArea: val };
                if (val === "не изменена") {
                  updated.adrenalAreaText = "";
                }
                setForm(updated);
                onChange?.(updated);
              }}
            >
              <option value="" />
              <option value="не изменена">не изменена</option>
              <option value="изменена">изменена</option>
            </select>
          </label>
        </div>

        {showAdrenalAreaTextarea && (
          <div>
            <label className={labelClasses}>
              Описание изменений
              <textarea
                rows={3}
                className={inputClasses + " resize-y"}
                value={form.adrenalAreaText}
                onChange={e => updateField("adrenalAreaText", e.target.value)}
              />
            </label>
          </div>
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

export default KidneyCommon;
