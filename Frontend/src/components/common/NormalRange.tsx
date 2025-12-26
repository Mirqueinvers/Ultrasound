// Frontend/src/components/common/NormalRange.tsx
import React from "react";

export interface NormalRange {
  min: number;
  max: number;
  unit: string;
}

export const normalRanges = {
  leftKidney: {
    length: { min: 90, max: 120, unit: "мм" },
    width: { min: 40, max: 60, unit: "мм" },
    thickness: { min: 35, max: 50, unit: "мм" },
    parenchyma: { min: 14, max: 25, unit: "мм" },
  },
  rightKidney: {
    length: { min: 90, max: 120, unit: "мм" },
    width: { min: 40, max: 60, unit: "мм" },
    thickness: { min: 35, max: 50, unit: "мм" },
    parenchyma: { min: 14, max: 25, unit: "мм" },
  },
  liver: {
    rightLobeAP: { min: 90, max: 125, unit: "мм" },
    leftLobeAP: { min: 50, max: 90, unit: "мм" },
    rightLobeCCR: { min: 90, max: 140, unit: "мм" },
    rightLobeCVR: { min: 90, max: 150, unit: "мм" },
    rightLobeTotal: { min: 0, max: 260, unit: "мм" },
    leftLobeCCR: { min: 0, max: 100, unit: "мм" },
    leftLobeTotal: { min: 0, max: 160, unit: "мм" },
    portalVeinDiameter: { min: 7, max: 13, unit: "мм" },
    ivc: { min: 15, max: 25, unit: "мм" },
  },
  gallbladder: {
    length: { min: 60, max: 100, unit: "мм" },
    width: { min: 20, max: 40, unit: "мм" },
    wallThickness: { min: 0, max: 3, unit: "мм" },
    cysticDuct: { min: 1, max: 3, unit: "мм" },
    commonBileDuct: { min: 3, max: 7, unit: "мм" },
  },
  pancreas: {
    head: { min: 15, max: 32, unit: "мм" },
    body: { min: 10, max: 21, unit: "мм" },
    tail: { min: 15, max: 30, unit: "мм" },
    wirsungDuct: { min: 0, max: 3, unit: "мм" },
  },
  spleen: {
    length: { min: 80, max: 120, unit: "мм" },
    width: { min: 30, max: 50, unit: "мм" },
    splenicVein: { min: 4, max: 8, unit: "мм" },
    splenicArtery: { min: 2, max: 4, unit: "мм" },
  },
  urinaryBladder: {
    residualVolume: { min: 0, max: 50, unit: "мл" },
    wallThickness: { min: 0, max: 5, unit: "мм" },
},
} as const;

export interface RangeIndicatorProps {
  value: string;
  normalRange?: NormalRange; // сделано опциональным
  label?: string;
}

export const RangeIndicator: React.FC<RangeIndicatorProps> = ({
  value,
  normalRange,
  label,
}) => {
  if (!normalRange) {
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
    return null;
  }

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
