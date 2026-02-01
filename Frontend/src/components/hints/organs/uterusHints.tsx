// Подсказки для размеров матки
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const uterusHints: Record<string, SizeTextData> = {
  // Ключи должны быть без префиксов, они добавляются в index.ts
  length: {
    title: 'Длина матки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 50-80 мм (у нерожавших), 70-100 мм (у рожавших)</p>
        <p className="text-xs text-gray-600">
          Измеряется в продольном сечении от дна до шейки матки
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Размеры варьируют в зависимости от возраста и родов в анамнезе
          </p>
        </div>
      </div>
    )
  },
  width: {
    title: 'Ширина матки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 40-60 мм (у нерожавших), 50-70 мм (у рожавших)</p>
        <p className="text-xs text-gray-600">
          Максимальная ширина в поперечном сечении
        </p>
      </div>
    )
  },
  apDimension: {
    title: 'ПЗР матки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 30-40 мм (у нерожавших), 40-50 мм (у рожавших)</p>
        <p className="text-xs text-gray-600">
          Передне-задний размер в поперечном сечении
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            Увеличение ПЗР может указывать на миому или аденомиоз
          </p>
        </div>
      </div>
    )
  },
  volume: {
    title: 'Объем матки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 40-80 см³ (у нерожавших), 60-120 см³ (у рожавших)</p>
        <p className="text-xs text-gray-600">
          Автоматически рассчитывается по формуле эллипсоида
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Объем более 150 см³ может указывать на патологию
          </p>
        </div>
      </div>
    )
  },
  endometriumSize: {
    title: 'Толщина эндометрия',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 2-4 мм (в раннюю фазу), 8-14 мм (в секреторную фазу)</p>
        <p className="text-xs text-gray-600">
          Толщина М-эха измеряется в продольном сечении
        </p>
        <div className="mt-2 p-2 bg-purple-50 border border-purple-200 rounded">
          <p className="text-xs text-purple-800">
            Толщина зависит от фазы менструального цикла
          </p>
        </div>
      </div>
    )
  },
  cervixSize: {
    title: 'Размер шейки матки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 25-35 мм (длина), 25-30 мм (поперечный размер)</p>
        <p className="text-xs text-gray-600">
          Размеры шейки матки в продольном и поперечном сечениях
        </p>
        <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded">
          <p className="text-xs text-orange-800">
            Увеличение шейки может указывать на воспаление или опухоль
          </p>
        </div>
      </div>
    )
  }
};

export type UterusHintKey = keyof typeof uterusHints;