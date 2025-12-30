// Frontend/src/components/organs/Breast/BreastSide.tsx
import React from "react";
import { Fieldset, ButtonSelect } from "@components/common";
import { useFormState, useFieldUpdate, useListManager } from "@hooks";
import { BreastNodeComponent } from "./BreastNode";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { BreastSideProtocol, BreastNode, BreastSideProps } from "@types";

const defaultSideState: BreastSideProtocol = {
  skin: "не изменена",
  skinComment: "",
  nipples: "не изменены",
  nipplesComment: "",
  milkDucts: "не расширены",
  volumeFormations: "не определяются",
  nodesList: [],
};

export const BreastSide: React.FC<BreastSideProps> = ({
  side,
  value,
  onChange,
}) => {
  const initialValue: BreastSideProtocol = {
    ...defaultSideState,
    ...(value || {}),
    nodesList: value?.nodesList || [],
  };

  const [form, setForm] = useFormState<BreastSideProtocol>(initialValue, value);
  const updateField = useFieldUpdate(form, setForm, onChange);

  const title = side === "left" ? "Левая молочная железа" : "Правая молочная железа";

  const nodesManager = useListManager<BreastNode>(
    form.nodesList,
    form,
    setForm,
    onChange,
    "nodesList"
  );

  const addNode = () => {
    const newNode: BreastNode = {
      number: form.nodesList.length + 1,
      size1: "",
      size2: "",
      depth: "",
      direction: "",
      echogenicity: "средняя",
      echostructure: "однородная",
      contour: "четкий ровный",
      orientation: "горизонтальная",
      bloodFlow: "не изменен",
      comment: "",
    };
    nodesManager.addItem(newNode);
  };

  const updateSelect = (field: keyof BreastSideProtocol, value: string) => {
    const draft: BreastSideProtocol = { ...form, [field]: value };

    if (field === "volumeFormations" && value === "не определяются") {
      draft.nodesList = [];
    }

    setForm(draft);
    onChange?.(draft);
  };

  return (
    <div className="flex flex-col gap-4">
      <h3 className="m-0 mb-4 text-slate-700 text-lg font-semibold">{title}</h3>

      <Fieldset title="Общие характеристики">
        <ButtonSelect
          label="Кожа"
          value={form.skin}
          onChange={(val) => updateSelect("skin", val)}
          options={[
            { value: "не изменена", label: "не изменена" },
            { value: "изменена", label: "изменена" },
          ]}
        />

        {form.skin === "изменена" && (
          <div>
            <label className={labelClasses}>
              Описание изменений кожи
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.skinComment}
                onChange={(e) => updateField("skinComment", e.target.value)}
              />
            </label>
          </div>
        )}

        <ButtonSelect
          label="Соски и ареолы"
          value={form.nipples}
          onChange={(val) => updateSelect("nipples", val)}
          options={[
            { value: "не изменены", label: "не изменены" },
            { value: "изменены", label: "изменены" },
          ]}
        />

        {form.nipples === "изменены" && (
          <div>
            <label className={labelClasses}>
              Описание изменений сосков и ареол
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.nipplesComment}
                onChange={(e) => updateField("nipplesComment", e.target.value)}
              />
            </label>
          </div>
        )}

        <ButtonSelect
          label="Млечные протоки"
          value={form.milkDucts}
          onChange={(val) => updateField("milkDucts", val)}
          options={[
            { value: "не расширены", label: "не расширены" },
            { value: "расширены", label: "расширены" },
          ]}
        />
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
              <BreastNodeComponent
                key={index}
                node={node}
                onUpdate={(field, value) => {
                  nodesManager.updateItem(index, field, value);
                }}
                onRemove={() => {
                  nodesManager.removeItem(index);
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

export default BreastSide;
