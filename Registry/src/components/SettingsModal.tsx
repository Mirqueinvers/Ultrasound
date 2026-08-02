import { X, Plus, Pencil, Trash2, RefreshCw, Download, CheckCircle, AlertCircle, RotateCw, Server, Upload } from "lucide-react";
import { DAY_NAMES, DAY_NAMES_FULL } from "../constants";
import { btnClass } from "../constants";
import type { Doctor } from "../types";

export type UpdateState = "idle" | "checking" | "available" | "downloading" | "downloaded" | "error" | "not-available";

interface UpdateServer {
  name: string;
  ip: string;
}

interface SettingsModalProps {
  departmentInput: string;
  settingsTab: "department" | "doctors" | "update";
  doctors: Doctor[];
  showDoctorForm: boolean;
  editingDoctor: Doctor | null;
  doctorName: string;
  doctorMaxPatients: string;
  doctorWorkDays: number[];
  // Update state
  updateState: UpdateState;
  updateProgress: number;
  updateVersion: string;
  updateErrorMsg: string;
  updateServers: UpdateServer[];
  updateActiveIp: string;
  updateNewName: string;
  updateNewIp: string;
  onUpdateNewNameChange: (val: string) => void;
  onUpdateNewIpChange: (val: string) => void;
  onUpdateAddServer: () => void;
  onUpdateRemoveServer: (server: UpdateServer) => void;
  onUpdateSelectServer: (server: UpdateServer) => void;
  onUpdateCheck: () => void;
  onUpdateDownload: () => void;
  onUpdateInstall: () => void;
  onDepartmentChange: (val: string) => void;
  onSettingsTabChange: (tab: "department" | "doctors" | "update") => void;
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

// Очистка ввода: убираем IP:, http://, слэши и порт :8080, оставляем только IP
export function cleanIpInput(raw: string): string {
  return raw
    .replace(/^IP\s*:\s*/i, "")
    .replace(/^http:\/\//i, "")
    .replace(/\/+$/, "")
    .replace(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/, "$1")
    .trim();
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
  updateState,
  updateProgress,
  updateVersion,
  updateErrorMsg,
  updateServers,
  updateActiveIp,
  updateNewName,
  updateNewIp,
  onUpdateNewNameChange,
  onUpdateNewIpChange,
  onUpdateAddServer,
  onUpdateRemoveServer,
  onUpdateSelectServer,
  onUpdateCheck,
  onUpdateDownload,
  onUpdateInstall,
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
      <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] flex flex-col">
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
          <button
            onClick={() => onSettingsTabChange("update")}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
              settingsTab === "update"
                ? "bg-medical-50 text-medical-700 border-b-2 border-medical-500"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
            }`}
          >
            Обновление
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

        {/* Вкладка "Обновление" */}
        {settingsTab === "update" && (
          <div className="overflow-y-auto min-h-0">
            {/* Блок выбора сервера обновлений */}
            <div className="mb-4 p-4 bg-slate-50 border border-slate-200 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <Server size={16} className="text-medical-600" />
                <span className="text-sm font-semibold text-slate-700">
                  Сервер обновлений
                </span>
              </div>

              {/* Список серверов */}
              <div className="space-y-2 mb-3">
                {updateServers.length === 0 && (
                  <p className="text-sm text-slate-400">
                    Список пуст. Добавьте IP-адрес сервера обновлений.
                  </p>
                )}
                {updateServers.map((server) => (
                  <div
                    key={server.ip}
                    onClick={() => onUpdateSelectServer(server)}
                    className={`flex items-center gap-2 bg-white border rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 ${
                      updateActiveIp === server.ip
                        ? "border-medical-500 ring-1 ring-medical-500"
                        : "border-slate-200 hover:border-medical-300"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                        updateActiveIp === server.ip
                          ? "border-medical-500 bg-medical-500"
                          : "border-slate-300"
                      }`}
                      style={
                        updateActiveIp === server.ip
                          ? { boxShadow: "inset 0 0 0 3px #fff" }
                          : undefined
                      }
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-700 truncate">
                        {server.name}
                      </p>
                      <p className="text-xs text-slate-400 font-mono">{server.ip}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpdateRemoveServer(server);
                      }}
                      className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all shrink-0"
                      title="Удалить"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Добавление нового сервера */}
              <input
                type="text"
                value={updateNewName}
                onChange={(e) => onUpdateNewNameChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onUpdateAddServer()}
                placeholder="Название (необязательно)"
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200 mb-2"
              />
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={updateNewIp}
                  onChange={(e) => onUpdateNewIpChange(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onUpdateAddServer()}
                  placeholder="192.168.1.100"
                  className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200"
                />
                <button
                  onClick={onUpdateAddServer}
                  className={`${btnClass} shrink-0`}
                >
                  <Plus size={16} />
                  Добавить
                </button>
              </div>

              <p className="text-xs text-slate-400 mt-3">
                Порт 8080 подставляется автоматически. Выбранный сервер используется при проверке обновлений.
              </p>
            </div>

            {/* Статус обновления */}
            <div className="flex flex-col items-center gap-3 py-2">
              <div className="flex flex-col items-center gap-2">
                {(updateState === "idle" || updateState === "not-available") && (
                  <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                    <RefreshCw size={32} />
                  </div>
                )}
                {updateState === "checking" && (
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                    <RotateCw size={32} className="animate-spin" />
                  </div>
                )}
                {updateState === "available" && (
                  <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center">
                    <Download size={32} />
                  </div>
                )}
                {updateState === "downloading" && (
                  <div className="w-16 h-16 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                    <Download size={32} />
                  </div>
                )}
                {(updateState === "downloaded") && (
                  <div className="w-16 h-16 rounded-full bg-green-50 text-green-500 flex items-center justify-center">
                    <CheckCircle size={32} />
                  </div>
                )}
                {updateState === "error" && (
                  <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center">
                    <AlertCircle size={32} />
                  </div>
                )}

                <p className="text-sm text-slate-600 text-center">
                  {updateState === "idle" && "Нажмите «Проверить», чтобы узнать о наличии обновлений"}
                  {updateState === "checking" && "Проверка обновлений..."}
                  {updateState === "available" && `Доступна версия ${updateVersion}`}
                  {updateState === "downloading" && `Загрузка... ${updateProgress}%`}
                  {updateState === "downloaded" && `Версия ${updateVersion} загружена. Установить?`}
                  {updateState === "error" && `Ошибка: ${updateErrorMsg}`}
                  {updateState === "not-available" && "У вас актуальная версия"}
                </p>

                {updateState === "downloading" && (
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-medical-500 rounded-full transition-all duration-300"
                      style={{ width: `${updateProgress}%` }}
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                {(updateState === "idle" || updateState === "error" || updateState === "not-available") && (
                  <button
                    onClick={onUpdateCheck}
                    className="px-4 py-2 text-sm font-medium text-white bg-medical-500 hover:bg-medical-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <RefreshCw size={16} />
                    Проверить
                  </button>
                )}
                {updateState === "available" && (
                  <button
                    onClick={onUpdateDownload}
                    className="px-4 py-2 text-sm font-medium text-white bg-medical-500 hover:bg-medical-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Download size={16} />
                    Скачать
                  </button>
                )}
                {updateState === "downloaded" && (
                  <button
                    onClick={onUpdateInstall}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Upload size={16} />
                    Установить
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}