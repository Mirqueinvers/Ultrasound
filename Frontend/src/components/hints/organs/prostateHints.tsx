// Подсказки для размеров предстательной железы
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const prostateHints: Record<string, SizeTextData> = {
  length: {
    title: 'Длина предстательной железы',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 25-45 мм</p>
        <p className="text-xs text-gray-600">
          Измеряется в продольном сечении от верхнего до нижнего края
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Увеличение длины характерно для гиперплазии простаты
          </p>
        </div>
      </div>
    )
  },
  width: {
    title: 'Ширина предстательной железы',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 30-45 мм</p>
        <p className="text-xs text-gray-600">
          Максимальная ширина в поперечном сечении
        </p>
      </div>
    )
  },
  apDimension: {
    title: 'ПЗР предстательной железы',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 20-30 мм</p>
        <p className="text-xs text-gray-600">
          Передне-задний размер в поперечном сечении
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            Увеличение ПЗР может указывать на аденому или рак
          </p>
        </div>
      </div>
    )
  },
  volume: {
    title: 'Объем предстательной железы',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 20-30 см³</p>
        <p className="text-xs text-gray-600">
          Автоматически рассчитывается по формуле: длина × ширина × ПЗР × 0.52
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Объем более 40 см³ указывает на гиперплазию простаты
          </p>
        </div>
      </div>
    )
  }
};

export type ProstateHintKey = keyof typeof prostateHints;