// Frontend/src/components/organs/Kidney/Concrements.tsx
import React from "react";
import type { Concrement } from "@types";
import { inputClasses, buttonClasses } from "@utils/formClasses";

interface ConcrementsProps {
  items: Concrement[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Concrement, value: string) => void;
  onRemove: (index: number) => void;
  addLabel?: string;
}

export const Concrements: React.FC<ConcrementsProps> = ({
  items,
  onAdd,
  onUpdate,
  onRemove,
  addLabel = "Добавить конкремент",
}) => {
  return (
    <div className="space-y-2 ml-4">
      <button
        type="button"
        className={buttonClasses}
        onClick={onAdd}
      >
        {addLabel}
      </button>

      {items.map((concrement, index) => (
        <div key={index} className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 min-w-[20px]">
            {index + 1}.
          </span>

          <label className="flex-1">
            <span className="text-xs text-gray-500">Размер (мм)</span>
            <input
              type="text"
              className={`${inputClasses} text-xs py-1`}
              value={concrement.size}
              onChange={e => onUpdate(index, "size", e.target.value)}
            />
          </label>

          <label className="flex-1">
            <span className="text-xs text-gray-500">Локализация</span>
            <select
              className={`${inputClasses} text-xs py-1`}
              value={concrement.location}
              onChange={e => onUpdate(index, "location", e.target.value)}
            >
              <option value="" />
              <option value="верхний полюс">верхний полюс</option>
              <option value="нижний полюс">нижний полюс</option>
              <option value="в центре">в центре</option>
            </select>
          </label>

          <button
            type="button"
            className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
            onClick={() => onRemove(index)}
            title="Удалить"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
};
