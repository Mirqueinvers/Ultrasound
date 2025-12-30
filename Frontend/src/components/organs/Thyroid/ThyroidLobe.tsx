// Frontend/src/components/researches/Thyroid/ThyroidLobe.tsx
import React, { useEffect } from "react";
import { Fieldset, SizeRow, ButtonSelect, normalRanges } from "@components/common";
import { useFormState, useFieldUpdate, useFieldFocus, useListManager } from "@hooks";
import { ThyroidNodeComponent } from "./ThyroidNode";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { ThyroidLobeProtocol, ThyroidNode, ThyroidLobeProps } from "@types";

const defaultLobeState: ThyroidLobeProtocol = {
  length: "",
  width: "",
  depth: "",
  volume: "",
  volumeFormations: "не определяются",
  nodesList: [],
};

export const ThyroidLobe: React.FC<ThyroidLobeProps> = ({
  side,
  value,
  onChange,
}) => {
  const initialValue: ThyroidLobeProtocol = {
    ...defaultLobeState,
    ...(value || {}),
    nodesList: value?.nodesList || [],
  };

  const [form, setForm] = useFormState<ThyroidLobeProtocol>(initialValue, value);
  const updateField = useFieldUpdate(form, setForm, onChange);

  const title = side === "left" ? "Левая доля" : "Правая доля";
  const organName = side === "left" ? "leftThyroidLobe" : "rightThyroidLobe";

  // Хуки для фокуса на полях размеров
  const lengthFocus = useFieldFocus(organName, "length");
  const widthFocus = useFieldFocus(organName, "width");
  const depthFocus = useFieldFocus(organName, "depth");

  // Автоматический расчет объема
  useEffect(() => {
    const length = parseFloat(form.length) || 0;
    const width = parseFloat(form.width) || 0;
    const depth = parseFloat(form.depth) || 0;

    if (length > 0 && width > 0 && depth > 0) {
      const volume = ((length * width * depth * 0.479) / 1000).toFixed(2);
      if (form.volume !== volume) {
        const draft = { ...form, volume };
        setForm(draft);
        onChange?.(draft);
      }
    } else if (form.volume !== "") {
      const draft = { ...form, volume: "" };
      setForm(draft);
      onChange?.(draft);
    }
  }, [form.length, form.width, form.depth]);

  const nodesManager = useListManager<ThyroidNode>(
    form.nodesList,
    form,
    setForm,
    onChange,
    "nodesList"
  );

  const addNode = () => {
    const newNode: ThyroidNode = {
      number: form.nodesList.length + 1,
      size1: "",
      size2: "",
      echogenicity: "повышенная",
      echostructure: "однородная",
      contour: "четкий ровный",
      orientation: "горизонтальная",
      bloodFlow: "не изменен",
      comment: "",
    };
    nodesManager.addItem(newNode);
  };

  const updateSelect = (field: keyof ThyroidLobeProtocol, value: string) => {
    const draft: ThyroidLobeProtocol = { ...form, [field]: value };

    if (field === "volumeFormations" && value === "не определяются") {
      draft.nodesList = [];
    }

    setForm(draft);
    onChange?.(draft);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">{title}</h3>

      <Fieldset title="Размеры">
        <SizeRow
          label="Длина (мм)"
          value={form.length}
          onChange={(val) => updateField("length", val)}
          focus={lengthFocus}
          range={normalRanges.thyroid.length}
        />
        <SizeRow
          label="Ширина (мм)"
          value={form.width}
          onChange={(val) => updateField("width", val)}
          focus={widthFocus}
          range={normalRanges.thyroid.width}
        />
        <SizeRow
          label="Глубина (мм)"
          value={form.depth}
          onChange={(val) => updateField("depth", val)}
          focus={depthFocus}
          range={normalRanges.thyroid.depth}
        />
        <div>
          <label className={labelClasses}>
            Объем (мл)
            <input
              type="text"
              className={inputClasses + " bg-gray-100"}
              value={form.volume}
              readOnly
              disabled
            />
          </label>
        </div>
      </Fieldset>

      <Fieldset title="Объемные образования">
        <ButtonSelect
          label=""
          value={form.volumeFormations}
          onChange={(val) => updateSelect("volumeFormations", val)}
          options={[
            { value: "не определяются", label: "не определяются" },
            { value: "определяются", label: "определяются" },
          ]}
        />

        {form.volumeFormations === "определяются" && (
          <div className="mt-3">
            {form.nodesList.map((node, index) => (
              <ThyroidNodeComponent
                key={index}
                node={node}
                onUpdate={(field, value) => {
                  nodesManager.updateItem(index, field, value);
                }}
                onRemove={() => {
                  nodesManager.removeItem(index);
                  // Перенумеруем оставшиеся узлы
                  const updatedNodes = form.nodesList
                    .filter((_, i) => i !== index)
                    .map((n, i) => ({ ...n, number: i + 1 }));
                  const draft = { ...form, nodesList: updatedNodes };
                  setForm(draft);
                  onChange?.(draft);
                }}
              />
            ))}

            <button
              type="button"
              onClick={addNode}
              className="mt-3 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Добавить узел
            </button>
          </div>
        )}
      </Fieldset>
    </div>
  );
};

export default ThyroidLobe;
