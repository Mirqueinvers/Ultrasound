// Frontend/src/components/organs/Kidney/Cysts.tsx
import React from "react";
import type { Cyst } from "@types";
import { inputClasses, buttonClasses } from "@utils/formClasses";

interface CystsProps {
  items: Cyst[];
  onAdd: () => void;
  onUpdate: (index: number, field: keyof Cyst, value: string) => void;
  onRemove: (index: number) => void;

  // множественные кисты
  multiple: boolean;
  multipleSize: string;
  onToggleMultiple: () => void;
  onChangeMultipleSize: (value: string) => void;

  // опциональный текст для кнопки добавления
  addLabel?: string;
}

export const Cysts: React.FC<CystsProps> = ({
  items,
  onAdd,
  onUpdate,
  onRemove,
  multiple,
  multipleSize,
  onToggleMultiple,
  onChangeMultipleSize,
  addLabel = "Добавить кисту",
}) => {
  const splitSize = (size: string): [string, string] => {
    const [s1 = "", s2 = ""] = size.split("x");
    return [s1, s2];
  };

  return (
    <div className="space-y-2 ml-4">
      {/* Кнопки: добавить одиночную и переключатель множественных кист */}
      <div className="flex gap-2">
        <button
          type="button"
          className={buttonClasses}
          onClick={onAdd}
        >
          {addLabel}
        </button>

        <button
          type="button"
          className={`${buttonClasses} ${
            multiple ? "bg-green-600 hover:bg-green-700" : ""
          }`}
          onClick={onToggleMultiple}
        >
          Множественные кисты
        </button>
      </div>

      {/* Блок множественных кист */}
      {multiple && (
        <div className="flex items-center gap-2 bg-yellow-50 p-2 rounded">
          <label className="flex items-center gap-2 flex-1">
            <span className="text-xs font-medium text-gray-700">
              Максимальным размером до (мм)
            </span>
            <input
              type="text"
              className={`${inputClasses} text-xs py-1 w-24`}
              value={multipleSize}
              onChange={e => onChangeMultipleSize(e.target.value)}
            />
          </label>

          <button
            type="button"
            className="p-1 text-gray-400 hover:text-red-600 focus:outline-none focus:text-red-600 transition-colors"
            onClick={onToggleMultiple}
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
      )}

      {/* Список одиночных кист */}
      {items.map((cyst, index) => {
        const [size1, size2] = splitSize(cyst.size);

        return (
          <div key={index} className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700 min-w-[20px]">
              {index + 1}.
            </span>

            <div className="flex-1 flex items-end gap-1">
              <label className="flex-1">
                <span className="text-xs text-gray-500">Размер 1 (мм)</span>
                <input
                  type="text"
                  className={`${inputClasses} text-xs py-1`}
                  value={size1}
                  onChange={e => {
                    const newSize1 = e.target.value;
                    const newSize = newSize1 + (size2 ? `x${size2}` : "");
                    onUpdate(index, "size", newSize);
                  }}
                />
              </label>

              <span className="text-gray-500 pb-1">×</span>

              <label className="flex-1">
                <span className="text-xs text-gray-500">Размер 2 (мм)</span>
                <input
                  type="text"
                  className={`${inputClasses} text-xs py-1`}
                  value={size2}
                  onChange={e => {
                    const newSize2 = e.target.value;
                    const newSize = size1 + (newSize2 ? `x${newSize2}` : "");
                    onUpdate(index, "size", newSize);
                  }}
                />
              </label>
            </div>

            <label className="flex-1">
              <span className="text-xs text-gray-500">Локализация</span>
              <select
                className={`${inputClasses} text-xs py-1`}
                value={cyst.location}
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
        );
      })}
    </div>
  );
};
