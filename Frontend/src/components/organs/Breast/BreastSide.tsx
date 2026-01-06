import React from "react";
import { Fieldset, ButtonSelect, SelectWithTextarea } from "@/UI";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";
import { useFormState, useFieldUpdate, useListManager } from "@hooks";
import { BreastNodeComponent } from "./BreastNode";
import { inputClasses, labelClasses } from "@utils/formClasses";
import { Plus } from "lucide-react";
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
    <ResearchSectionCard title={title} headerClassName="bg-sky-500">
      <div className="flex flex-col gap-6">
        {/* Общие характеристики */}
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
            <label className={labelClasses + " w-full"}>
              Описание изменений кожи
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.skinComment}
                onChange={(e) => updateField("skinComment", e.target.value)}
              />
            </label>
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
            <label className={labelClasses + " w-full"}>
              Описание изменений сосков и ареол
              <textarea
                rows={2}
                className={inputClasses + " resize-y"}
                value={form.nipplesComment}
                onChange={(e) => updateField("nipplesComment", e.target.value)}
              />
            </label>
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

        {/* Объемные образования */}
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
            <div className="space-y-3">
              {form.nodesList.length === 0 && (
                <div className="w-full text-center py-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                  <p className="text-slate-500 text-sm mb-4">Узлы не добавлены</p>
                  <button
                    type="button"
                    onClick={addNode}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg font-medium"
                  >
                    <Plus size={18} />
                    Добавить узел
                  </button>
                </div>
              )}

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
                  onAdd={addNode}
                  isLast={index === form.nodesList.length - 1}
                />
              ))}
            </div>
          )}
        </Fieldset>
      </div>
    </ResearchSectionCard>
  );
};

export default BreastSide;
