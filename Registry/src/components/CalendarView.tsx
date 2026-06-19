import { ChevronLeft, ChevronRight } from "lucide-react";
import { DAY_NAMES, MONTH_NAMES } from "../constants";
import { getDaysInMonth, getFirstDayOfMonth, toApiDate, getTodayString } from "../utils/date";
import type { Doctor, Appointment } from "../types";

interface CalendarViewProps {
  doctor: Doctor;
  appointments: Appointment[];
  calendarMonth: number;
  calendarYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateStr: string) => void;
}

export default function CalendarView({
  doctor,
  appointments,
  calendarMonth,
  calendarYear,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: CalendarViewProps) {
  const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
  const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
  const today = new Date();

  const getAppointmentsCountForDate = (dateStr: string): number => {
    return appointments.filter((a) => {
      const apiDate = toApiDate(dateStr);
      return a.appointment_date === apiDate;
    }).length;
  };

  return (
    <div>
      {/* Заголовок календаря */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-slate-800">
          {doctor.name}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevMonth}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm font-medium text-slate-700 min-w-[140px] text-center">
            {MONTH_NAMES[calendarMonth]} {calendarYear}
          </span>
          <button
            onClick={onNextMonth}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Календарь */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 mb-6">
        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {DAY_NAMES.map((name) => (
            <div
              key={name}
              className="text-center text-xs font-medium text-slate-400 py-1"
            >
              {name}
            </div>
          ))}
        </div>

        {/* Ячейки дней */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateObj = new Date(calendarYear, calendarMonth, day);
            const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
            const isWorkDay = doctor.workDays.includes(dayOfWeek);
            const dateStr = `${String(day).padStart(2, "0")}.${String(
              calendarMonth + 1
            ).padStart(2, "0")}.${calendarYear}`;
            const count = getAppointmentsCountForDate(dateStr);
            const isFull = count >= doctor.maxPatientsPerDay;
            const isToday =
              day === today.getDate() &&
              calendarMonth === today.getMonth() &&
              calendarYear === today.getFullYear();

            if (!isWorkDay) {
              return (
                <div
                  key={day}
                  className="aspect-square flex items-center justify-center rounded-lg bg-slate-50"
                >
                  <span className="text-xs text-slate-300">{day}</span>
                </div>
              );
            }

            return (
              <button
                key={day}
                onClick={() => onSelectDate(dateStr)}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-200 border ${
                  isToday
                    ? "border-medical-400 ring-2 ring-medical-100"
                    : "border-transparent"
                } ${
                  isFull
                    ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <span className="text-sm font-medium">{day}</span>
                <span className="text-[10px] leading-none mt-0.5">
                  {isFull
                    ? "занято"
                    : `${doctor.maxPatientsPerDay - count} мест`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-200" />
          <span>Есть места</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-100 border border-slate-200" />
          <span>Нет мест</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-slate-50" />
          <span>Выходной</span>
        </div>
      </div>
    </div>
  );
}