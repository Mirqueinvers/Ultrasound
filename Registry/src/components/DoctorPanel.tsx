import { DAY_NAMES } from "../constants";
import type { Doctor } from "../types";

interface DoctorPanelProps {
  doctors: Doctor[];
  selectedDoctorId: string | null;
  onSelectDoctor: (id: string) => void;
}

export default function DoctorPanel({
  doctors,
  selectedDoctorId,
  onSelectDoctor,
}: DoctorPanelProps) {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0">
      <div className="p-4">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
          Врачи
        </h3>
        <div className="space-y-1">
          <button
            onClick={() => onSelectDoctor("all")}
            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 border ${
              selectedDoctorId === "all"
                ? "bg-medical-50 text-medical-700 font-medium border-medical-200"
                : "text-slate-600 hover:bg-slate-50 border-transparent"
            }`}
          >
            <div className="font-medium truncate">👥 Все врачи</div>
            <div className="text-xs text-slate-400 mt-0.5">
              Сводная информация по всем врачам
            </div>
          </button>
          {doctors.length === 0 ? (
            <p className="text-xs text-slate-400">Врачи не добавлены</p>
          ) : (
            <div className="space-y-1 pt-2">
              {doctors.map((doctor) => (
                <button
                  key={doctor.id}
                  onClick={() => onSelectDoctor(doctor.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 border ${
                    selectedDoctorId === doctor.id
                      ? "bg-medical-50 text-medical-700 font-medium border-medical-200"
                      : "text-slate-600 hover:bg-slate-50 border-transparent"
                  }`}
                >
                  <div className="font-medium truncate">{doctor.name}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    до {doctor.maxPatientsPerDay} пациентов
                  </div>
                  <div className="text-xs text-slate-400">
                    {doctor.workDays.map((d) => DAY_NAMES[d - 1]).join(", ")}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}