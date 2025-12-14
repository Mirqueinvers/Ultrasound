import React from 'react';

export interface NormalRange {
  min: number;
  max: number;
  unit: string;
}

export interface NormalRangesData {
  liver: {
    rightLobeAP: NormalRange;      // мм
    leftLobeAP: NormalRange;       // мм
    portalVeinDiameter: NormalRange; // мм (воротная вена)
    ivc: NormalRange;              // мм (НПВ)
  };
  gallbladder: {
    length: NormalRange;           // мм (длина)
    width: NormalRange;            // мм (ширина)
    wallThickness: NormalRange;    // мм (толщина стенки)
    cysticDuct: NormalRange;       // мм (пузырный проток)
    commonBileDuct: NormalRange;   // мм (общий желчный проток)
  };
  // Можно добавить другие органы
}

export const normalRanges: NormalRangesData = {
  liver: {
    rightLobeAP: {
      min: 110,
      max: 140,
      unit: 'мм',
    },
    leftLobeAP: {
      min: 70,
      max: 90,
      unit: 'мм',
    },
    portalVeinDiameter: {
      min: 0,
      max: 15,
      unit: 'мм',
    },
    ivc: {
      min: 0,
      max: 25,
      unit: 'мм',
    },
  },
  gallbladder: {
    length: {
      min: 0,
      max: 100,
      unit: 'мм',
    },
    width: {
      min: 0,
      max: 40,
      unit: 'мм',
    },
    wallThickness: {
      min: 0,
      max: 3,
      unit: 'мм',
    },
    cysticDuct: {
      min: 0,
      max: 5,
      unit: 'мм',
    },
    commonBileDuct: {
      min: 0,
      max: 8,
      unit: 'мм',
    },
  },
};

interface RangeIndicatorProps {
  value: string;
  normalRange: NormalRange;
  label: string;
}

export const RangeIndicator: React.FC<RangeIndicatorProps> = ({ 
  value, 
  normalRange, 
}) => {
  const numericValue = parseFloat(value);
  const isValid = !isNaN(numericValue);
  
  if (!isValid || !value) {
    return null;
  }

  const isOutOfRange = 
    numericValue < normalRange.min || numericValue > normalRange.max;

  if (!isOutOfRange) {
    return null; // Не показываем индикатор если значение в норме
  }

  // Форматирование нормальных значений
  const formatNormalRange = () => {
    if (normalRange.min === 0) {
      return `до ${normalRange.max} ${normalRange.unit}`;
    } else {
      return `${normalRange.min}-${normalRange.max} ${normalRange.unit}`;
    }
  };

  return (
    <div className="ml-4 p-2 bg-red-50 border border-red-200 rounded-md text-xs">
      <div className="text-red-700 font-medium">
        Норма: {formatNormalRange()}
      </div>
    </div>
  );
};