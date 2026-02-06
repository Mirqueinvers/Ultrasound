// src/components/organs/BrachioCephalicArteries/BrachioCephalicFormation.tsx
import React from "react";
import { Fieldset, ButtonSelect } from "@/UI";
import type { BrachioCephalicFormationProps } from "@/types/organs/brachioCephalicArteries";

export const BrachioCephalicFormation: React.FC<BrachioCephalicFormationProps> = ({
  formation,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-gray-900">
          Бляшка {formation.number}
        </h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Удалить
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Размер (мм)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formation.size}
            onChange={(e) => onUpdate("size", e.target.value)}
            placeholder="Толщина"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Локализация
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formation.location}
            onChange={(e) => onUpdate("location", e.target.value)}
            placeholder="Бифуркация, проксимальный отдел и т.д."
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <ButtonSelect
          label="Тип бляшки"
          value={formation.type}
          onChange={(val) => onUpdate("type", val)}
          options={[
            { value: "", label: "Выберите тип" },
            { value: "гипоэхогенная", label: "гипоэхогенная" },
            { value: "изоэхогенная", label: "изоэхогенная" },
            { value: "гиперэхогенная", label: "гиперэхогенная" },
            { value: "смешанной эхогенности", label: "смешанной эхогенности" },
            { value: "кальцинированная", label: "кальцинированная" },
          ]}
        />

        <ButtonSelect
          label="Стеноз"
          value={formation.stenosis}
          onChange={(val) => onUpdate("stenosis", val)}
          options={[
            { value: "", label: "Выберите стеноз" },
            { value: "до 15%", label: "до 15%" },
            { value: "15-30%", label: "15-30%" },
            { value: "30-50%", label: "30-50%" },
            { value: "50-70%", label: "50-70%" },
            { value: "70-90%", label: "70-90%" },
            { value: "более 90%", label: "более 90%" },
          ]}
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Комментарий
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          value={formation.comment}
          onChange={(e) => onUpdate("comment", e.target.value)}
          placeholder="Дополнительные комментарии"
        />
      </div>
    </div>
  );
};

export default BrachioCephalicFormation;