// Подсказки для размеров яичников
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const ovaryHints: Record<string, SizeTextData> = {
  // Общие подсказки для яичников (применяются к левому и правому)
  // Ключи должны быть без префиксов, они добавляются в index.ts
  length: {
    title: 'Длина яичника',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 20-40 мм</p>
        <p className="text-xs text-gray-600">
          Измеряется в продольном сечении от верхнего до нижнего полюса
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Размеры варьируют в зависимости от фазы менструального цикла
          </p>
        </div>
      </div>
    )
  },
  width: {
    title: 'Ширина яичника',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 15-30 мм</p>
        <p className="text-xs text-gray-600">
          Максимальная ширина в поперечном сечении
        </p>
      </div>
    )
  },
  thickness: {
    title: 'Толщина яичника',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 10-20 мм</p>
        <p className="text-xs text-gray-600">
          Передне-задний размер в поперечном сечении
        </p>
      </div>
    )
  },
  volume: {
    title: 'Объем яичника',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 10 см³</p>
        <p className="text-xs text-gray-600">
          Автоматически рассчитывается по формуле эллипсоида
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Объем более 10 см³ может указывать на патологию
          </p>
        </div>
      </div>
    )
  }
};

export type OvaryHintKey = keyof typeof ovaryHints;