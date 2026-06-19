import { useState, useCallback } from "react";
import { Calendar } from "lucide-react";
import { getTodayString } from "./utils/date";
import { getDepartment, setDepartment } from "./utils/patient";
import { useAppointments } from "./hooks/useAppointments";
import { useDoctors } from "./hooks/useDoctors";
import type { Appointment } from "./types";
import Header from "./components/Header";
import DoctorPanel from "./components/DoctorPanel";
import CalendarView from "./components/CalendarView";
import AppointmentList from "./components/AppointmentList";
import AppointmentModal from "./components/AppointmentModal";
import SettingsModal from "./components/SettingsModal";

export default function App() {
  const [date, setDate] = useState(getTodayString());
  const { appointments, createAppointment, updateAppointment, removeAppointment } =
    useAppointments(date);
  const {
    doctors,
    createDoctor,
    updateDoctor,
    removeDoctor,
    getDoctorsForDate,
    fetchDoctors,
  } = useDoctors();

  // Модалка записи
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);

  // Модалка настроек
  const [showSettings, setShowSettings] = useState(false);
  const [departmentInput, setDepartmentInput] = useState(getDepartment());
  const [settingsTab, setSettingsTab] = useState<"department" | "doctors">("department");

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

  // Удаление записи
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  // Открытие / закрытие модалки записи
  const openAddModal = useCallback(() => {
    setEditingAppointment(null);
    setLastName("");
    setFirstName("");
    setMiddleName("");
    setDateOfBirth("");
    setSelectedStudies([]);
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
    const data = { lastName, firstName, middleName, dateOfBirth, studies: selectedStudies };
    let success = false;

    if (editingAppointment) {
      success = await updateAppointment(editingAppointment.id, data);
    } else {
      success = await createAppointment(data);
    }

    if (success) {
      setShowModal(false);
    }
  }, [lastName, firstName, middleName, dateOfBirth, selectedStudies, editingAppointment, createAppointment, updateAppointment]);

  const handleDeleteAppointment = useCallback(async () => {
    if (!editingAppointment) return;
    const success = await removeAppointment(editingAppointment.id);
    if (success) {
      setShowModal(false);
    }
  }, [editingAppointment, removeAppointment]);

  const handleDeleteFromCard = useCallback(async (id: number) => {
    await removeAppointment(id);
  }, [removeAppointment]);

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
    } else {
      success = await createDoctor({
        name: doctorName.trim(),
        maxPatientsPerDay: maxPatients,
        workDays: doctorWorkDays,
      });
    }

    if (success) {
      setShowDoctorForm(false);
    }
  }, [doctorName, doctorMaxPatients, doctorWorkDays, editingDoctor, createDoctor, updateDoctor]);

  const handleDeleteDoctor = useCallback(async (id: string) => {
    await removeDoctor(id);
    if (selectedDoctorId === id) setSelectedDoctorId(null);
  }, [removeDoctor, selectedDoctorId]);

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
  const selectedDoctor = selectedDoctorId
    ? doctors.find((d) => d.id === selectedDoctorId)
    : null;

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

        <main className="flex-1 overflow-y-auto p-6">
          {selectedDoctor ? (
            <CalendarView
              doctor={selectedDoctor}
              appointments={appointments}
              calendarMonth={calendarMonth}
              calendarYear={calendarYear}
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
          appointmentsCount={appointments.length}
          onLastNameChange={setLastName}
          onFirstNameChange={setFirstName}
          onMiddleNameChange={setMiddleName}
          onDateOfBirthChange={setDateOfBirth}
          onToggleStudy={toggleStudy}
          onClose={() => setShowModal(false)}
          onSave={handleSaveAppointment}
          onDelete={handleDeleteAppointment}
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
          onDepartmentChange={setDepartmentInput}
          onSettingsTabChange={setSettingsTab}
          onSaveDepartment={() => {
            setDepartment(departmentInput);
            setShowSettings(false);
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
    </div>
  );
}