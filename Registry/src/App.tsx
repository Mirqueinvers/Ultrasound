import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Plus, Pencil, Trash2, X, Check, Settings, ChevronLeft, ChevronRight } from "lucide-react";
import DatePickerField from "./components/DatePickerField";

const STUDIES_LIST = [
  "ОБП",
  "Почки",
  "Органы мошонки",
  "ОМТ (Ж)",
  "ОМТ (М)",
  "Щитовидная железа",
  "Слюнные железы",
  "БЦА",
  "УВНК",
  "Молочные железы",
  "Детская диспансеризация",
  "Мягких тканей",
  "Мочевой пузырь",
  "Плевральные полости",
  "Лимфоузлы",
];

interface Patient {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string;
  date_of_birth: string;
}

interface Appointment {
  id: number;
  patient_id: number;
  appointment_date: string;
  studies: string[];
  created_at: string;
  patient?: Patient;
}

interface Doctor {
  id: string;
  name: string;
  maxPatientsPerDay: number;
  workDays: number[]; // 1=Пн, 2=Вт, 3=Ср, 4=Чт, 5=Пт, 6=Сб, 7=Вс
}

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DAY_NAMES_FULL = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function formatDate(dateStr: string): string {
  if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr)) return dateStr;
  const [y, m, d] = dateStr.split("-");
  return `${d}.${m}.${y}`;
}

function toApiDate(dateStr: string): string {
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const [d, m, y] = dateStr.split(".");
  return `${y}-${m}-${d}`;
}

function calculateAge(dateOfBirth: string): string {
  const birth = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return `${age} ${getAgeWord(age)}`;
}

function getAgeWord(age: number): string {
  if (age % 10 === 1 && age % 100 !== 11) return "год";
  if (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20)) return "года";
  return "лет";
}

function capitalizeFirstLetter(val: string): string {
  if (!val) return val;
  return val.charAt(0).toUpperCase() + val.slice(1);
}

const btnClass =
  "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";

const DEPARTMENT_KEY = "registry_department";

function getDepartment(): string {
  return localStorage.getItem(DEPARTMENT_KEY) || "Регистратура";
}

function setDepartment(name: string) {
  localStorage.setItem(DEPARTMENT_KEY, name);
}

function getDayOfWeek(dateStr: string): number {
  const [d, m, y] = dateStr.split(".");
  const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return date.getDay() === 0 ? 7 : date.getDay(); // Пн=1, Вс=7
}

function getDoctorsForDate(dateStr: string, doctors: Doctor[]): Doctor[] {
  const dayOfWeek = getDayOfWeek(dateStr);
  return doctors.filter((d) => d.workDays.includes(dayOfWeek));
}

export default function App() {
  const today = new Date();
  const dd = String(today.getDate()).padStart(2, "0");
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const yyyy = today.getFullYear();
  const [date, setDate] = useState(`${dd}.${mm}.${yyyy}`);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  // Форма
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [showSettings, setShowSettings] = useState(false);
  const [departmentInput, setDepartmentInput] = useState(getDepartment());
  const [settingsTab, setSettingsTab] = useState<"department" | "doctors">("department");

  // Врачи
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());

  // Форма врача
  const [showDoctorForm, setShowDoctorForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [doctorName, setDoctorName] = useState("");
  const [doctorMaxPatients, setDoctorMaxPatients] = useState("15");
  const [doctorWorkDays, setDoctorWorkDays] = useState<number[]>([1, 2, 3, 4, 5]);

  const fetchDoctors = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3456/api/doctors");
      if (res.ok) {
        const data = await res.json();
        // Преобразуем из формата БД в формат Doctor
        const mapped: Doctor[] = data.map((d: any) => ({
          id: String(d.id),
          name: d.name,
          maxPatientsPerDay: d.max_patients_per_day,
          workDays: JSON.parse(d.work_days || "[1,2,3,4,5]"),
        }));
        setDoctors(mapped);
      }
    } catch {
      // Сервер может быть не запущен
    }
  }, []);

  const fetchAppointments = useCallback(async () => {
    try {
      const apiDate = toApiDate(date);
      const res = await fetch(`http://localhost:3456/api/appointments?date=${apiDate}`);
      if (res.ok) {
        const data = await res.json();
        setAppointments(data);
      }
    } catch {
      // Сервер может быть не запущен при разработке
    }
  }, [date]);

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, [fetchAppointments, fetchDoctors]);

  const openAddModal = () => {
    setEditingAppointment(null);
    setLastName("");
    setFirstName("");
    setMiddleName("");
    setDateOfBirth("");
    setSelectedStudies([]);
    setShowModal(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setLastName(appointment.patient?.last_name || "");
    setFirstName(appointment.patient?.first_name || "");
    setMiddleName(appointment.patient?.middle_name || "");
    setDateOfBirth(appointment.patient?.date_of_birth || "");
    setSelectedStudies(appointment.studies);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!lastName || !firstName || !dateOfBirth || selectedStudies.length === 0) return;

    try {
      if (editingAppointment) {
        await fetch(`http://localhost:3456/api/appointments/${editingAppointment.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lastName,
            firstName,
            middleName,
            dateOfBirth: toApiDate(dateOfBirth),
            studies: selectedStudies,
          }),
        });
      } else {
        await fetch("http://localhost:3456/api/appointments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lastName,
            firstName,
            middleName,
            dateOfBirth,
            appointmentDate: toApiDate(date),
            studies: selectedStudies,
            department: getDepartment(),
          }),
        });
      }

      setShowModal(false);
      fetchAppointments();
    } catch (err) {
      console.error("Failed to save appointment", err);
    }
  };

  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDelete = async (id: number) => {
    try {
      await fetch(`http://localhost:3456/api/appointments/${id}`, {
        method: "DELETE",
      });
      fetchAppointments();
    } catch (err) {
      console.error("Failed to delete appointment", err);
    }
  };

  const toggleStudy = (study: string) => {
    setSelectedStudies((prev) =>
      prev.includes(study) ? prev.filter((s) => s !== study) : [...prev, study]
    );
  };

  // Врачи
  const openAddDoctorForm = () => {
    setEditingDoctor(null);
    setDoctorName("");
    setDoctorMaxPatients("15");
    setDoctorWorkDays([1, 2, 3, 4, 5]);
    setShowDoctorForm(true);
  };

  const openEditDoctorForm = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setDoctorName(doctor.name);
    setDoctorMaxPatients(String(doctor.maxPatientsPerDay));
    setDoctorWorkDays([...doctor.workDays]);
    setShowDoctorForm(true);
  };

  const handleSaveDoctor = async () => {
    if (!doctorName.trim()) return;
    const maxPatients = parseInt(doctorMaxPatients) || 15;

    try {
      if (editingDoctor) {
        await fetch(`http://localhost:3456/api/doctors/${editingDoctor.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: doctorName.trim(),
            maxPatientsPerDay: maxPatients,
            workDays: doctorWorkDays,
          }),
        });
      } else {
        await fetch("http://localhost:3456/api/doctors", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: doctorName.trim(),
            maxPatientsPerDay: maxPatients,
            workDays: doctorWorkDays,
          }),
        });
      }

      setShowDoctorForm(false);
      fetchDoctors();
    } catch (err) {
      console.error("Failed to save doctor", err);
    }
  };

  const handleDeleteDoctor = async (id: string) => {
    try {
      await fetch(`http://localhost:3456/api/doctors/${id}`, {
        method: "DELETE",
      });
      if (selectedDoctorId === id) setSelectedDoctorId(null);
      fetchDoctors();
    } catch (err) {
      console.error("Failed to delete doctor", err);
    }
  };

  const toggleWorkDay = (day: number) => {
    setDoctorWorkDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  // Календарь
  const prevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear(calendarYear - 1);
    } else {
      setCalendarMonth(calendarMonth - 1);
    }
  };

  const nextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear(calendarYear + 1);
    } else {
      setCalendarMonth(calendarMonth + 1);
    }
  };

  const getDaysInMonth = (month: number, year: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number): number => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Пн=0, Вс=6
  };

  const getAppointmentsCountForDate = (dateStr: string): number => {
    return appointments.filter((a) => {
      const apiDate = toApiDate(dateStr);
      return a.appointment_date === apiDate;
    }).length;
  };

  // Получаем врачей, работающих в выбранную дату
  const todayDoctors = getDoctorsForDate(date, doctors);

  return (
    <div style={{ fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }} className="h-screen flex flex-col">
      {/* Шапка */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar size={24} className="text-medical-500" />
            <h1 className="text-xl font-semibold text-slate-800">Регистратура УЗИ</h1>
          </div>
          <div className="absolute left-1/2 -translate-x-1/2">
            <DatePickerField
              value={date}
              onChange={setDate}
              placeholder="дд.мм.гггг"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className={`${btnClass} bg-medical-500 text-white hover:bg-medical-600 flex items-center gap-2`}
            >
              <Plus size={16} />
              Добавить запись
            </button>
            <button
              onClick={() => {
                setDepartmentInput(getDepartment());
                setSettingsTab("department");
                setShowSettings(true);
              }}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
              title="Настройки"
            >
              <Settings size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <div className="flex-1 flex overflow-hidden">
        {/* Левая панель — врачи */}
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0">
          <div className="p-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">Врачи</h3>
            {doctors.length === 0 ? (
              <p className="text-xs text-slate-400">Врачи не добавлены</p>
            ) : (
              <div className="space-y-1">
                {doctors.map((doctor) => (
                  <button
                    key={doctor.id}
                    onClick={() => setSelectedDoctorId(doctor.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 ${
                      selectedDoctorId === doctor.id
                        ? "bg-medical-50 text-medical-700 font-medium border border-medical-200"
                        : "text-slate-600 hover:bg-slate-50 border border-transparent"
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
        </aside>

        {/* Центральная часть */}
        <main className="flex-1 overflow-y-auto p-6">
          {selectedDoctorId ? (
            (() => {
              const doctor = doctors.find((d) => d.id === selectedDoctorId);
              if (!doctor) return <p className="text-slate-400">Врач не найден</p>;

              const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
              const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);

              return (
                <div>
                  {/* Заголовок календаря */}
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-semibold text-slate-800">
                      {doctor.name}
                    </h2>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={prevMonth}
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="text-sm font-medium text-slate-700 min-w-[140px] text-center">
                        {MONTH_NAMES[calendarMonth]} {calendarYear}
                      </span>
                      <button
                        onClick={nextMonth}
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
                        <div key={name} className="text-center text-xs font-medium text-slate-400 py-1">
                          {name}
                        </div>
                      ))}
                    </div>

                    {/* Ячейки дней */}
                    <div className="grid grid-cols-7 gap-1">
                      {/* Пустые ячейки до первого дня месяца */}
                      {Array.from({ length: firstDay }).map((_, i) => (
                        <div key={`empty-${i}`} className="aspect-square" />
                      ))}

                      {/* Дни месяца */}
                      {Array.from({ length: daysInMonth }).map((_, i) => {
                        const day = i + 1;
                        const dateObj = new Date(calendarYear, calendarMonth, day);
                        const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
                        const isWorkDay = doctor.workDays.includes(dayOfWeek);
                        const dateStr = `${String(day).padStart(2, "0")}.${String(calendarMonth + 1).padStart(2, "0")}.${calendarYear}`;
                        const count = getAppointmentsCountForDate(dateStr);
                        const isFull = count >= doctor.maxPatientsPerDay;
                        const isToday = day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();

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
                            onClick={() => {
                              setDate(dateStr);
                            }}
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
                              {isFull ? "занято" : `${doctor.maxPatientsPerDay - count} мест`}
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
            })()
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <Calendar size={48} className="mb-4 opacity-50" />
              <p className="text-base font-medium">Выберите врача</p>
              <p className="text-sm mt-1">Нажмите на врача слева, чтобы увидеть календарь занятости</p>
            </div>
          )}
        </main>

        {/* Правая панель — записи на выбранную дату */}
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
                  <div
                    key={appt.id}
                    className="bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow duration-200 cursor-pointer"
                    onClick={() => openEditModal(appt)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {appt.patient?.last_name} {appt.patient?.first_name} {appt.patient?.middle_name}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {formatDate(appt.patient?.date_of_birth || "")}, {calculateAge(appt.patient?.date_of_birth || "")}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {appt.studies.map((study) => (
                            <span
                              key={study}
                              className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200"
                            >
                              {study}
                            </span>
                          ))}
                        </div>
                        {/* Показываем врачей, работающих в этот день */}
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
                          onClick={(e) => { e.stopPropagation(); openEditModal(appt); }}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                          title="Редактировать"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(appt.id); }}
                          className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all"
                          title="Удалить"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* Модалка добавления/редактирования */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            {/* Шапка */}
            <div className="mb-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50">
                  <svg className="h-4 w-4 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h2 className="text-sm font-semibold text-slate-800">
                  {editingAppointment ? "Редактирование пациента" : "Новый пациент"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
              {/* ФИО в одной строке */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Фамилия
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(capitalizeFirstLetter(e.target.value))}
                    required
                    className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Имя
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(capitalizeFirstLetter(e.target.value))}
                    required
                    className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                    Отчество
                  </label>
                  <input
                    type="text"
                    value={middleName}
                    onChange={(e) => setMiddleName(capitalizeFirstLetter(e.target.value))}
                    className="w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md"
                  />
                </div>
              </div>

              {/* Дата рождения — 1/3 ширины как поля ФИО */}
              <div className="w-1/3">
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Дата рождения
                </label>
                <DatePickerField
                  value={dateOfBirth}
                  onChange={setDateOfBirth}
                  placeholder="дд.мм.гггг"
                />
              </div>

              {/* Информация о врачах на сегодня */}
              {!editingAppointment && todayDoctors.length > 0 && (
                <div className="bg-sky-50 border border-sky-200 rounded-lg p-3">
                  <p className="text-xs font-medium text-sky-700 mb-1">Сегодня принимают:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {todayDoctors.map((doc) => {
                      const count = appointments.filter((a) => {
                        // Считаем записи на сегодня (без привязки к врачу, т.к. нет doctor_id)
                        return true;
                      }).length;
                      const isFull = count >= doc.maxPatientsPerDay;
                      return (
                        <span
                          key={doc.id}
                          className={`text-xs px-2 py-0.5 rounded-full border ${
                            isFull
                              ? "bg-amber-50 text-amber-600 border-amber-200"
                              : "bg-emerald-50 text-emerald-600 border-emerald-200"
                          }`}
                        >
                          {doc.name} {isFull ? "(занято)" : `(${doc.maxPatientsPerDay - count} мест`})
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Исследования */}
              <div>
                <label className="mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                  Исследования
                </label>
                <div className="grid grid-cols-2 gap-2 mt-1 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2">
                  {STUDIES_LIST.map((study) => (
                    <label
                      key={study}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                        selectedStudies.includes(study)
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "text-slate-600 hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStudies.includes(study)}
                        onChange={() => toggleStudy(study)}
                        className="sr-only"
                      />
                      {selectedStudies.includes(study) ? (
                        <Check size={14} className="text-emerald-600 shrink-0" />
                      ) : (
                        <div className="w-3.5 h-3.5 border-2 border-slate-300 rounded shrink-0" />
                      )}
                      {study}
                    </label>
                  ))}
                </div>
              </div>

              {/* Кнопки */}
              <div className="flex items-center justify-between gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (editingAppointment) {
                      setDeleteConfirmId(editingAppointment.id);
                      setShowModal(false);
                    }
                  }}
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Удалить
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    disabled={!lastName || !firstName || !dateOfBirth || selectedStudies.length === 0}
                    className="rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm ring-1 ring-sky-500/70 transition-all hover:-translate-y-[1px] hover:bg-sky-500 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {editingAppointment ? "Сохранить" : "Добавить"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Модалка настроек */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-semibold text-slate-800">Настройки</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={18} />
              </button>
            </div>

            {/* Вкладки */}
            <div className="flex gap-1 mb-4 border-b border-slate-200">
              <button
                onClick={() => setSettingsTab("department")}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 ${
                  settingsTab === "department"
                    ? "bg-medical-50 text-medical-700 border-b-2 border-medical-500"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
              >
                Отделение
              </button>
              <button
                onClick={() => setSettingsTab("doctors")}
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
                  onChange={(e) => setDepartmentInput(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200 mb-4"
                />
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                  >
                    Отмена
                  </button>
                  <button
                    onClick={() => {
                      setDepartment(departmentInput);
                      setShowSettings(false);
                    }}
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
                              <div className="text-sm font-medium text-slate-700 truncate">{doctor.name}</div>
                              <div className="text-xs text-slate-400">
                                до {doctor.maxPatientsPerDay} пациентов · {doctor.workDays.map((d) => DAY_NAMES[d - 1]).join(", ")}
                              </div>
                            </div>
                            <div className="flex items-center gap-1 ml-2 shrink-0">
                              <button
                                onClick={() => openEditDoctorForm(doctor)}
                                className="p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all"
                                title="Редактировать"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteDoctor(doctor.id)}
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
                      onClick={openAddDoctorForm}
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
                        <label className="block text-xs font-medium text-slate-500 mb-1">ФИО врача</label>
                        <input
                          type="text"
                          value={doctorName}
                          onChange={(e) => setDoctorName(e.target.value)}
                          placeholder="Иванов Иван Иванович"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Максимум пациентов в день</label>
                        <input
                          type="number"
                          value={doctorMaxPatients}
                          onChange={(e) => setDoctorMaxPatients(e.target.value)}
                          min="1"
                          max="100"
                          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-2">Дни приёма</label>
                        <div className="flex flex-wrap gap-2">
                          {DAY_NAMES_FULL.map((name, index) => {
                            const day = index + 1;
                            const isSelected = doctorWorkDays.includes(day);
                            return (
                              <button
                                key={day}
                                type="button"
                                onClick={() => toggleWorkDay(day)}
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
                        onClick={() => setShowDoctorForm(false)}
                        className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
                      >
                        Отмена
                      </button>
                      <button
                        onClick={handleSaveDoctor}
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
      )}

      {/* Модалка подтверждения удаления */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-base font-semibold text-slate-800 mb-2">Подтверждение удаления</h3>
            <p className="text-sm text-slate-600 mb-4">Вы уверены, что хотите удалить эту запись?</p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  handleDelete(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200"
              >
                Удалить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
