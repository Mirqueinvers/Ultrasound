// src/components/organs/Thyroid/ThyroidNode.tsx
import React from "react";
import { ButtonSelect } from "@/UI";
import type { ThyroidNodeProps } from "@/types/organs/thyroid";

export const ThyroidNodeComponent: React.FC<ThyroidNodeProps> = ({
  node,
  onUpdate,
}) => {
  return (
    <div className="space-y-4">
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
            { value: "изоэхогенная", label: "изоэхогенная" },
            { value: "анэхогенная", label: "анэхогенная" },
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
          label="Кровоток"
          value={node.bloodFlow}
          onChange={(val) => onUpdate("bloodFlow", val)}
          options={[
            { value: "не изменен", label: "не изменен" },
            { value: "усилен", label: "усилен" },
            { value: "обеднен", label: "обеднен" },
          ]}
        />
      </div>

      {/* Комментарий */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Комментарий
        </label>
        <textarea
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg transition-all resize-none focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
          rows={3}
          value={node.comment}
          onChange={(e) => onUpdate("comment", e.target.value)}
          placeholder="Дополнительные заметки..."
        />
      </div>
    </div>
  );
};

export default ThyroidNodeComponent;
