import React from "react";

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

    // Тоггл по клику на активную
    if (value === optionValue) {
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
          const isActive = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleClick(option.value)}
              disabled={disabled}
              className={[
                "inline-flex items-center justify-center px-3.5 py-1.5 text-sm font-medium",
                "rounded-full border transition-all duration-200",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-1",
                disabled && "opacity-50 cursor-not-allowed",
                isActive
                  ? "bg-sky-500 text-white border-sky-500 shadow-sm shadow-sky-300"
                  : "bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200 hover:border-slate-300",
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
