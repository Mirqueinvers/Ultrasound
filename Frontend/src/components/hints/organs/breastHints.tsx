// Подсказки для размеров молочной железы
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const breastHints: Record<string, SizeTextData> = {
  size1: {
    title: 'Размер узла, первый размер',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Первый линейный размер образования</p>
        <p className="text-xs text-gray-600">
          Измеряется в продольном сечении
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Используется для расчета объема и оценки роста
          </p>
        </div>
      </div>
    )
  },
  size2: {
    title: 'Размер узла, второй размер',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Второй линейный размер образования</p>
        <p className="text-xs text-gray-600">
          Измеряется в поперечном сечении
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            В комбинации с первым размером дает площадь образования
          </p>
        </div>
      </div>
    )
  },
  depth: {
    title: 'Размер узла, глубина',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Передне-задний размер образования</p>
        <p className="text-xs text-gray-600">
          Измеряется в поперечном сечении
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            Важен для оценки объема и биопсийной доступности
          </p>
        </div>
      </div>
    )
  }
};

export type BreastHintKey = keyof typeof breastHints;