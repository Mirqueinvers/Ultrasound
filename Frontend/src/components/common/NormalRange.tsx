import React from 'react';

export interface NormalRange {
  min: number;
  max: number;
  unit: string;
}

export interface NormalRangesData {
  liver: {
    rightLobeAP: NormalRange;      // мм (ПЗР правая)
    leftLobeAP: NormalRange;       // мм (ПЗР левая)
    portalVeinDiameter: NormalRange; // мм (воротная вена)
    ivc: NormalRange;              // мм (НПВ)
    
    // Дополнительные размеры печени
    rightLobeCCR: NormalRange;     // мм (ККР правая)
    rightLobeCVR: NormalRange;     // мм (КВР правая)
    leftLobeCCR: NormalRange;      // мм (ККР левая)
    rightLobeTotal: NormalRange;   // мм (ККР + ПЗР правая)
    leftLobeTotal: NormalRange;    // мм (ККР + ПЗР левая)
  };
  gallbladder: {
    length: NormalRange;           // мм (длина)
    width: NormalRange;            // мм (ширина)
    wallThickness: NormalRange;    // мм (толщина стенки)
    cysticDuct: NormalRange;       // мм (пузырный проток)
    commonBileDuct: NormalRange;   // мм (общий желчный проток)
  };
  pancreas: {
    head: NormalRange;             // мм (головка)
    body: NormalRange;             // мм (тело)
    tail: NormalRange;             // мм (хвост)
    wirsungDuct: NormalRange;      // мм (Вирсунгов проток)
  };
  spleen: {
    length: NormalRange;           // мм (длина)
    width: NormalRange;            // мм (ширина)
    splenicVein: NormalRange;      // мм (селезеночная вена)
    splenicArtery: NormalRange;    // мм (селезеночная артерия)
  };

  leftKidney: {
    length: NormalRange;
    width: NormalRange;
    thickness: NormalRange;
  };
  rightKidney: {
    length: NormalRange;
    width: NormalRange;
    thickness: NormalRange;
  };
  urinaryBladder: {
    volume: NormalRange;
    wallThickness: NormalRange;
  };
}

export const normalRanges: NormalRangesData = {
  liver: {
    rightLobeAP: {
      min: 0,
      max: 125,
      unit: 'мм',
    },
    leftLobeAP: {
      min: 0,
      max: 90,
      unit: 'мм',
    },
    portalVeinDiameter: {
      min: 8,
      max: 15,
      unit: 'мм',
    },
    ivc: {
      min: 15,
      max: 25,
      unit: 'мм',
    },
    
    // Дополнительные размеры печени
    rightLobeCCR: {
      min: 0,
      max: 140,
      unit: 'мм',
    },
    rightLobeCVR: {
      min: 0,
      max: 150,
      unit: 'мм',
    },
    leftLobeCCR: {
      min: 0,
      max: 100,
      unit: 'мм',
    },
    rightLobeTotal: {
      min: 0,
      max: 260,
      unit: 'мм',
    },
    leftLobeTotal: {
      min: 0,
      max: 160,
      unit: 'мм',
    },
  },
  gallbladder: {
    length: {
      min: 0,
      max: 80,
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
      min: 1,
      max: 3,
      unit: 'мм',
    },
    commonBileDuct: {
      min: 0,
      max: 6,
      unit: 'мм',
    },
  },
  pancreas: {
    head: { min: 0, max: 32, unit: 'мм' },
    body: { min: 0, max: 21, unit: 'мм' },
    tail: { min: 0, max: 30, unit: 'мм' },
    wirsungDuct: { min: 0, max: 3, unit: 'мм' },
  },
  spleen: {
    length: { min: 0, max: 120, unit: 'мм' },
    width: { min: 0, max: 70, unit: 'мм' },
    splenicVein: { min: 5, max: 8, unit: 'мм' },
    splenicArtery: { min: 4, max: 7, unit: 'мм' },
  },

  leftKidney: {
    length: { min: 100, max: 120, unit: 'мм' },
    width: { min: 50, max: 60, unit: 'мм' },
    thickness: { min: 40, max: 50, unit: 'мм' },
  },
  rightKidney: {
    length: { min: 100, max: 120, unit: 'мм' },
    width: { min: 50, max: 60, unit: 'мм' },
    thickness: { min: 40, max: 50, unit: 'мм' },
  },
  urinaryBladder: {
    volume: { min: 200, max: 400, unit: 'мл' },
    wallThickness: { min: 3, max: 5, unit: 'мм' },
  },
};

interface RangeIndicatorProps {
  value: string;
  normalRange: NormalRange;
  label?: string;
}

export const RangeIndicator: React.FC<RangeIndicatorProps> = ({ 
  value, 
  normalRange,
  label
}) => {
  // Добавляем проверку на undefined
  if (!normalRange) {
    console.warn('RangeIndicator: normalRange is undefined', { value, label });
    return null;
  }

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
      {label && (
        <div className="text-red-600 text-xs mt-1">
          {label}: {value} {normalRange.unit}
        </div>
      )}
    </div>
  );
};