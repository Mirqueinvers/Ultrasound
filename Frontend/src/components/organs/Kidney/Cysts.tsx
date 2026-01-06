// Frontend/src/components/organs/Kidney/Cysts.tsx
import React from "react";
import type { Cyst } from "@types";
import { SizeRow, ButtonSelect } from "@/UI";
import { Plus, Trash2 } from "lucide-react";

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
    <div className="mt-4 space-y-4">
      {/* Множественные кисты */}
      {multiple && (
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-3">
              <div className="mb-4">Максимальным размером до </div>
              <SizeRow
                label="Размер 1 (мм)"
                value={multipleSize.split("x")[0] || ""}
                onChange={(e) => {
                  const size2 = multipleSize.split("x")[1] || "";
                  onChangeMultipleSize(e + (size2 ? `x${size2}` : ""));
                }}
              />

              <SizeRow
                label="Размер 2 (мм)"
                value={multipleSize.split("x")[1] || ""}
                onChange={(e) => {
                  const size1 = multipleSize.split("x")[0] || "";
                  onChangeMultipleSize(size1 + (e ? `x${e}` : ""));
                }}
              />
            </div>

            <button
              type="button"
              className="text-amber-600 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-white/50 flex-shrink-0 mt-2"
              onClick={onToggleMultiple}
              title="Удалить множественные кисты"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Кнопки добавления */}
      <div className="flex gap-2">
        {items.length === 0 && !multiple && (
          <div className="w-full text-center py-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
            <p className="text-slate-500 text-sm mb-4">Кисты не добавлены</p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Plus size={18} />
                {addLabel}
              </button>

              <button
                type="button"
                onClick={onToggleMultiple}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all shadow-md hover:shadow-lg font-medium"
              >
                <Plus size={18} />
                Множественные кисты
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Список одиночных кист */}
      {items.map((cyst, index) => {
        const [size1, size2] = splitSize(cyst.size);

        return (
          <div
            key={index}
            className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg"
          >
            <div className="bg-sky-500 px-4 py-2 flex items-center justify-between">
              <span className="text-white font-bold text-sm">
                Киста #{index + 1}
              </span>
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                title="Удалить кисту"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="p-4 flex flex-col gap-4">
              {/* Размеры через SizeRow */}
              <SizeRow
                label="Размер 1 (мм)"
                value={size1}
                onChange={(val) => {
                  const newSize = val + (size2 ? `x${size2}` : "");
                  onUpdate(index, "size", newSize);
                }}
              />

              <SizeRow
                label="Размер 2 (мм)"
                value={size2}
                onChange={(val) => {
                  const newSize = size1 + (val ? `x${val}` : "");
                  onUpdate(index, "size", newSize);
                }}
              />

              {/* Локализация */}
              <div>
                <label className="text-xs text-gray-500 block mb-2">
                  Локализация
                </label>
                <ButtonSelect
                  label=""
                  value={cyst.location}
                  onChange={(val) => onUpdate(index, "location", val)}
                  options={[
                    { value: "верхний полюс", label: "верхний полюс" },
                    { value: "нижний полюс", label: "нижний полюс" },
                    { value: "в центре", label: "в центре" },
                  ]}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* Кнопка добавления (если есть кисты) */}
      {items.length > 0 && (
        <div className="flex gap-2">
          {!multiple ? (
            <button
              type="button"
              onClick={onAdd}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all font-medium"
            >
              <Plus size={18} />
              {addLabel}
            </button>
          ) : (
            <button
              type="button"
              onClick={onToggleMultiple}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-amber-300 text-amber-600 rounded-xl hover:bg-amber-50 hover:border-amber-400 transition-all font-medium"
            >
              <Trash2 size={18} />
              Удалить множественные кисты
            </button>
          )}
        </div>
      )}
    </div>
  );
};


export default Cysts;
