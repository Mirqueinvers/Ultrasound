// Подсказки для размеров мочевого пузыря
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const urinaryBladderHints: Record<string, SizeTextData> = {
  length: {
    title: 'Длина мочевого пузыря',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 50-80 мм (при наполнении 200-300 мл)</p>
        <p className="text-xs text-gray-600">
          Измеряется в продольном сечении
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Размеры значительно варьируют в зависимости от степени наполнения
          </p>
        </div>
      </div>
    )
  },
  width: {
    title: 'Ширина мочевого пузыря',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 40-70 мм (при наполнении 200-300 мл)</p>
        <p className="text-xs text-gray-600">
          Максимальная ширина в поперечном сечении
        </p>
      </div>
    )
  },
  depth: {
    title: 'Глубина мочевого пузыря',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 30-50 мм (при наполнении 200-300 мл)</p>
        <p className="text-xs text-gray-600">
          Передне-задний размер в поперечном сечении
        </p>
      </div>
    )
  },
  volume: {
    title: 'Объем мочевого пузыря',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 200-400 мл</p>
        <p className="text-xs text-gray-600">
          Автоматически рассчитывается по формуле эллипсоида
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Объем более 500 мл указывает на задержку мочи
          </p>
        </div>
      </div>
    )
  },
  wallThickness: {
    title: 'Толщина стенки мочевого пузыря',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 2-4 мм (при наполнении)</p>
        <p className="text-xs text-gray-600">
          Измеряется при наполнении мочевого пузыря
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            Утолщение более 5 мм может указывать на воспаление или опухоль
          </p>
        </div>
      </div>
    )
  },
  residualLength: {
    title: 'Остаточная моча, длина',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: менее 30 мм</p>
        <p className="text-xs text-gray-600">
          Измеряется после мочеиспускания
        </p>
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-800">
            Остаточная моча более 50 мл указывает на нарушение опорожнения
          </p>
        </div>
      </div>
    )
  },
  residualWidth: {
    title: 'Остаточная моча, ширина',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: менее 30 мм</p>
        <p className="text-xs text-gray-600">
          Ширина остаточной мочи
        </p>
      </div>
    )
  },
  residualDepth: {
    title: 'Остаточная моча, глубина',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: менее 30 мм</p>
        <p className="text-xs text-gray-600">
          Глубина остаточной мочи
        </p>
      </div>
    )
  },
  residualVolume: {
    title: 'Объем остаточной мочи',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: менее 30-50 мл</p>
        <p className="text-xs text-gray-600">
          Автоматически рассчитывается
        </p>
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-800">
            Остаточная моча более 100 мл требует урологического обследования
          </p>
        </div>
      </div>
    )
  }
};

export type UrinaryBladderHintKey = keyof typeof urinaryBladderHints;