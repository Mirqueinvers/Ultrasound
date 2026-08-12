// src/components/organs/Gallbladder/GallbladderConcretions.tsx
import React from "react";
import { SizeRow, ButtonSelect } from "@/UI";
import { Plus, Trash2 } from "lucide-react";
import type { GallbladderConcretionsProps } from "@/types/organs/gallbladder";

export const GallbladderConcretions: React.FC<GallbladderConcretionsProps> = ({
  items,
  onAdd,
  onUpdate,
  onRemove,
  addLabel = "Добавить конкремент",
}) => {
  return (
    <div className="mt-3 space-y-3">
      {items.length === 0 ? (
        <div className="text-center py-4 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-slate-500 text-xs mb-3">
            Конкременты не добавлены
          </p>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-4 py-1.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all text-sm"
          >
            <Plus size={16} />
            {addLabel}
          </button>
        </div>
      ) : (
        <>
          {items.map((concretion, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="bg-sky-500 px-3 py-1.5 flex items-center justify-between">
                <span className="text-white font-semibold text-xs">
                  Конкремент #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-white hover:bg-white/20 p-1 rounded-md transition-colors"
                  title="Удалить конкремент"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="p-3 flex flex-col gap-2">
                <SizeRow
                  label="Размеры (мм)"
                  value={concretion.size}
                  onChange={(val) => onUpdate(index, "size", val)}
                />

                <label className="flex-1">
                  <span className="text-[11px] text-gray-500 block mb-1">
                    Положение
                  </span>
                  <ButtonSelect
                    label=""
                    value={concretion.position}
                    onChange={(val) => onUpdate(index, "position", val)}
                    options={[
                      { value: "шейки", label: "шейка" },
                      { value: "тела", label: "тело" },
                      { value: "дна", label: "дно" },
                    ]}
                  />
                </label>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all text-sm"
          >
            <Plus size={16} />
            {addLabel}
          </button>
        </>
      )}
    </div>
  );
};

export default GallbladderConcretions;
