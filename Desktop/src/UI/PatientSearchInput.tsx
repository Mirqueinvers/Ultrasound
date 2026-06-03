// src/components/common/PatientSearchInput.tsx

import React from "react";
import { Search as SearchIcon } from "lucide-react";

interface PatientSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
}

export const PatientSearchInput: React.FC<PatientSearchInputProps> = ({
  value,
  onChange,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="w-full max-w-2xl self-center">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center bg-white border border-gray-200 rounded-full shadow-lg hover:shadow-xl focus-within:shadow-xl pl-6 pr-2 py-3 transition-shadow duration-300">
          <SearchIcon className="h-5 w-5 text-gray-500 mr-3 flex-shrink-0" />

          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Введите данные пациента"
            className="w-full text-lg outline-none bg-transparent placeholder:text-gray-500 text-slate-800"
          />

          <button
            type="submit"
            className="ml-3 rounded-full bg-slate-100 px-5 py-1.5 text-sm font-medium text-slate-800 hover:bg-slate-200 transition-colors whitespace-nowrap"
          >
            Найти
          </button>
        </div>
      </form>
    </div>
  );
};
