import React, { useRef, useState, useEffect } from "react";

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Окторябрь", "Ноябрь", "Декабрь",
];

const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

type CalendarView = "days" | "months" | "years";

interface DatePickerFieldProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

/** Парсит дату из формата "дд.мм.гггг" или "гггг-мм-дд" */
function parseDate(value: string): Date | null {
  if (!value) return null;
  // "дд.мм.гггг"
  const dotMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
  if (dotMatch) {
    return new Date(+dotMatch[3], +dotMatch[2] - 1, +dotMatch[1]);
  }
  // "гггг-мм-дд"
  const dashMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dashMatch) {
    return new Date(+dashMatch[1], +dashMatch[2] - 1, +dashMatch[3]);
  }
  return null;
}

const DatePickerField: React.FC<DatePickerFieldProps> = ({ value, onChange, placeholder }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<CalendarView>("days");
  const [viewDate, setViewDate] = useState(() => {
    const d = parseDate(value) ?? new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });
  const ref = useRef<HTMLDivElement>(null);

  // Закрытие по клику вне компонента
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  const selectedDate = parseDate(value);

  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
  const firstDayOfWeek = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7; // Пн = 0

  const handlePrev = () => {
    if (view === "days") {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
    } else if (view === "months") {
      setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
    } else {
      setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
    }
  };

  const handleNext = () => {
    if (view === "days") {
      setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
    } else if (view === "months") {
      setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
    } else {
      setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
    }
  };

  const handleDayClick = (day: number) => {
    const m = viewDate.getMonth() + 1;
    const y = viewDate.getFullYear();
    const mm = String(m).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    onChange(`${dd}.${mm}.${y}`);
    setIsOpen(false);
  };

  const handleMonthClick = (monthIndex: number) => {
    setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
    setView("days");
  };

  const handleYearClick = (year: number) => {
    setViewDate(new Date(year, viewDate.getMonth(), 1));
    setView("months");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numbersOnly = raw.replace(/\D/g, "");
    if (numbersOnly.length === 8) {
      const day = numbersOnly.substring(0, 2);
      const month = numbersOnly.substring(2, 4);
      const year = numbersOnly.substring(4, 8);
      onChange(`${day}.${month}.${year}`);
    } else {
      onChange(raw);
    }
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const numbersOnly = raw.replace(/\D/g, "");
    if (numbersOnly.length === 8) {
      const day = numbersOnly.substring(0, 2);
      const month = numbersOnly.substring(2, 4);
      const year = numbersOnly.substring(4, 8);
      onChange(`${day}.${month}.${year}`);
    }
  };

  const isToday = (day: number) => {
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === viewDate.getMonth() &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  const isSelected = (day: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getFullYear() === viewDate.getFullYear()
    );
  };

  const isSelectedMonth = (monthIndex: number) => {
    if (!selectedDate) return false;
    return (
      selectedDate.getMonth() === monthIndex &&
      selectedDate.getFullYear() === viewDate.getFullYear()
    );
  };

  const isSelectedYear = (year: number) => {
    if (!selectedDate) return false;
    return selectedDate.getFullYear() === year;
  };

  const isCurrentMonth = (monthIndex: number) => {
    const today = new Date();
    return (
      today.getMonth() === monthIndex &&
      today.getFullYear() === viewDate.getFullYear()
    );
  };

  const isCurrentYear = (year: number) => {
    return new Date().getFullYear() === year;
  };

  // Заголовок в зависимости от режима
  const headerLabel = view === "days"
    ? `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`
    : view === "months"
      ? `${viewDate.getFullYear()}`
      : `${viewDate.getFullYear() - 5} – ${viewDate.getFullYear() + 6}`;

  const handleHeaderClick = () => {
    if (view === "days") setView("months");
    else if (view === "months") setView("years");
  };

  return (
    <div ref={ref} className="relative max-w-[200px]">
      {/* Поле ввода с иконкой календаря */}
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-3 pr-9 py-2 border-0 border-b-2 border-slate-200 bg-transparent text-sm text-slate-800 transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-sky-400 focus:bg-sky-50/30 rounded-t-md"
        />
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-500 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </button>
      </div>

      {/* Выпадающий календарь */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-[280px] bg-white rounded-xl border border-slate-200 shadow-lg p-3">
          {/* Заголовок с навигацией */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleHeaderClick}
              className="text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors px-2 py-0.5 rounded-md hover:bg-slate-50"
            >
              {headerLabel}
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Режим: дни */}
          {view === "days" && (
            <>
              {/* Дни недели */}
              <div className="grid grid-cols-7 gap-0.5 mb-1">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d} className="text-center text-[10px] font-semibold text-slate-400 uppercase py-1">
                    {d}
                  </div>
                ))}
              </div>
              {/* Сетка дней */}
              <div className="grid grid-cols-7 gap-0.5">
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const sel = isSelected(day);
                  const today = isToday(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => handleDayClick(day)}
                      className={`
                        w-8 h-8 rounded-lg text-xs font-medium transition-all
                        ${sel
                          ? "bg-sky-500 text-white shadow-sm"
                          : today
                            ? "bg-sky-50 text-sky-600 font-semibold"
                            : "text-slate-700 hover:bg-slate-100"
                        }
                      `}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {/* Режим: месяцы */}
          {view === "months" && (
            <div className="grid grid-cols-3 gap-2">
              {MONTHS.map((name, i) => {
                const sel = isSelectedMonth(i);
                const current = isCurrentMonth(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleMonthClick(i)}
                    className={`
                      py-2 rounded-lg text-xs font-medium transition-all
                      ${sel
                        ? "bg-sky-500 text-white shadow-sm"
                        : current
                          ? "bg-sky-50 text-sky-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-100"
                      }
                    `}
                  >
                    {name.substring(0, 3)}
                  </button>
                );
              })}
            </div>
          )}

          {/* Режим: годы */}
          {view === "years" && (
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 12 }).map((_, i) => {
                const year = viewDate.getFullYear() - 5 + i;
                const sel = isSelectedYear(year);
                const current = isCurrentYear(year);
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => handleYearClick(year)}
                    className={`
                      py-2 rounded-lg text-xs font-medium transition-all
                      ${sel
                        ? "bg-sky-500 text-white shadow-sm"
                        : current
                          ? "bg-sky-50 text-sky-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-100"
                      }
                    `}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export { DatePickerField, parseDate };
export default DatePickerField;
