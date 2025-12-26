import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const customSizeTexts: Record<string, SizeTextData> = {
  // Печень
  rightLobeAP: {
    title: 'Передне-задний размер правой доли печени.',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 125 мм.</p>
      </div>
    )
  },
  leftLobeAP: {
    title: 'Передне-задний размер левой доли печени.', 
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 90 мм.</p>
      </div>
    )
  },
  portalVeinDiameter: {
    title: 'Воротная вена',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 8-15 мм</p>
      </div>
    )
  },
  ivc: {
    title: 'Нижняя полая вена',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 15-25 мм</p>
      </div>
    )
  },
  
  // Новые поля для расширенных размеров печени
  rightLobeCCR: {
    title: 'Кранио-каудальный размер правой доли печени.',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 140 мм</p>
        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-xs text-yellow-800">
            Измеряется в продольном сечении от купола до нижнего края.
          </p>
        </div>
      </div>
    )
  },
  rightLobeCVR: {
    title: 'Косой вертикальный размер правой доли печени.',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 150 мм</p>
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Измеряется от края печени до наиболее удаленной краниальной точки купола диафрагмы.
          </p>
        </div>
      </div>
    )
  },
  leftLobeCCR: {
    title: 'Кранио-каудальный размер левой доли печени.',
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
    title: 'Кранио-каудальный + передней-задний размер правой доли печени.',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 260 мм</p>
      </div>
    )
  },
  leftLobeTotal: {
    title: 'Кранио-каудальный + передней-задний размер левой доли печени.',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: до 160 мм</p>
      </div>
    )
  },
  
  // Желчный пузырь
  gallbladderLength: {
    title: 'Длина желчного пузыря',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 40-80 мм</p>
        <p className="text-xs text-gray-600">
          Измеряется от шейки до дна
        </p>
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
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
          <p className="text-xs text-blue-800">
            Ваш кастомный текст для общего желчного протока
          </p>
        </div>
      </div>
    )
  },

  // Поджелудочная железа
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
            Ваш кастомный текст для тела поджелудочной железы
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
  },

  // Селезенка
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
  },
};

// Исправленная функция для получения кастомного текста
export const getCustomText = (field: string): SizeTextData | null => {
  return customSizeTexts[field] || null;
};