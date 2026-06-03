// Подсказки для размеров поджелудочной железы
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const pancreasHints: Record<string, SizeTextData> = {
  head: {
    title: 'Головка поджелудочной железы',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 32 мм</p>
        <p className="text-xs text-gray-600">
          Передне-задний размер головки
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Увеличение может указывать на воспаление или опухоль
          </p>
        </div>
      </div>
    )
  },
  body: {
    title: 'Тело поджелудочной железы',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 21 мм</p>
        <p className="text-xs text-gray-600">
          Передне-задний размер тела
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Тело наиболее доступно для визуализации
          </p>
        </div>
      </div>
    )
  },
  tail: {
    title: 'Хвост поджелудочной железы',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 30 мм</p>
        <p className="text-xs text-gray-600">
          Передне-задний размер хвоста
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            ⚠️ При увеличении хвоста - исключить нейроэндокринные опухоли
          </p>
        </div>
      </div>
    )
  },
  wirsungDuct: {
    title: 'Вирсунгов проток',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 2-3 мм</p>
        <p className="text-xs text-gray-600">
          Диаметр главного панкреатического протока
        </p>
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-800">
            🔍 Расширение более 3 мм может указывать на обструкцию
          </p>
        </div>
      </div>
    )
  }
};

export type PancreasHintKey = keyof typeof pancreasHints;