import React from "react";
import { inputClasses, labelClasses } from "../../utils/formClasses";

interface Option {
  value: string;
  label: string;
}

interface SelectWithTextareaProps {
  label: string;

  selectValue: string;
  textareaValue: string;

  onSelectChange: (val: string) => void;
  onTextareaChange: (val: string) => void;

  options: Option[];
  triggerValue: string;
  textareaLabel: string;

  rows?: number;
  disabled?: boolean;
}

export const SelectWithTextarea: React.FC<SelectWithTextareaProps> = ({
  label,
  selectValue,
  textareaValue,
  onSelectChange,
  onTextareaChange,
  options,
  triggerValue,
  textareaLabel,
  rows = 3,
  disabled = false,
}) => {
  const showTextarea = selectValue === triggerValue;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    onSelectChange(value);

    if (value !== triggerValue && textareaValue) {
      onTextareaChange("");
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <label className={labelClasses}>
        {label}
        <select
          className={inputClasses}
          value={selectValue}
          onChange={handleSelectChange}
          disabled={disabled}
        >
          <option value="" />
          {options.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      {showTextarea && (
        <label className={labelClasses}>
          {textareaLabel}
          <textarea
            rows={rows}
            className={inputClasses + " resize-y"}
            value={textareaValue}
            onChange={e => onTextareaChange(e.target.value)}
            disabled={disabled}
          />
        </label>
      )}
    </div>
  );
};
