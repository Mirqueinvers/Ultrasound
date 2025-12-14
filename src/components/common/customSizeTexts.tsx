import React from 'react';

interface SizeTextData {
  title: string;
  content: React.ReactNode;
}

export const customSizeTexts: Record<string, SizeTextData> = {
  rightLobeAP: {
    title: 'Правая доля печени',
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 120-150 мм</p>
      </div>
    )
  },
  leftLobeAP: {
    title: 'Левая доля печени', 
    content: (
      <div className="space-y-2">
        <p className="text-xs">Норма: 60-90 мм</p>
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
  }
};

// Исправленная функция для получения кастомного текста
export const getCustomText = (field: string): SizeTextData | null => {
  return customSizeTexts[field] || null;
};