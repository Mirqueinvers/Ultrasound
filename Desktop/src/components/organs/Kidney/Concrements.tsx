// src/components/organs/Kidney/Concrements.tsx
import React from "react";
import { ButtonSelect, SizeRow } from "@/UI";
import { Plus, Trash2 } from "lucide-react";
import type { KidneyConcrementsProps } from "@/types/organs/kidney";

export const Concrements: React.FC<KidneyConcrementsProps> = ({
  items,
  onAdd,
  onUpdate,
  onRemove,
  addLabel = "Добавить конкремент",
}) => {
  return (
    <div className="mt-4 space-y-4">
      {items.length === 0 ? (
        <div className="text-center py-6 bg-slate-50 rounded-lg border-2 border-dashed border-slate-300">
          <p className="text-slate-500 text-sm mb-4">Конкременты не добавлены</p>
          <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-all shadow-md hover:shadow-lg font-medium"
          >
            <Plus size={18} />
            {addLabel}
          </button>
        </div>
      ) : (
        <>
          {items.map((concrement, index) => (
            <div
              key={index}
              className="bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg"
            >
              <div className="bg-sky-500 px-4 py-2 flex items-center justify-between">
                <span className="text-white font-bold text-sm">
                  Конкремент #{index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-white hover:bg-white/20 p-1.5 rounded-lg transition-colors"
                  title="Удалить конкремент"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="p-4 flex flex-col gap-3">
                <SizeRow
                  label="Размер (мм)"
                  value={concrement.size}
                  onChange={(val) => onUpdate(index, "size", val)}
                />

                <label className="flex-1">
                  <span className="text-xs text-gray-500 block mb-1">
                    Локализация
                  </span>
                  <ButtonSelect
                    label=""
                    value={concrement.location}
                    onChange={(val) => onUpdate(index, "location", val)}
                    options={[
                      { value: "верхнего полюса", label: "верхний полюс" },
                      { value: "нижнего полюса", label: "нижний полюс" },
                      { value: "центральной части", label: "в центре" },
                    ]}
                  />
                </label>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={onAdd}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border-2 border-dashed border-sky-300 text-sky-600 rounded-xl hover:bg-sky-50 hover:border-sky-400 transition-all font-medium"
          >
            <Plus size={18} />
            {addLabel}
          </button>
        </>
      )}
    </div>
  );
};

export default Concrements;
