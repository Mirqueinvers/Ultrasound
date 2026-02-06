// src/components/organs/Pleural/PleuralFormation.tsx
import React from "react";
import { Fieldset } from "@/UI";
import type { PleuralFormationProps } from "@/types/organs/pleural";

export const PleuralFormation: React.FC<PleuralFormationProps> = ({
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

      <div className="grid grid-cols-2 gap-4 mb-4">
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
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Эхогенность
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formation.echogenicity}
          onChange={(e) => onUpdate("echogenicity", e.target.value)}
        >
          <option value="">Выберите эхогенность</option>
          <option value="анэхогенное">анэхогенное</option>
          <option value="гипоэхогенное">гипоэхогенное</option>
          <option value="изоэхогенное">изоэхогенное</option>
          <option value="гиперэхогенное">гиперэхогенное</option>
          <option value="смешанной эхогенности">смешанной эхогенности</option>
        </select>
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
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Подвижность
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formation.mobility}
          onChange={(e) => onUpdate("mobility", e.target.value)}
        >
          <option value="">Выберите подвижность</option>
          <option value="подвижное">подвижное</option>
          <option value="малоподвижное">малоподвижное</option>
          <option value="неподвижное">неподвижное</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Васкуляризация
        </label>
        <select
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={formation.vascularization}
          onChange={(e) => onUpdate("vascularization", e.target.value)}
        >
          <option value="">Выберите васкуляризацию</option>
          <option value="аваскулярное">аваскулярное</option>
          <option value="мало васкуляризованное">мало васкуляризованное</option>
          <option value="умеренно васкуляризованное">умеренно васкуляризованное</option>
          <option value="гиперваскуляризованное">гиперваскуляризованное</option>
        </select>
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

export default PleuralFormation;