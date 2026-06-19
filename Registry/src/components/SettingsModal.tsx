import { X, Plus, Pencil, Trash2 } from "lucide-react";
import { DAY_NAMES, DAY_NAMES_FULL } from "../constants";
import { btnClass } from "../constants";
import type { Doctor } from "../types";

interface SettingsModalProps {
  departmentInput: string;
  settingsTab: "department" | "doctors";
  doctors: Doctor[];
  showDoctorForm: boolean;
  editingDoctor: Doctor | null;
  doctorName: string;
  doctorMaxPatients: string;
  doctorWorkDays: number[];
  onDepartmentChange: (val: string) => void;
  onSettingsTabChange: (tab: "department" | "doctors") => void;
  onSaveDepartment: () => void;
  onClose: () => void;
  onAddDoctor: () => void;
  onEditDoctor: (doctor: Doctor) => void;
  onDeleteDoctor: (id: string) => void;
  onDoctorNameChange: (val: string) => void;
  onDoctorMaxPatientsChange: (val: string) => void;
  onToggleWorkDay: (day: number) => void;
  onSaveDoctor: () => void;
  onCancelDoctorForm: () => void;
}

export default function SettingsModal({
  departmentInput,
  settingsTab,
  doctors,
  showDoctorForm,
  editingDoctor,
  doctorName,
  doctorMaxPatients,
  doctorWorkDays,
  onDepartmentChange,
  onSettingsTabChange,
  onSaveDepartment,
  onClose,
  onAddDoctor,
  onEditDoctor,
  onDeleteDoctor,
  onDoctorNameChange,
  onDoctorMaxPatientsChange,
  onToggleWorkDay,
  onSaveDoctor,
  onCancelDoctorForm,
}: SettingsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-800">Настройки</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Вкладки */}
        <div className="flex gap-1 mb-4 border-b border-slate-200">
          <button
            onClick={() => onSettingsTabChange("department")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              settingsTab === "department"
                ? "bg-medical-50 text-medical-700 border-b-2 border-medical-500"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Отделение
          </button>
          <button
            onClick={() => onSettingsTabChange("doctors")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              settingsTab === "doctors"
                ? "bg-medical-50 text-medical-700 border-b-2 border-medical-500"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Врачи
          </button>
        </div>

        {/* Вкладка "Отделение" */}
        {settingsTab === "department" && (
          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Название отделения
            </label>
            <input
              type="text"
              value={departmentInput}
              onChange={(e) => onDepartmentChange(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200 mb-4"
            />
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
              >
                Отмена
              </button>
              <button
                onClick={onSaveDepartment}
                className="px-4 py-2 text-sm font-medium text-white bg-medical-500 hover:bg-medical-600 rounded-lg transition-all duration-200"
              >
                Сохранить
              </button>
            </div>
          </div>
        )}

        {/* Вкладка "Врачи" */}
        {settingsTab === "doctors" && (
          <div>
            {!showDoctorForm ? (
              <div>
                {/* Список врачей */}
                {doctors.length === 0 ? (
                  <p className="text-sm text-slate-400 mb-4">Врачи не добавлены</p>
                ) : (
                  <div className="space-y-2 mb-4">
                    {doctors.map((doctor) => (
                      <div
                        key={doctor.id}
                        className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-slate-700 truncate">
                            {doctor.name}
                          </div>
                          <div className="text-xs text-slate-400">
                            до {doctor.maxPatientsPerDay} пациентов ·{" "}
                            {doctor.workDays.map((d) => DAY_NAMES[d - 1]).join(", ")}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-2 shrink-0">
                          <button
                            onClick={() => onEditDoctor(doctor)}
                            className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                            title="Редактировать"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteDoctor(doctor.id)}
                            className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                            title="Удалить"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  onClick={onAddDoctor}
                  className="w-full px-4 py-2 text-sm font-medium text-medical-600 bg-medical-50 hover:bg-medical-100 border border-medical-200 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Plus size={16} />
                  Добавить врача
                </button>
              </div>
            ) : (
              /* Форма добавления/редактирования врача */
              <div>
                <h4 className="text-sm font-medium text-slate-700 mb-3">
                  {editingDoctor ? "Редактировать врача" : "Новый врач"}
                </h4>

                <div className="space-y-3 mb-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      ФИО врача
                    </label>
                    <input
                      type="text"
                      value={doctorName}
                      onChange={(e) => onDoctorNameChange(e.target.value)}
                      placeholder="Иванов Иван Иванович"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">
                      Максимум пациентов в день
                    </label>
                    <input
                      type="number"
                      value={doctorMaxPatients}
                      onChange={(e) => onDoctorMaxPatientsChange(e.target.value)}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-2">
                      Дни приёма
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {DAY_NAMES_FULL.map((name, index) => {
                        const day = index + 1;
                        const isSelected = doctorWorkDays.includes(day);
                        return (
                          <button
                            key={day}
                            type="button"
                            onClick={() => onToggleWorkDay(day)}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 ${
                              isSelected
                                ? "bg-medical-50 text-medical-700 border-medical-300"
                                : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onCancelDoctorForm}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={onSaveDoctor}
                    disabled={!doctorName.trim()}
                    className="px-4 py-2 text-sm font-medium text-white bg-medical-500 hover:bg-medical-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {editingDoctor ? "Сохранить" : "Добавить"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}