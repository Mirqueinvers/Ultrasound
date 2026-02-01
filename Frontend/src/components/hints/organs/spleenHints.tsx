// Подсказки для размеров селезенки
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const spleenHints: Record<string, SizeTextData> = {
  spleenLength: {
    title: 'Длина селезенки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 110-120 мм</p>
        <p className="text-xs text-gray-600">
          Измеряется от ворот до нижнего полюса
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Увеличение длины более 120 мм указывает на спленомегалию
          </p>
        </div>
      </div>
    )
  },
  spleenWidth: {
    title: 'Ширина селезенки',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 60-70 мм</p>
        <p className="text-xs text-gray-600">
          Максимальная ширина в поперечном сечении
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Комбинация длины и ширины используется для расчета объема
          </p>
        </div>
      </div>
    )
  },
  splenicVein: {
    title: 'Селезеночная вена',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 5-8 мм</p>
        <p className="text-xs text-gray-600">
          Диаметр селезеночной вены в области ворот селезенки
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            ⚠️ Расширение может указывать на портальную гипертензию
          </p>
        </div>
      </div>
    )
  },
  splenicArtery: {
    title: 'Селезеночная артерия',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 4-7 мм</p>
        <p className="text-xs text-gray-600">
          Диаметр селезеночной артерии в области ворот
        </p>
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-800">
            🔍 Аневризмы селезеночной артерии встречаются у 1% населения
          </p>
        </div>
      </div>
    )
  }
};

export type SpleenHintKey = keyof typeof spleenHints;