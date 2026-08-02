import { useState, useCallback, useEffect } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { getTodayString } from "./utils/date";
import { getDepartment, setDepartment } from "./utils/patient";
import { useAppointments } from "./hooks/useAppointments";
import { useDoctors } from "./hooks/useDoctors";
import { useToast } from "./hooks/useToast";
import type { Appointment } from "./types";
import Header from "./components/Header";
import DoctorPanel from "./components/DoctorPanel";
import CalendarView from "./components/CalendarView";
import AllDoctorsView from "./components/AllDoctorsView";
import AppointmentList from "./components/AppointmentList";
import AppointmentModal from "./components/AppointmentModal";
import SettingsModal, { cleanIpInput, type UpdateState } from "./components/SettingsModal";
import ToastContainer from "./components/Toast";
import ConfirmDialog from "./components/ConfirmDialog";

interface UpdateServer {
  name: string;
  ip: string;
}

export default function App() {
  const [date, setDate] = useState(getTodayString());
  const {
    appointments,
    allAppointments,
    loading: loadingAppointments,
    createAppointment,
    updateAppointment,
    removeAppointment,
  } = useAppointments(date);
  const {
    doctors,
    loading: loadingDoctors,
    createDoctor,
    updateDoctor,
    removeDoctor,
    getDoctorsForDate,
  } = useDoctors();
  const { toasts, addToast, removeToast } = useToast();

  // Модалка записи
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [modalDoctorId, setModalDoctorId] = useState("");

  // Модалка настроек
  const [showSettings, setShowSettings] = useState(false);
  const [departmentInput, setDepartmentInput] = useState(getDepartment());
  const [settingsTab, setSettingsTab] = useState<"department" | "doctors" | "update">("department");

  // Врачи UI
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  // Форма врача
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [doctorName, setDoctorName] = useState("");
  const [doctorMaxPatients, setDoctorMaxPatients] = useState("15");
  const [doctorWorkDays, setDoctorWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);

  // Обновление программы
  const [updateState, setUpdateState] = useState<UpdateState>("idle");
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateVersion, setUpdateVersion] = useState("");
  const [updateErrorMsg, setUpdateErrorMsg] = useState("");
  const [updateServers, setUpdateServers] = useState<UpdateServer[]>([]);
  const [updateActiveIp, setUpdateActiveIp] = useState("");
  const [updateNewName, setUpdateNewName] = useState("");
  const [updateNewIp, setUpdateNewIp] = useState("");

  // Загрузка сохранённых серверов обновлений
  useEffect(() => {
    const api = window.updateAPI;
    if (!api) return;

    api.getServers().then((stored) => {
      if (Array.isArray(stored)) {
        setUpdateServers(stored);
      }
    }).catch(() => {});

    api.getActiveServer().then((ip) => {
      setUpdateActiveIp(ip || "");
    }).catch(() => {});
  }, []);

  // Подписка на события обновления
  useEffect(() => {
    const api = window.updateAPI;
    if (!api) return;

    const unsub1 = api.onUpdateAvailable((info) => {
      setUpdateState("available");
      setUpdateVersion(info.version);
      setUpdateProgress(0);
    });
    const unsub2 = api.onUpdateNotAvailable(() => {
      setUpdateState("not-available");
    });
    const unsub3 = api.onDownloadProgress((p) => {
      setUpdateState("downloading");
      setUpdateProgress(Math.round(p.percent));
    });
    const unsub4 = api.onUpdateDownloaded((info) => {
      setUpdateState("downloaded");
      setUpdateVersion(info.version);
      setUpdateProgress(100);
    });
    const unsub5 = api.onUpdateError((err) => {
      setUpdateState("error");
      setUpdateErrorMsg(err.message);
    });

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();
    };
  }, []);

  const persistUpdateServers = useCallback((updated: UpdateServer[]) => {
    window.updateAPI?.saveServers(updated).catch(() => {});
  }, []);

  const handleUpdateAddServer = useCallback(() => {
    const cleanedIp = cleanIpInput(updateNewIp);
    if (!cleanedIp) return;
    if (updateServers.some((s) => s.ip === cleanedIp)) return;
    const name = updateNewName.trim() || cleanedIp;
    const updated = [...updateServers, { name, ip: cleanedIp }];
    setUpdateServers(updated);
    persistUpdateServers(updated);
    setUpdateNewName("");
    setUpdateNewIp("");
  }, [updateNewIp, updateNewName, updateServers, persistUpdateServers]);

  const handleUpdateRemoveServer = useCallback((server: UpdateServer) => {
    const updated = updateServers.filter((s) => s.ip !== server.ip);
    setUpdateServers(updated);
    persistUpdateServers(updated);
    if (updateActiveIp === server.ip) {
      setUpdateActiveIp("");
      window.updateAPI?.setActiveServer("").catch(() => {});
    }
  }, [updateServers, persistUpdateServers, updateActiveIp]);

  const handleUpdateSelectServer = useCallback((server: UpdateServer) => {
    setUpdateActiveIp(server.ip);
    window.updateAPI?.setActiveServer(server.ip).catch(() => {});
  }, []);

  const handleUpdateCheck = useCallback(() => {
    if (!window.updateAPI) return;
    setUpdateState("checking");
    setUpdateErrorMsg("");
    window.updateAPI.check();
  }, []);

  const handleUpdateDownload = useCallback(() => {
    if (!window.updateAPI) return;
    window.updateAPI.download();
  }, []);

  const handleUpdateInstall = useCallback(() => {
    if (!window.updateAPI) return;
    window.updateAPI.install();
  }, []);

  // Confirm диалог
  const [confirm, setConfirm] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Открытие / закрытие модалки записи
  const openAddModal = useCallback(() => {
    setEditingAppointment(null);
    setLastName("");
    setFirstName("");
    setMiddleName("");
    setDateOfBirth("");
    setSelectedStudies([]);
    setModalDoctorId("");
    setShowModal(true);
  }, []);

  const openEditModal = useCallback((appointment: Appointment) => {
    setEditingAppointment(appointment);
    setLastName(appointment.patient?.last_name || "");
    setFirstName(appointment.patient?.first_name || "");
    setMiddleName(appointment.patient?.middle_name || "");
    setDateOfBirth(appointment.patient?.date_of_birth || "");
    setSelectedStudies(appointment.studies);
    setShowModal(true);
  }, []);

  const handleSaveAppointment = useCallback(async () => {
    const data = {
      lastName,
      firstName,
      middleName,
      dateOfBirth,
      studies: selectedStudies,
      doctorId: modalDoctorId || undefined,
    };

    if (editingAppointment) {
      const success = await updateAppointment(editingAppointment.id, data);
      if (success) {
        addToast("success", "Запись обновлена");
        setShowModal(false);
      } else {
        addToast("error", "Не удалось обновить запись");
      }
    } else {
      const success = await createAppointment(data);
      if (success) {
        addToast("success", "Пациент добавлен");
        setShowModal(false);
      } else {
        addToast("error", "Не удалось добавить пациента");
      }
    }
  }, [
    lastName,
    firstName,
    middleName,
    dateOfBirth,
    selectedStudies,
    modalDoctorId,
    editingAppointment,
    createAppointment,
    updateAppointment,
    addToast,
  ]);

  const handleDeleteAppointment = useCallback(async () => {
    if (!editingAppointment) return;
    const success = await removeAppointment(editingAppointment.id);
    if (success) {
      addToast("success", "Запись удалена");
      setShowModal(false);
    } else {
      addToast("error", "Не удалось удалить запись");
    }
  }, [editingAppointment, removeAppointment, addToast]);

  const handleDeleteFromCard = useCallback(
    (id: number) => {
      setConfirm({
        title: "Удалить запись",
        message: "Вы уверены, что хотите удалить эту запись?",
        onConfirm: async () => {
          const success = await removeAppointment(id);
          if (success) {
            addToast("success", "Запись удалена");
          } else {
            addToast("error", "Не удалось удалить запись");
          }
          setConfirm(null);
        },
      });
    },
    [removeAppointment, addToast]
  );

  const toggleStudy = useCallback((study: string) => {
    setSelectedStudies((prev) =>
      prev.includes(study) ? prev.filter((s) => s !== study) : [...prev, study]
    );
  }, []);

  // Врачи
  const openAddDoctorForm = useCallback(() => {
    setEditingDoctor(null);
    setDoctorName("");
    setDoctorMaxPatients("15");
    setDoctorWorkDays([1, 2, 3, 4, 5]);
    setShowDoctorForm(true);
  }, []);

  const openEditDoctorForm = useCallback((doctor: any) => {
    setEditingDoctor(doctor);
    setDoctorName(doctor.name);
    setDoctorMaxPatients(String(doctor.maxPatientsPerDay));
    setDoctorWorkDays([...doctor.workDays]);
    setShowDoctorForm(true);
  }, []);

  const handleSaveDoctor = useCallback(async () => {
    if (!doctorName.trim()) return;
    const maxPatients = parseInt(doctorMaxPatients) || 15;
    let success = false;

    if (editingDoctor) {
      success = await updateDoctor(editingDoctor.id, {
        name: doctorName.trim(),
        maxPatientsPerDay: maxPatients,
        workDays: doctorWorkDays,
      });
      if (success) addToast("success", "Врач обновлён");
      else addToast("error", "Не удалось обновить врача");
    } else {
      success = await createDoctor({
        name: doctorName.trim(),
        maxPatientsPerDay: maxPatients,
        workDays: doctorWorkDays,
      });
      if (success) addToast("success", "Врач добавлен");
      else addToast("error", "Не удалось добавить врача");
    }

    if (success) setShowDoctorForm(false);
  }, [
    doctorName,
    doctorMaxPatients,
    doctorWorkDays,
    editingDoctor,
    createDoctor,
    updateDoctor,
    addToast,
  ]);

  const handleDeleteDoctor = useCallback(
    (id: string) => {
      setConfirm({
        title: "Удалить врача",
        message: "Вы уверены, что хотите удалить этого врача?",
        onConfirm: async () => {
          const success = await removeDoctor(id);
          if (success) {
            addToast("success", "Врач удалён");
            if (selectedDoctorId === id) setSelectedDoctorId(null);
          } else {
            addToast("error", "Не удалось удалить врача");
          }
          setConfirm(null);
        },
      });
    },
    [removeDoctor, selectedDoctorId, addToast]
  );

  const toggleWorkDay = useCallback((day: number) => {
    setDoctorWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  }, []);

  // Календарь
  const prevMonth = useCallback(() => {
    setCalendarMonth((m) => (m === 0 ? 11 : m - 1));
    setCalendarYear((y) => (calendarMonth === 0 ? y - 1 : y));
  }, [calendarMonth]);

  const nextMonth = useCallback(() => {
    setCalendarMonth((m) => (m === 11 ? 0 : m + 1));
    setCalendarYear((y) => (calendarMonth === 11 ? y + 1 : y));
  }, [calendarMonth]);

  // Настройки
  const handleOpenSettings = useCallback(() => {
    setDepartmentInput(getDepartment());
    setSettingsTab("department");
    setShowSettings(true);
  }, []);

  // Врачи на выбранную дату
  const todayDoctors = getDoctorsForDate(date);

  // Выбранный врач
  const selectedDoctor = selectedDoctorId && selectedDoctorId !== "all"
    ? doctors.find((d) => d.id === selectedDoctorId)
    : null;

  const isLoading = loadingAppointments || loadingDoctors;

  return (
    <div
      style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }}
      className="h-screen flex flex-col"
    >
      <Header
        date={date}
        onDateChange={setDate}
        onAddClick={openAddModal}
        onSettingsClick={handleOpenSettings}
      />

      <div className="flex-1 flex overflow-hidden">
        <DoctorPanel
          doctors={doctors}
          selectedDoctorId={selectedDoctorId}
          onSelectDoctor={setSelectedDoctorId}
        />

        <main className="flex-1 overflow-y-auto p-6 min-h-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Loader2 size={32} className="animate-spin mb-2" />
              <p className="text-sm">Загрузка...</p>
            </div>
          ) : selectedDoctorId === "all" ? (
            <AllDoctorsView
              doctors={doctors}
              appointments={allAppointments}
              calendarMonth={calendarMonth}
              calendarYear={calendarYear}
              selectedDate={date}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onSelectDate={setDate}
            />
          ) : selectedDoctor ? (
            <CalendarView
              doctor={selectedDoctor}
              appointments={allAppointments}
              calendarMonth={calendarMonth}
              calendarYear={calendarYear}
              selectedDate={date}
              onPrevMonth={prevMonth}
              onNextMonth={nextMonth}
              onSelectDate={setDate}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Calendar size={48} className="mb-4 opacity-50" />
              <p className="text-base font-medium">Выберите врача</p>
              <p className="text-sm mt-1">
                Нажмите на врача слева, чтобы увидеть календарь занятости
              </p>
            </div>
          )}
        </main>

        <AppointmentList
          date={date}
          appointments={appointments}
          todayDoctors={todayDoctors}
          onEdit={openEditModal}
          onDelete={handleDeleteFromCard}
        />
      </div>

      {/* Модалка добавления/редактирования */}
      {showModal && (
        <AppointmentModal
          editingAppointment={editingAppointment}
          lastName={lastName}
          firstName={firstName}
          middleName={middleName}
          dateOfBirth={dateOfBirth}
          selectedStudies={selectedStudies}
          todayDoctors={todayDoctors}
          allDoctors={doctors}
          appointmentsCount={appointments.length}
          selectedDoctorId={modalDoctorId}
          onLastNameChange={setLastName}
          onFirstNameChange={setFirstName}
          onMiddleNameChange={setMiddleName}
          onDateOfBirthChange={setDateOfBirth}
          onToggleStudy={toggleStudy}
          onDoctorIdChange={setModalDoctorId}
          onClose={() => setShowModal(false)}
          onSave={handleSaveAppointment}
          onDelete={() => {
            setShowModal(false);
            if (editingAppointment) {
              setConfirm({
                title: "Удалить запись",
                message: "Вы уверены, что хотите удалить эту запись?",
                onConfirm: async () => {
                  const success = await removeAppointment(
                    editingAppointment.id
                  );
                  if (success) addToast("success", "Запись удалена");
                  else addToast("error", "Не удалось удалить запись");
                  setConfirm(null);
                },
              });
            }
          }}
        />
      )}

      {/* Модалка настроек */}
      {showSettings && (
        <SettingsModal
          departmentInput={departmentInput}
          settingsTab={settingsTab}
          doctors={doctors}
          showDoctorForm={showDoctorForm}
          editingDoctor={editingDoctor}
          doctorName={doctorName}
          doctorMaxPatients={doctorMaxPatients}
          doctorWorkDays={doctorWorkDays}
          updateState={updateState}
          updateProgress={updateProgress}
          updateVersion={updateVersion}
          updateErrorMsg={updateErrorMsg}
          updateServers={updateServers}
          updateActiveIp={updateActiveIp}
          updateNewName={updateNewName}
          updateNewIp={updateNewIp}
          onUpdateNewNameChange={setUpdateNewName}
          onUpdateNewIpChange={setUpdateNewIp}
          onUpdateAddServer={handleUpdateAddServer}
          onUpdateRemoveServer={handleUpdateRemoveServer}
          onUpdateSelectServer={handleUpdateSelectServer}
          onUpdateCheck={handleUpdateCheck}
          onUpdateDownload={handleUpdateDownload}
          onUpdateInstall={handleUpdateInstall}
          onDepartmentChange={setDepartmentInput}
          onSettingsTabChange={setSettingsTab}
          onSaveDepartment={() => {
            setDepartment(departmentInput);
            setShowSettings(false);
            addToast("success", "Отделение сохранено");
          }}
          onClose={() => setShowSettings(false)}
          onAddDoctor={openAddDoctorForm}
          onEditDoctor={openEditDoctorForm}
          onDeleteDoctor={handleDeleteDoctor}
          onDoctorNameChange={setDoctorName}
          onDoctorMaxPatientsChange={setDoctorMaxPatients}
          onToggleWorkDay={toggleWorkDay}
          onSaveDoctor={handleSaveDoctor}
          onCancelDoctorForm={() => setShowDoctorForm(false)}
        />
      )}

      {/* Confirm диалог */}
      {confirm && (
        <ConfirmDialog
          title={confirm.title}
          message={confirm.message}
          onConfirm={confirm.onConfirm}
          onCancel={() => setConfirm(null)}
        />
      )}

      {/* Toast уведомления */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}