import type { Appointment } from "../types";
import { formatDate } from "../utils/date";
import AppointmentCard from "./AppointmentCard";

interface AppointmentListProps {
  date: string;
  appointments: Appointment[];
  todayDoctors: { id: string; name: string }[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: number) => void;
}

export default function AppointmentList({
  date,
  appointments,
  todayDoctors,
  onEdit,
  onDelete,
}: AppointmentListProps) {
  return (
    <aside className="w-80 bg-white border-l border-slate-200 overflow-y-auto shrink-0">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
            Записи на {formatDate(date)}
          </h3>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
            {appointments.length}
          </span>
        </div>

        {appointments.length === 0 ? (
          <p className="text-xs text-slate-400">Нет записей</p>
        ) : (
          <div className="space-y-2">
            {appointments.map((appt) => (
              <AppointmentCard
                key={appt.id}
                appointment={appt}
                todayDoctors={todayDoctors}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}