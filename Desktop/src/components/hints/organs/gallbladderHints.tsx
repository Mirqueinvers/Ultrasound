// Подсказки для размеров желчного пузыря
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const gallbladderHints: Record<string, SizeTextData> = {
  gallbladderLength: {
    title: 'Длина желчного пузыря',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 40-80 мм</p>
        <p className="text-xs text-gray-600">
          Измеряется от шейки до дна
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Длина увеличивается при наполнении желчью
          </p>
        </div>
      </div>
    )
  },
  gallbladderWidth: {
    title: 'Ширина желчного пузыря',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 20-40 мм</p>
        <p className="text-xs text-gray-600">
          Максимальная ширина в поперечном сечении
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Ширина менее информативна из-за изменчивости формы
          </p>
        </div>
      </div>
    )
  },
  wallThickness: {
    title: 'Толщина стенки желчного пузыря',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 3 мм</p>
        <p className="text-xs text-gray-600">
          Измеряется в области шейки
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            ⚠️ При утолщении более 3 мм - воспалительный процесс
          </p>
        </div>
      </div>
    )
  },
  cysticDuct: {
    title: 'Пузырный проток',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 1-3 мм</p>
        <p className="text-xs text-gray-600">
          Диаметр пузырного протока
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Визуализация затруднена при диаметре менее 2 мм
          </p>
        </div>
      </div>
    )
  },
  commonBileDuct: {
    title: 'Общий желчный проток',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 6 мм</p>
        <p className="text-xs text-gray-600">
          Диаметр общего желчного протока
        </p>
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-800">
            Расширение более 7 мм может указывать на обструкцию
          </p>
        </div>
      </div>
    )
  }
};

export type GallbladderHintKey = keyof typeof gallbladderHints;