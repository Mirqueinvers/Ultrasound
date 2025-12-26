import React from "react";
import { RangeIndicator } from "./NormalRange";
import type { NormalRange } from "./NormalRange";
import { useFieldFocus } from "../../hooks/useFieldFocus";
import { inputClasses, labelClasses } from "../../utils/formClasses";

interface SizeRowProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  focus: ReturnType<typeof useFieldFocus>;
  range: NormalRange;
  readOnly?: boolean;
}

export const SizeRow: React.FC<SizeRowProps> = ({
  label,
  value,
  onChange,
  focus,
  range,
  readOnly = false,
}) => (
  <div className="flex items-center gap-4">
    <label className={labelClasses}>
      {label}
      <input
        type="text"
        className={readOnly ? `${inputClasses} bg-gray-100` : inputClasses}
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={focus.handleFocus}
        onBlur={focus.handleBlur}
        readOnly={readOnly}
      />
    </label>
    <RangeIndicator value={value} normalRange={range} />
  </div>
);
