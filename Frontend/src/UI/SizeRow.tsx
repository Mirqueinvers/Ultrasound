import React from "react";
import { RangeIndicator } from "@common/NormalRange";
import type { NormalRange } from "@common/NormalRange";
import { useFieldFocus } from "@hooks/useFieldFocus";
import { inputClasses, labelClasses } from "@utils/formClasses";

interface SizeRowProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  focus?: ReturnType<typeof useFieldFocus>;
  range?: NormalRange;
  readOnly?: boolean;
  autoCalculated?: boolean; // Новый проп для авто-вычисляемых полей
  customInputClass?: string; // Кастомные стили для инпута
}

export const SizeRow: React.FC<SizeRowProps> = ({
  label,
  value,
  onChange,
  focus,
  range,
  readOnly = false,
  autoCalculated = false,
  customInputClass,
}) => {
  const inputClassNames = customInputClass 
    ? customInputClass 
    : readOnly 
      ? `${inputClasses} bg-gray-100` 
      : inputClasses;

  return (
    <div className="flex items-center gap-4">
      <label className={labelClasses}>
        {label}
        <div className="relative">
          <input
            type="text"
            className={inputClassNames}
            value={value}
            onChange={e => onChange(e.target.value)}
            onFocus={focus?.handleFocus}
            onBlur={focus?.handleBlur}
            readOnly={readOnly}
            disabled={readOnly}
          />
          {autoCalculated && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-sky-600 font-medium">
              авто
            </span>
          )}
        </div>
      </label>
      {range && <RangeIndicator value={value} normalRange={range} />}
    </div>
  );
};
