// src/components/organs/LowerExtremityVeins/VenousThrombus.tsx
import React from "react";
import { ButtonSelect } from "@/UI";
import type { VenousThrombus } from "@/types/organs/lowerExtremityVeins";

interface VenousThrombusProps {
  thrombus: VenousThrombus;
  onUpdate: (field: keyof VenousThrombus, value: string | number) => void;
  onRemove: () => void;
}

export const VenousThrombusComponent: React.FC<VenousThrombusProps> = ({
  thrombus,
  onUpdate,
  onRemove,
}) => {
  return (
    <div className="border border-red-200 rounded-lg p-4 bg-red-50">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-medium text-red-900">
          Тромб {thrombus.number}
        </h4>
        <button
          type="button"
          onClick={onRemove}
          className="text-red-600 hover:text-red-800 text-sm font-medium"
        >
          Удалить
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Размер (мм)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={thrombus.size}
            onChange={(e) => onUpdate("size", e.target.value)}
            placeholder="Толщина стенки"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Локализация
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            value={thrombus.location}
            onChange={(e) => onUpdate("location", e.target.value)}
            placeholder="Пристеночный, окклюзивный"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 mb-4">
        <ButtonSelect
          label="Тип тромба"
          value={thrombus.type}
          onChange={(val) => onUpdate("type", val)}
          options={[
            { value: "", label: "Выберите тип" },
            { value: "пристеночный", label: "пристеночный" },
            { value: "окклюзивный", label: "окклюзивный" },
            { value: "флотирующий", label: "флотирующий" },
            { value: "реканализованный", label: "реканализованный" },
          ]}
        />

        <ButtonSelect
          label="Возраст тромба"
          value={thrombus.age}
          onChange={(val) => onUpdate("age", val)}
          options={[
            { value: "", label: "Выберите возраст" },
            { value: "свежий", label: "свежий" },
            { value: "организованный", label: "организованный" },
            { value: "хронический", label: "хронический" },
            { value: "реканализованный", label: "реканализованный" },
          ]}
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 mb-1">
          Комментарий
        </label>
        <textarea
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
          rows={2}
          value={thrombus.comment}
          onChange={(e) => onUpdate("comment", e.target.value)}
          placeholder="Дополнительные комментарии"
        />
      </div>
    </div>
  );
};

export default VenousThrombusComponent;
