import { Pencil, Trash2 } from "lucide-react";
import type { Appointment } from "../types";
import { formatDate, calculateAge } from "../utils/date";

interface AppointmentCardProps {
  appointment: Appointment;
  todayDoctors: { id: string; name: string }[];
  onEdit: (appointment: Appointment) => void;
  onDelete: (id: number) => void;
}

export default function AppointmentCard({
  appointment,
  todayDoctors,
  onEdit,
  onDelete,
}: AppointmentCardProps) {
  return (
    <div
      className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow duration-200 cursor-pointer"
      onClick={() => onEdit(appointment)}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-800 truncate">
            {appointment.patient?.last_name}{" "}
            {appointment.patient?.first_name}{" "}
            {appointment.patient?.middle_name}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            {formatDate(appointment.patient?.date_of_birth || "")},{" "}
            {calculateAge(appointment.patient?.date_of_birth || "")}
          </p>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {appointment.studies.map((study) => (
              <span
                key={study}
                className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200"
              >
                {study}
              </span>
            ))}
          </div>
          {todayDoctors.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {todayDoctors.map((doc) => (
                <span
                  key={doc.id}
                  className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded-full border border-sky-200"
                >
                  🏥 {doc.name}
                </span>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center gap-0.5 ml-2 shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(appointment);
            }}
            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
            title="Редактировать"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(appointment.id);
            }}
            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
            title="Удалить"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}