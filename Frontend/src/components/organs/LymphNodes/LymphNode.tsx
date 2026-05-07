// src/components/organs/LymphNodes/LymphNode.tsx

import React from "react";
import { ButtonSelect } from "@/UI";
import { inputClasses, labelClasses } from "@utils/formClasses";
import { Trash2 } from "lucide-react";
import type { LymphNodeProps } from "@/types/organs/lymphNodes";

export const LymphNode: React.FC<LymphNodeProps> = ({ node, onUpdate, onDelete }) => {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="bg-sky-500 px-4 py-2 flex items-center justify-between">
        <span className="text-white font-bold text-sm">
          {node.side === "right" ? "Правый" : "Левый"} узел
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          title="Удалить узел"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
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
        </div>

        <div className="space-y-3">
          <ButtonSelect
            label="Эхогенность"
            value={node.echogenicity}
            onChange={(val) => onUpdate("echogenicity", val)}
            options={[
              { value: "изоэхогенный", label: "изоэхогенный" },
              { value: "гипоэхогенный", label: "гипоэхогенный" },
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
            label="Форма"
            value={node.shape}
            onChange={(val) => onUpdate("shape", val)}
            options={[
              { value: "овальная", label: "овальная" },
              { value: "округлая", label: "округлая" },
            ]}
          />

          <ButtonSelect
            label="Контур"
            value={node.contour}
            onChange={(val) => onUpdate("contour", val)}
            options={[
              { value: "ровный четкий", label: "ровный четкий" },
              { value: "нечеткий", label: "нечеткий" },
              { value: "неровный", label: "неровный" },
            ]}
          />

          <ButtonSelect
            label="Кровоток"
            value={node.bloodFlow}
            onChange={(val) => onUpdate("bloodFlow", val)}
            options={[
              { value: "не определяется", label: "не определяется" },
              { value: "сохранен", label: "сохранен" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default LymphNode;
