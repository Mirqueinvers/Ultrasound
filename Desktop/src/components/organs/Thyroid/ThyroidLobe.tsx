import React from "react";
import { normalRanges } from "@components/common";
import { ButtonSelect, SizeRow, Fieldset } from "@/UI";
import { useFieldFocus } from "@hooks";
import { useThyroidLobe, THYROID_OPTIONS } from "@hooks/organs/useThyroidLobe";
import { ThyroidNodeComponent } from "./ThyroidNode";
import type { ThyroidLobeProps } from "@/types/organs/thyroid";
import { Plus, Trash2 } from "lucide-react";

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
  const {
    form,
    updateField,
    updateSelect,
    nodesManager,
    addNode,
    removeNode,
  } = useThyroidLobe(side, value, onChange);

  const organName = side === "left" ? "leftThyroidLobe" : "rightThyroidLobe";

  const lengthFocus = useFieldFocus(organName, "length");
  const widthFocus = useFieldFocus(organName, "width");
  const depthFocus = useFieldFocus(organName, "depth");
  const volumeFocus = useFieldFocus(organName, "volume");

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
            focus={volumeFocus}
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
            { value: THYROID_OPTIONS.none, label: THYROID_OPTIONS.none },
            { value: THYROID_OPTIONS.present, label: THYROID_OPTIONS.present },
          ]}
        />

        {form.volumeFormations === THYROID_OPTIONS.present && (
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
                        onClick={() => removeNode(index)}
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
                        onRemove={() => removeNode(index)}
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