import React, { useEffect } from "react";
import { normalRanges } from "@components/common";
import { ButtonSelect, SizeRow, Fieldset } from "@/UI";
import { useFormState, useFieldUpdate, useFieldFocus, useListManager } from "@hooks";
import { ThyroidNodeComponent } from "./ThyroidNode";
import type { ThyroidLobeProtocol, ThyroidNode, ThyroidLobeProps } from "@/types/organs/thyroid";
import { defaultThyroidLobeState } from "@/types/defaultStates/organs/thyroid";
import { Plus, Trash2 } from "lucide-react";

const DEFAULT_NODE_ECHOGENICITY = "изоэхогенный";
const DEFAULT_NODE_ECHOSTRUCTURE = "однородная";
const DEFAULT_NODE_CONTOUR = "четкий ровный";
const DEFAULT_NODE_ORIENTATION = "горизонтальная";
const DEFAULT_NODE_BLOOD_FLOW = "не изменен";
const VOLUME_FORMATIONS_NONE = "не определяются";
const VOLUME_FORMATIONS_PRESENT = "определяются";
const LABEL_DIMENSIONS = "Размеры";
const LABEL_LENGTH = "Длина (мм)";
const LABEL_WIDTH = "Ширина (мм)";
const LABEL_DEPTH = "Глубина (мм)";
const LABEL_VOLUME = "Объем (мл)";
const LABEL_FORMATIONS = "Объемные образования";
const LABEL_NO_NODES = "Узлы не добавлены";
const LABEL_ADD_NODE = "Добавить узел";
const LABEL_NODE = "Узел";
const LABEL_DELETE_NODE = "Удалить узел";
const LABEL_ADDITIONAL = "Дополнительно";
const PLACEHOLDER_ADDITIONAL = "Введите дополнительное описание";

export const ThyroidLobe: React.FC<ThyroidLobeProps> = ({
  side,
  value,
  onChange,
}) => {
  const initialValue: ThyroidLobeProtocol = {
    ...defaultThyroidLobeState,
    ...(value || {}),
    nodesList: value?.nodesList || [],
  };

  const [form, setForm] = useFormState<ThyroidLobeProtocol>(initialValue);
  const updateField = useFieldUpdate(form, setForm, onChange);

  const organName = side === "left" ? "leftThyroidLobe" : "rightThyroidLobe";

  const lengthFocus = useFieldFocus(organName, "length");
  const widthFocus = useFieldFocus(organName, "width");
  const depthFocus = useFieldFocus(organName, "depth");

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
      echogenicity: DEFAULT_NODE_ECHOGENICITY,
      echostructure: DEFAULT_NODE_ECHOSTRUCTURE,
      contour: DEFAULT_NODE_CONTOUR,
      orientation: DEFAULT_NODE_ORIENTATION,
      bloodFlow: DEFAULT_NODE_BLOOD_FLOW,
      comment: "",
      echogenicFoci: "",
    };
    nodesManager.addItem(newNode);
  };

  const updateSelect = (field: keyof ThyroidLobeProtocol, value: string) => {
    const draft: ThyroidLobeProtocol = { ...form, [field]: value };

    if (field === "volumeFormations" && value === VOLUME_FORMATIONS_NONE) {
      draft.nodesList = [];
    }

    setForm(draft);
    onChange?.(draft);
  };

  return (
    <div className="flex flex-col gap-6">
      <Fieldset title={LABEL_DIMENSIONS}>
        <div className="space-y-3">
          <SizeRow
            label={LABEL_LENGTH}
            value={form.length}
            onChange={(val) => updateField("length", val)}
            focus={lengthFocus}
            range={normalRanges.thyroid.length}
          />
          <SizeRow
            label={LABEL_WIDTH}
            value={form.width}
            onChange={(val) => updateField("width", val)}
            focus={widthFocus}
            range={normalRanges.thyroid.width}
          />
          <SizeRow
            label={LABEL_DEPTH}
            value={form.depth}
            onChange={(val) => updateField("depth", val)}
            focus={depthFocus}
            range={normalRanges.thyroid.depth}
          />
          <SizeRow
            label={LABEL_VOLUME}
            value={form.volume}
            onChange={(val) => updateField("volume", val)}
            focus={useFieldFocus(organName, "volume")}
            readOnly={true}
            autoCalculated={true}
            customInputClass="w-full px-4 py-2.5 bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-300 rounded-lg font-semibold text-sky-900"
          />
        </div>
      </Fieldset>

      <Fieldset title={LABEL_FORMATIONS}>
        <ButtonSelect
          label=""
          value={form.volumeFormations}
          onChange={(val) => updateSelect("volumeFormations", val)}
          options={[
            { value: VOLUME_FORMATIONS_NONE, label: VOLUME_FORMATIONS_NONE },
            { value: VOLUME_FORMATIONS_PRESENT, label: VOLUME_FORMATIONS_PRESENT },
          ]}
        />

        {form.volumeFormations === VOLUME_FORMATIONS_PRESENT && (
          <div className="mt-6 space-y-4">
            {form.nodesList.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
                <p className="text-slate-500 text-sm mb-4">{LABEL_NO_NODES}</p>
                <button
                  type="button"
                  onClick={addNode}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  <Plus size={18} />
                  {LABEL_ADD_NODE}
                </button>
              </div>
            ) : (
              <>
                {form.nodesList.map((node, index) => (
                  <div
                    key={index}
                    className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg"
                  >
                    <div className="bg-sky-500 px-4 py-2 flex items-center justify-between">
                      <span className="text-white font-bold text-sm">
                        {`${LABEL_NODE} #${node.number}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          nodesManager.removeItem(index);
                          const updatedNodes = form.nodesList
                            .filter((_, i) => i !== index)
                            .map((n, i) => ({ ...n, number: i + 1 }));
                          const draft = { ...form, nodesList: updatedNodes };
                          setForm(draft);
                          onChange?.(draft);
                        }}
                        className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                        title={LABEL_DELETE_NODE}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="p-4">
                      <ThyroidNodeComponent
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
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addNode}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all font-medium"
                >
                  <Plus size={18} />
                  {LABEL_ADD_NODE}
                </button>
              </>
            )}
          </div>
        )}
      </Fieldset>

      <Fieldset title={LABEL_ADDITIONAL}>
        <textarea
          value={form.additional}
          onChange={(e) => updateField("additional", e.target.value)}
          rows={4}
          placeholder={PLACEHOLDER_ADDITIONAL}
          className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-800 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-200 resize-y"
        />
      </Fieldset>
    </div>
  );
};

export default ThyroidLobe;
