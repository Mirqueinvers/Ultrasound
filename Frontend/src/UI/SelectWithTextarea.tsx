import React from "react";
import { ButtonSelect } from "./ButtonSelect";
import { inputClasses, labelClasses } from "@utils/formClasses";

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

  const handleSelectChange = (value: string) => {
    onSelectChange(value);

    if (value !== triggerValue && textareaValue) {
      onTextareaChange("");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <ButtonSelect
        label={label}
        value={selectValue}
        onChange={handleSelectChange}
        options={options}
        disabled={disabled}
      />

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

export default SelectWithTextarea;
