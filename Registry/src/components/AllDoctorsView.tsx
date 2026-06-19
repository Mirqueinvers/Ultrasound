import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { DAY_NAMES, MONTH_NAMES } from "../constants";
import { getDaysInMonth, getFirstDayOfMonth, toApiDate } from "../utils/date";
import type { Doctor, Appointment } from "../types";

interface AllDoctorsViewProps {
  doctors: Doctor[];
  appointments: Appointment[];
  calendarMonth: number;
  calendarYear: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onSelectDate: (dateStr: string) => void;
}

export default function AllDoctorsView({
  doctors,
  appointments,
  calendarMonth,
  calendarYear,
  onPrevMonth,
  onNextMonth,
  onSelectDate,
}: AllDoctorsViewProps) {
  const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
  const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
  const today = new Date();

  const getDayOfWeek = (day: number) => {
    const dateObj = new Date(calendarYear, calendarMonth, day);
    return dateObj.getDay() === 0 ? 7 : dateObj.getDay();
  };

  const getDoctorStats = (day: number) => {
    const dayOfWeek = getDayOfWeek(day);
    const workingDoctors = doctors.filter((d) => d.workDays.includes(dayOfWeek));
    const maxPatients = workingDoctors.reduce((sum, d) => sum + d.maxPatientsPerDay, 0);
    const dateStr = `${String(day).padStart(2, "0")}.${String(
      calendarMonth + 1
    ).padStart(2, "0")}.${calendarYear}`;
    const apiDate = toApiDate(dateStr);
    const count = appointments.filter((a) => a.appointment_date === apiDate).length;
    return { maxPatients, count, isWorkDay: workingDoctors.length > 0 };
  };

  return (
    <div className="flex flex-col h-full">
      {/* Заголовок */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-medical-500" />
          <h2 className="text-lg font-semibold text-slate-800">
            Все врачи — сводка
          </h2>
        </div>
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

      {/* Единый календарь */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex-1 flex flex-col min-h-0">
        {/* Дни недели */}
        <div className="grid grid-cols-7 gap-1 mb-1 shrink-0">
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
        <div className="grid grid-cols-7 gap-1 flex-1 auto-rows-fr">
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const stats = getDoctorStats(day);
            const isFull = stats.isWorkDay && stats.count >= stats.maxPatients;
            const dateStr = `${String(day).padStart(2, "0")}.${String(
              calendarMonth + 1
            ).padStart(2, "0")}.${calendarYear}`;
            const isToday =
              day === today.getDate() &&
              calendarMonth === today.getMonth() &&
              calendarYear === today.getFullYear();

            return (
              <button
                key={day}
                onClick={() => onSelectDate(dateStr)}
                className={`flex flex-col items-center justify-center rounded-lg transition-all duration-200 border ${
                  isToday
                    ? "border-medical-400 ring-2 ring-medical-100"
                    : "border-transparent"
                } ${
                  !stats.isWorkDay
                    ? "bg-slate-50 text-slate-300"
                    : isFull
                      ? "bg-slate-100 text-slate-400 hover:bg-slate-200"
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                <span className="text-sm font-medium leading-none">{day}</span>
                <span className="text-[10px] leading-none mt-0.5">
                  {!stats.isWorkDay
                    ? "—"
                    : isFull
                      ? "занято"
                      : `${stats.maxPatients - stats.count} мест`}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Легенда */}
      <div className="flex items-center gap-4 text-xs text-slate-500 mt-4 shrink-0">
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