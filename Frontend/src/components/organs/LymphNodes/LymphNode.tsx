// src/components/organs/LymphNodes/LymphNode.tsx

import React from "react";
import { ButtonSelect } from "@/UI";
import type { LymphNodeProps } from "@/types/organs/lymphNodes";
import { Trash2 } from "lucide-react";

export const LymphNode: React.FC<LymphNodeProps> = ({
  node,
  onUpdate,
  onDelete,
}) => {
  return (
    <div className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="bg-sky-500 px-4 py-2 flex items-center justify-between">
        <span className="text-white font-bold text-sm">
          Лимфоузел ({node.side === "right" ? "справа" : "слева"})
        </span>
        <button
          type="button"
          onClick={onDelete}
          className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
          title="Удалить лимфоузел"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="p-4 space-y-4">
        {/* Размеры узла */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Размер 1 (мм)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={node.size1}
              onChange={(e) => onUpdate("size1", e.target.value)}
              placeholder="0.0"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Размер 2 (мм)
            </label>
            <input
              type="text"
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              value={node.size2}
              onChange={(e) => onUpdate("size2", e.target.value)}
              placeholder="0.0"
            />
          </div>
        </div>

        {/* Характеристики */}
        <div className="space-y-3">
          <ButtonSelect
            label="Эхогенность"
            value={node.echogenicity}
            onChange={(val) => onUpdate("echogenicity", val)}
            options={[
              { value: "повышенная", label: "повышенная" },
              { value: "пониженная", label: "пониженная" },
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
              { value: "четкий ровный", label: "четкий ровный" },
              { value: "четкий не ровный", label: "четкий не ровный" },
              { value: "не четкий", label: "не четкий" },
            ]}
          />

          <ButtonSelect
            label="Кровоток"
            value={node.bloodFlow}
            onChange={(val) => onUpdate("bloodFlow", val)}
            options={[
              { value: "не изменен", label: "не изменен" },
              { value: "усилен", label: "усилен" },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default LymphNode;
