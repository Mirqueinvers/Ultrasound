// Подсказки для размеров щитовидной железы
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const thyroidHints: Record<string, SizeTextData> = {
  // Подсказки для долей щитовидной железы (применяются к левой и правой)
  length: {
    title: 'Доля щитовидной железы, длина',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 40-60 мм</p>
        <p className="text-xs text-gray-600">
          Измеряется в продольном сечении
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Правая доля обычно немного больше левой
          </p>
        </div>
      </div>
    )
  },
  width: {
    title: 'Доля щитовидной железы, ширина',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 15-20 мм</p>
        <p className="text-xs text-gray-600">
          Максимальная ширина в поперечном сечении
        </p>
      </div>
    )
  },
  depth: {
    title: 'Доля щитовидной железы, глубина',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 15-20 мм</p>
        <p className="text-xs text-gray-600">
          Передне-задний размер в поперечном сечении
        </p>
      </div>
    )
  },
  volume: {
    title: 'Объем доли щитовидной железы',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 10-12 см³ для каждой доли</p>
        <p className="text-xs text-gray-600">
          Рассчитывается по формуле: длина × ширина × глубина × 0.479
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            Объем более 15 см³ для доли может указывать на зоб
          </p>
        </div>
      </div>
    )
  }
};

export type ThyroidHintKey = keyof typeof thyroidHints;