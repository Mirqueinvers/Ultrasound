import { Calendar, Plus, Settings } from "lucide-react";
import { btnClass } from "../constants";
import DatePickerField from "./DatePickerField";

interface HeaderProps {
  date: string;
  onDateChange: (date: string) => void;
  onAddClick: () => void;
  onSettingsClick: () => void;
}

export default function Header({
  date,
  onDateChange,
  onAddClick,
  onSettingsClick,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={24} className="text-medical-500" />
          <h1 className="text-xl font-semibold text-slate-800">
            Регистратура УЗИ
          </h1>
        </div>
        <div className="absolute left-1/2 -translate-x-1/2">
          <DatePickerField
            value={date}
            onChange={onDateChange}
            placeholder="дд.мм.гггг"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onAddClick}
            className={`${btnClass} bg-medical-500 text-white hover:bg-medical-600 flex items-center gap-2`}
          >
            <Plus size={16} />
            Добавить запись
          </button>
          <button
            onClick={onSettingsClick}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
            title="Настройки"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}