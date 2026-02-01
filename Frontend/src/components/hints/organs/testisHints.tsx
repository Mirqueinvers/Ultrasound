// Подсказки для размеров яичек
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const testisHints: Record<string, SizeTextData> = {
  length: {
    title: 'Длина яичка',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 40-50 мм</p>
        <p className="text-xs text-gray-600">
          Измеряется в продольном сечении от верхнего до нижнего полюса
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Правое яичко обычно немного больше левого
          </p>
        </div>
      </div>
    )
  },
  width: {
    title: 'Ширина яичка',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 25-35 мм</p>
        <p className="text-xs text-gray-600">
          Максимальная ширина в поперечном сечении
        </p>
      </div>
    )
  },
  depth: {
    title: 'Глубина яичка',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 15-25 мм</p>
        <p className="text-xs text-gray-600">
          Передне-задний размер в поперечном сечении
        </p>
      </div>
    )
  },
  volume: {
    title: 'Объем яичка',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 15-25 см³</p>
        <p className="text-xs text-gray-600">
          Автоматически рассчитывается по формуле эллипсоида
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Объем менее 12 см³ может указывать на гипогонадизм
          </p>
        </div>
      </div>
    )
  }
};

export type TestisHintKey = keyof typeof testisHints;