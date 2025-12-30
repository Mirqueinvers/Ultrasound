// Frontend/src/components/organs/Thyroid/ThyroidNode.tsx
import React from "react";
import { ButtonSelect } from "@components/common";
import { inputClasses, labelClasses } from "@utils/formClasses";
import type { ThyroidNode } from "@types";

interface ThyroidNodeProps {
  node: ThyroidNode;
  onUpdate: (field: keyof ThyroidNode, value: string) => void;
  onRemove: () => void;
}

export const ThyroidNodeComponent: React.FC<ThyroidNodeProps> = ({
  node,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-3 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-sm font-semibold text-slate-700">
          Узел №{node.number}
        </h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm"
        >
          Удалить
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className={labelClasses}>
            Размер 1 (мм)
            <input
              type="text"
              className={inputClasses}
              value={node.size1}
              onChange={(e) => onUpdate("size1", e.target.value)}
            />
          </label>
        </div>
        <div>
          <label className={labelClasses}>
            Размер 2 (мм)
            <input
              type="text"
              className={inputClasses}
              value={node.size2}
              onChange={(e) => onUpdate("size2", e.target.value)}
            />
          </label>
        </div>
      </div>

      <div className="space-y-3">
        <ButtonSelect
          label="Эхогенность"
          value={node.echogenicity}
          onChange={(val) => onUpdate("echogenicity", val)}
          options={[
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
            { value: "смешанная", label: "смешанная" },
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
            { value: "усилен периферический", label: "усилен периферический" },
          ]}
        />

        <div>
          <label className={labelClasses}>
            Комментарий к узлу
            <textarea
              rows={2}
              className={inputClasses + " resize-y"}
              value={node.comment}
              onChange={(e) => onUpdate("comment", e.target.value)}
            />
          </label>
        </div>
      </div>
    </div>
  );
};
