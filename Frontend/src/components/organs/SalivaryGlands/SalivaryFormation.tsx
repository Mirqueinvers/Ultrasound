// src/components/organs/SalivaryGlands/SalivaryFormation.tsx
import React from "react";
import { ButtonSelect } from "@/UI";
import type { SalivaryGlandFormationProps } from "@/types/organs/salivaryGlands";

export const SalivaryFormation: React.FC<SalivaryGlandFormationProps> = ({
  formation,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-gray-900">
          Образование {formation.number}
        </h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Удалить
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Размер 1 (мм)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formation.size1}
            onChange={(e) => onUpdate("size1", e.target.value)}
            placeholder="Длина"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Размер 2 (мм)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formation.size2}
            onChange={(e) => onUpdate("size2", e.target.value)}
            placeholder="Ширина"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Размер 3 (мм)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={formation.size3}
            onChange={(e) => onUpdate("size3", e.target.value)}
            placeholder="Высота"
          />
        </div>
      </div>

      <div className="mb-4">
        <ButtonSelect
          label="Эхогенность"
          value={formation.echogenicity}
          onChange={(val) => onUpdate("echogenicity", val)}
          options={[
            { value: "", label: "Выберите эхогенность" },
            { value: "анэхогенное", label: "анэхогенное" },
            { value: "гипоэхогенное", label: "гипоэхогенное" },
            { value: "изоэхогенное", label: "изоэхогенное" },
            { value: "гиперэхогенное", label: "гиперэхогенное" },
            { value: "смешанной эхогенности", label: "смешанной эхогенности" },
          ]}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <ButtonSelect
          label="Форма"
          value={formation.shape}
          onChange={(val) => onUpdate("shape", val)}
          options={[
            { value: "", label: "Выберите форму" },
            { value: "овальная", label: "овальная" },
            { value: "округлая", label: "округлая" },
            { value: "неправильная", label: "неправильная" },
            { value: "неправильная форма", label: "неправильная форма" },
          ]}
        />

        <ButtonSelect
          label="Контур"
          value={formation.contour}
          onChange={(val) => onUpdate("contour", val)}
          options={[
            { value: "", label: "Выберите контур" },
            { value: "ровный", label: "ровный" },
            { value: "неровный", label: "неровный" },
            { value: "четкий", label: "четкий" },
            { value: "нечеткий", label: "нечеткий" },
            { value: "ровный четкий", label: "ровный четкий" },
            { value: "неровный нечеткий", label: "неровный нечеткий" },
          ]}
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Локализация
        </label>
        <input
          type="text"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formation.location}
          onChange={(e) => onUpdate("location", e.target.value)}
          placeholder="Опишите локализацию"
        />
      </div>

      <div className="mb-4">
        <ButtonSelect
          label="Васкуляризация"
          value={formation.vascularization}
          onChange={(val) => onUpdate("vascularization", val)}
          options={[
            { value: "", label: "Выберите васкуляризацию" },
            { value: "аваскулярное", label: "аваскулярное" },
            { value: "мало васкуляризованное", label: "мало васкуляризованное" },
            { value: "умеренно васкуляризованное", label: "умеренно васкуляризованное" },
            { value: "гиперваскуляризованное", label: "гиперваскуляризованное" },
            { value: "периферическая васкуляризация", label: "периферическая васкуляризация" },
            { value: "внутренняя васкуляризация", label: "внутренняя васкуляризация" },
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

export default SalivaryFormation;