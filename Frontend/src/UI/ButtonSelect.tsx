import React from "react";
import { isNormalizedMatch } from "@utils/normalizeSelectValue";

interface Option {
  value: string;
  label: string;
}

interface ButtonSelectProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  disabled?: boolean;
}

export const ButtonSelect: React.FC<ButtonSelectProps> = ({
  label,
  value,
  onChange,
  options,
  disabled = false,
}) => {

  const handleClick = (optionValue: string) => {
    if (disabled) return;

    if (isNormalizedMatch(value, optionValue)) {
      onChange("");
    } else {
      onChange(optionValue);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isActive = isNormalizedMatch(value, option.value);

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleClick(option.value)}
              disabled={disabled}
              className={[
                "inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium",
                "rounded-md border transition-all duration-200",
                "outline-none focus:outline-none focus-visible:outline-none",
                disabled && "opacity-50 cursor-not-allowed",
                isActive
                  ? "bg-[#e0f2f7] text-[#0e7490]"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200",
              ].filter(Boolean).join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ButtonSelect;
