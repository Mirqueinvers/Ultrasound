// Подсказки для размеров печени
import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const liverHints: Record<string, SizeTextData> = {
  rightLobeAP: {
    title: 'Передне-задний размер правой доли печени',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 125 мм</p>
        <p className="text-xs text-gray-600">
          ПЗР измеряется в поперечном сечении
        </p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            Увеличение может указывать на гепатомегалию, жировой гепатоз или воспаление
          </p>
        </div>
      </div>
    )
  },
  leftLobeAP: {
    title: 'Передне-задний размер левой доли печени', 
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 90 мм</p>
        <p className="text-xs text-gray-600">
          ПЗР левой доли в продольном сечении
        </p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Увеличение может указывать на компенсаторную гипертрофию
          </p>
        </div>
      </div>
    )
  },
  portalVeinDiameter: {
    title: 'Воротная вена, диаметр',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 8-15 мм</p>
        <p className="text-xs text-gray-600">
          Диаметр воротной вены в области ворот печени
        </p>
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
          <p className="text-xs text-red-800">
            Расширение может указывать на портальную гипертензию или цирроз
          </p>
        </div>
      </div>
    )
  },
  ivc: {
    title: 'Нижняя полая вена, диаметр',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 15-25 мм</p>
        <p className="text-xs text-gray-600">
          Диаметр НПВ при спокойном дыхании
        </p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Отражает центральное венозное давление и функцию правого сердца
          </p>
        </div>
      </div>
    )
  },
  rightLobeCCR: {
    title: 'Кранио-каудальный размер правой доли печени',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 140 мм</p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Измеряется в продольном сечении от купола до нижнего края
          </p>
        </div>
      </div>
    )
  },
  rightLobeCVR: {
    title: 'Косой вертикальный размер правой доли печени',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 150 мм</p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            От края печени до наиболее удаленной краниальной точки купола диафрагмы
          </p>
        </div>
      </div>
    )
  },
  leftLobeCCR: {
    title: 'Кранио-каудальный размер левой доли печени',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 100 мм</p>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded">
          <p className="text-xs text-green-800">
            Увеличение ККР может указывать на гипертрофию
          </p>
        </div>
      </div>
    )
  },
  rightLobeTotal: {
    title: 'Кранио-каудальный + ПЗР правой доли печени',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 260 мм</p>
        <p className="text-xs text-gray-600">
          Суммарный показатель размеров правой доли
        </p>
      </div>
    )
  },
  leftLobeTotal: {
    title: 'Кранио-каудальный + ПЗР левой доли печени',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 160 мм</p>
        <p className="text-xs text-gray-600">
          Суммарный показатель размеров левой доли
        </p>
      </div>
    )
  }
};

export type LiverHintKey = keyof typeof liverHints;