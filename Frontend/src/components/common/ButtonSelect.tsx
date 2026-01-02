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
    // Если кликнули по уже выбранной кнопке - отменяем выбор
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
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => handleClick(option.value)}
            disabled={disabled}
            className={`px-3 py-1 text-sm rounded font-medium transition-colors ${
              value === option.value
                ? "bg-blue-500 text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ButtonSelect;
