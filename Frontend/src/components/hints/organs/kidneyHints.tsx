// Подсказки для размеров почек
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const kidneyHints: Record<string, SizeTextData> = {
  length: {
    title: 'Длина почки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 100-120 мм (левая), 95-115 мм (правая)</p>
        <p className="text-xs text-gray-600">
          Измеряется в продольном сечении от верхнего до нижнего полюса
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Левая почка обычно на 5-10 мм больше правой
          </p>
        </div>
      </div>
    )
  },
  width: {
    title: 'Ширина почки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 50-60 мм</p>
        <p className="text-xs text-gray-600">
          Максимальная ширина в поперечном сечении
        </p>
      </div>
    )
  },
  thickness: {
    title: 'Толщина почки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 40-50 мм</p>
        <p className="text-xs text-gray-600">
          Передне-задний размер в поперечном сечении
        </p>
      </div>
    )
  },
  volume: {
    title: 'Объем почки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 120-200 см³</p>
        <p className="text-xs text-gray-600">
          Автоматически рассчитывается по формуле эллипсоида
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Объем более важен для оценки функции, чем линейные размеры
          </p>
        </div>
      </div>
    )
  }
};

export type KidneyHintKey = keyof typeof kidneyHints;