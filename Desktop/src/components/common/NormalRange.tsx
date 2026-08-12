// Frontend/src/components/common/NormalRange.tsx
import React from "react";

export interface NormalRange {
  min: number;
  max: number;
  unit: string;
}

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
