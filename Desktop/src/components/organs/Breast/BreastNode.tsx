import React, { useMemo } from "react";
import { ButtonSelect } from "@/UI";
import { inputClasses, labelClasses } from "@utils/formClasses";
import { Trash2, Plus } from "lucide-react";
import type { BreastNodeProps } from "@types";

function calcVolume(a: string, b: string, c: string): string {
  const va = parseFloat(a);
  const vb = parseFloat(b);
  const vc = parseFloat(c);
  if (isNaN(va) || isNaN(vb) || isNaN(vc)) return "";
  const volumeMm3 = (Math.PI * va * vb * vc) / 6;
  const volumeCm3 = volumeMm3 / 1000;
  return volumeCm3.toFixed(2);
}

export const BreastNodeComponent: React.FC<BreastNodeProps> = ({
  node,
  onUpdate,
  onRemove,
  onAdd,
  isLast = false,
}) => {
  const volume = useMemo(() => calcVolume(node.size1, node.size2, node.size3), [node.size1, node.size2, node.size3]);

  return (
    <>
      <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg">
        <div className="bg-sky-500 px-4 py-2 flex items-center justify-between">
          <span className="text-white font-bold text-sm">Узел #{node.number}</span>
          <button
            type="button"
            onClick={onRemove}
            className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
            title="Удалить узел"
          >
            <Trash2 size={16} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <label className={labelClasses}>
              Размер 1 (мм)
              <input
                type="text"
                className={inputClasses}
                value={node.size1}
                onChange={(e) => onUpdate("size1", e.target.value)}
                placeholder="0.0"
              />
            </label>

            <label className={labelClasses}>
              Размер 2 (мм)
              <input
                type="text"
                className={inputClasses}
                value={node.size2}
                onChange={(e) => onUpdate("size2", e.target.value)}
                placeholder="0.0"
              />
            </label>

            <label className={labelClasses}>
              Размер 3 (мм)
              <input
                type="text"
                className={inputClasses}
                value={node.size3}
                onChange={(e) => onUpdate("size3", e.target.value)}
                placeholder="0.0"
              />
            </label>

            <label className={labelClasses}>
              Глубина (мм)
              <input
                type="text"
                className={inputClasses}
                value={node.depth}
                onChange={(e) => onUpdate("depth", e.target.value)}
                placeholder="0.0"
              />
            </label>
          </div>

          {volume && (
            <div className="text-sm font-semibold text-slate-700 bg-sky-50 rounded-lg px-3 py-2 border border-sky-200">
              Объём: {volume} см³
            </div>
          )}

          <label className={labelClasses}>
            Направление узла (часы)
            <input
              type="number"
              min="1"
              max="12"
              className={inputClasses}
              value={node.direction}
              onChange={(e) => onUpdate("direction", e.target.value)}
              placeholder="1-12"
            />
          </label>

          <div className="space-y-3">
            <ButtonSelect
              label="Эхогенность"
              value={node.echogenicity}
              onChange={(val) => onUpdate("echogenicity", val)}
              options={[
                { value: "средняя", label: "средняя" },
                { value: "повышенная", label: "повышенная" },
                { value: "пониженная", label: "пониженная" },
                { value: "анэхогенный", label: "анэхогенный" },
                { value: "смешанная", label: "смешанная" },
              ]}
            />

            <ButtonSelect
              label="Эхоструктура"
              value={node.echostructure}
              onChange={(val) => onUpdate("echostructure", val)}
              options={[
                { value: "однородная", label: "однородная" },
                { value: "неоднородная", label: "неоднородная" },
              ]}
            />

            <ButtonSelect
              label="Контур"
              value={node.contour}
              onChange={(val) => onUpdate("contour", val)}
              options={[
                { value: "четкий ровный", label: "четкий ровный" },
                { value: "четкий неровный", label: "четкий неровный" },
                { value: "нечеткий", label: "нечеткий" },
              ]}
            />

            <ButtonSelect
              label="Ориентация"
              value={node.orientation}
              onChange={(val) => onUpdate("orientation", val)}
              options={[
                { value: "горизонтальная", label: "горизонтальная" },
                { value: "вертикальная", label: "вертикальная" },
              ]}
            />

            <ButtonSelect
              label="ЦДК"
              value={node.bloodFlow}
              onChange={(val) => onUpdate("bloodFlow", val)}
              options={[
                { value: "не изменен", label: "не изменен" },
                { value: "усилен", label: "усилен" },
                { value: "усилен периферический", label: "усилен периферический" },
              ]}
            />
          </div>

          <label className={labelClasses + " w-full"}>
            Комментарий к узлу
            <textarea
              rows={3}
              className={inputClasses + " resize-y"}
              value={node.comment}
              onChange={(e) => onUpdate("comment", e.target.value)}
              placeholder="Дополнительные заметки..."
            />
          </label>
        </div>
      </div>

      {isLast && onAdd && (
        <button
          type="button"
          onClick={onAdd}
          className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all font-medium"
        >
          <Plus size={18} />
          Добавить узел
        </button>
      )}
    </>
  );
};

export default BreastNodeComponent;