"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = App;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
const DatePickerField_1 = __importDefault(require("./components/DatePickerField"));
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
const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DAY_NAMES_FULL = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
const MONTH_NAMES = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
function formatDate(dateStr) {
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateStr))
        return dateStr;
    const [y, m, d] = dateStr.split("-");
    return `${d}.${m}.${y}`;
}
function toApiDate(dateStr) {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr))
        return dateStr;
    const [d, m, y] = dateStr.split(".");
    return `${y}-${m}-${d}`;
}
function calculateAge(dateOfBirth) {
    const birth = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return `${age} ${getAgeWord(age)}`;
}
function getAgeWord(age) {
    if (age % 10 === 1 && age % 100 !== 11)
        return "год";
    if (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20))
        return "года";
    return "лет";
}
function capitalizeFirstLetter(val) {
    if (!val)
        return val;
    return val.charAt(0).toUpperCase() + val.slice(1);
}
const btnClass = "px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
const DEPARTMENT_KEY = "registry_department";
function getDepartment() {
    return localStorage.getItem(DEPARTMENT_KEY) || "Регистратура";
}
function setDepartment(name) {
    localStorage.setItem(DEPARTMENT_KEY, name);
}
function getDayOfWeek(dateStr) {
    const [d, m, y] = dateStr.split(".");
    const date = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return date.getDay() === 0 ? 7 : date.getDay(); // Пн=1, Вс=7
}
function getDoctorsForDate(dateStr, doctors) {
    const dayOfWeek = getDayOfWeek(dateStr);
    return doctors.filter((d) => d.workDays.includes(dayOfWeek));
}
function App() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const yyyy = today.getFullYear();
    const [date, setDate] = (0, react_1.useState)(`${dd}.${mm}.${yyyy}`);
    const [appointments, setAppointments] = (0, react_1.useState)([]);
    const [showModal, setShowModal] = (0, react_1.useState)(false);
    const [editingAppointment, setEditingAppointment] = (0, react_1.useState)(null);
    // Форма
    const [lastName, setLastName] = (0, react_1.useState)("");
    const [firstName, setFirstName] = (0, react_1.useState)("");
    const [middleName, setMiddleName] = (0, react_1.useState)("");
    const [dateOfBirth, setDateOfBirth] = (0, react_1.useState)("");
    const [selectedStudies, setSelectedStudies] = (0, react_1.useState)([]);
    const [showSettings, setShowSettings] = (0, react_1.useState)(false);
    const [departmentInput, setDepartmentInput] = (0, react_1.useState)(getDepartment());
    const [settingsTab, setSettingsTab] = (0, react_1.useState)("department");
    // Врачи
    const [doctors, setDoctors] = (0, react_1.useState)([]);
    const [selectedDoctorId, setSelectedDoctorId] = (0, react_1.useState)(null);
    const [calendarMonth, setCalendarMonth] = (0, react_1.useState)(today.getMonth());
    const [calendarYear, setCalendarYear] = (0, react_1.useState)(today.getFullYear());
    const [monthAppointments, setMonthAppointments] = (0, react_1.useState)([]);
    // Форма врача
    const [showDoctorForm, setShowDoctorForm] = (0, react_1.useState)(false);
    const [editingDoctor, setEditingDoctor] = (0, react_1.useState)(null);
    const [doctorName, setDoctorName] = (0, react_1.useState)("");
    const [doctorMaxPatients, setDoctorMaxPatients] = (0, react_1.useState)("15");
    const [doctorWorkDays, setDoctorWorkDays] = (0, react_1.useState)([1, 2, 3, 4, 5]);
    const fetchDoctors = (0, react_1.useCallback)(async () => {
        try {
            const res = await fetch("http://localhost:3456/api/doctors");
            if (res.ok) {
                const data = await res.json();
                // Преобразуем из формата БД в формат Doctor
                const mapped = data.map((d) => ({
                    id: String(d.id),
                    name: d.name,
                    maxPatientsPerDay: d.max_patients_per_day,
                    workDays: JSON.parse(d.work_days || "[1,2,3,4,5]"),
                }));
                setDoctors(mapped);
            }
        }
        catch {
            // Сервер может быть не запущен
        }
    }, []);
    const fetchAppointments = (0, react_1.useCallback)(async () => {
        try {
            const apiDate = toApiDate(date);
            const res = await fetch(`http://localhost:3456/api/appointments?date=${apiDate}`);
            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            }
        }
        catch {
            // Сервер может быть не запущен при разработке
        }
    }, [date]);
    (0, react_1.useEffect)(() => {
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
    const openEditModal = (appointment) => {
        setEditingAppointment(appointment);
        setLastName(appointment.patient?.last_name || "");
        setFirstName(appointment.patient?.first_name || "");
        setMiddleName(appointment.patient?.middle_name || "");
        setDateOfBirth(appointment.patient?.date_of_birth || "");
        setSelectedStudies(appointment.studies);
        setShowModal(true);
    };
    const handleSave = async () => {
        if (!lastName || !firstName || !dateOfBirth || selectedStudies.length === 0)
            return;
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
            }
            else {
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
            if (selectedDoctorId) {
                fetchMonthAppointments(calendarMonth, calendarYear);
            }
        }
        catch (err) {
            console.error("Failed to save appointment", err);
        }
    };
    const [deleteConfirmId, setDeleteConfirmId] = (0, react_1.useState)(null);
    const handleDelete = async (id) => {
        try {
            await fetch(`http://localhost:3456/api/appointments/${id}`, {
                method: "DELETE",
            });
            fetchAppointments();
            if (selectedDoctorId) {
                fetchMonthAppointments(calendarMonth, calendarYear);
            }
        }
        catch (err) {
            console.error("Failed to delete appointment", err);
        }
    };
    const toggleStudy = (study) => {
        setSelectedStudies((prev) => prev.includes(study) ? prev.filter((s) => s !== study) : [...prev, study]);
    };
    // Врачи
    const openAddDoctorForm = () => {
        setEditingDoctor(null);
        setDoctorName("");
        setDoctorMaxPatients("15");
        setDoctorWorkDays([1, 2, 3, 4, 5]);
        setShowDoctorForm(true);
    };
    const openEditDoctorForm = (doctor) => {
        setEditingDoctor(doctor);
        setDoctorName(doctor.name);
        setDoctorMaxPatients(String(doctor.maxPatientsPerDay));
        setDoctorWorkDays([...doctor.workDays]);
        setShowDoctorForm(true);
    };
    const handleSaveDoctor = async () => {
        if (!doctorName.trim())
            return;
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
            }
            else {
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
        }
        catch (err) {
            console.error("Failed to save doctor", err);
        }
    };
    const handleDeleteDoctor = async (id) => {
        try {
            await fetch(`http://localhost:3456/api/doctors/${id}`, {
                method: "DELETE",
            });
            if (selectedDoctorId === id)
                setSelectedDoctorId(null);
            fetchDoctors();
        }
        catch (err) {
            console.error("Failed to delete doctor", err);
        }
    };
    const toggleWorkDay = (day) => {
        setDoctorWorkDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort());
    };
    // Календарь
    const prevMonth = () => {
        if (calendarMonth === 0) {
            setCalendarMonth(11);
            setCalendarYear(calendarYear - 1);
        }
        else {
            setCalendarMonth(calendarMonth - 1);
        }
    };
    const nextMonth = () => {
        if (calendarMonth === 11) {
            setCalendarMonth(0);
            setCalendarYear(calendarYear + 1);
        }
        else {
            setCalendarMonth(calendarMonth + 1);
        }
    };
    const getDaysInMonth = (month, year) => {
        return new Date(year, month + 1, 0).getDate();
    };
    const getFirstDayOfMonth = (month, year) => {
        const day = new Date(year, month, 1).getDay();
        return day === 0 ? 6 : day - 1; // Пн=0, Вс=6
    };
    // Загружаем записи на весь месяц для календаря
    const fetchMonthAppointments = (0, react_1.useCallback)(async (month, year) => {
        const daysInMonth = getDaysInMonth(month, year);
        const allAppointments = [];
        // Загружаем каждый день месяца (можно оптимизировать через API с диапазоном дат)
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${String(day).padStart(2, "0")}.${String(month + 1).padStart(2, "0")}.${year}`;
            try {
                const apiDate = toApiDate(dateStr);
                const res = await fetch(`http://localhost:3456/api/appointments?date=${apiDate}`);
                if (res.ok) {
                    const data = await res.json();
                    allAppointments.push(...data);
                }
            }
            catch {
                // ignore
            }
        }
        setMonthAppointments(allAppointments);
    }, []);
    // Загружаем записи месяца при выборе врача или смене месяца
    (0, react_1.useEffect)(() => {
        if (selectedDoctorId) {
            fetchMonthAppointments(calendarMonth, calendarYear);
        }
    }, [selectedDoctorId, calendarMonth, calendarYear, fetchMonthAppointments]);
    const getAppointmentsCountForDate = (dateStr) => {
        return monthAppointments.filter((a) => {
            const apiDate = toApiDate(dateStr);
            return a.appointment_date === apiDate;
        }).length;
    };
    // Получаем врачей, работающих в выбранную дату
    const todayDoctors = getDoctorsForDate(date, doctors);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif" }, className: "h-screen flex flex-col", children: [(0, jsx_runtime_1.jsx)("header", { className: "bg-white border-b border-slate-200 px-6 py-4 shrink-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "max-w-7xl mx-auto flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-3", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { size: 24, className: "text-medical-500" }), (0, jsx_runtime_1.jsx)("h1", { className: "text-xl font-semibold text-slate-800", children: "\u0420\u0435\u0433\u0438\u0441\u0442\u0440\u0430\u0442\u0443\u0440\u0430 \u0423\u0417\u0418" })] }), (0, jsx_runtime_1.jsx)("div", { className: "absolute left-1/2 -translate-x-1/2", children: (0, jsx_runtime_1.jsx)(DatePickerField_1.default, { value: date, onChange: setDate, placeholder: "\u0434\u0434.\u043C\u043C.\u0433\u0433\u0433\u0433" }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: openAddModal, className: `${btnClass} bg-medical-500 text-white hover:bg-medical-600 flex items-center gap-2 cursor-pointer`, children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0437\u0430\u043F\u0438\u0441\u044C"] }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                        setDepartmentInput(getDepartment());
                                        setSettingsTab("department");
                                        setShowSettings(true);
                                    }, className: "p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200 cursor-pointer", title: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Settings, { size: 18 }) })] })] }) }), (0, jsx_runtime_1.jsxs)("div", { className: "flex-1 flex overflow-hidden", children: [(0, jsx_runtime_1.jsx)("aside", { className: "w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3", children: "\u0412\u0440\u0430\u0447\u0438" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-1", children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setSelectedDoctorId("__all__"), className: `w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${selectedDoctorId === "__all__"
                                                ? "bg-medical-50 text-medical-700 font-medium border border-medical-200"
                                                : "text-slate-600 hover:bg-slate-50 border border-transparent"}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium", children: "\u0412\u0441\u0435 \u0432\u0440\u0430\u0447\u0438" }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-slate-400 mt-0.5", children: [doctors.length, " \u0432\u0440\u0430\u0447\u0435\u0439"] })] }), doctors.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-400 pt-2", children: "\u0412\u0440\u0430\u0447\u0438 \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B" })) : (doctors.map((doctor) => ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setSelectedDoctorId(doctor.id), className: `w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all duration-200 cursor-pointer ${selectedDoctorId === doctor.id
                                                ? "bg-medical-50 text-medical-700 font-medium border border-medical-200"
                                                : "text-slate-600 hover:bg-slate-50 border border-transparent"}`, children: [(0, jsx_runtime_1.jsx)("div", { className: "font-medium truncate", children: doctor.name }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-slate-400 mt-0.5", children: ["\u0434\u043E ", doctor.maxPatientsPerDay, " \u043F\u0430\u0446\u0438\u0435\u043D\u0442\u043E\u0432"] }), (0, jsx_runtime_1.jsx)("div", { className: "text-xs text-slate-400", children: doctor.workDays.map((d) => DAY_NAMES[d - 1]).join(", ") })] }, doctor.id))))] })] }) }), (0, jsx_runtime_1.jsx)("main", { className: "flex-1 overflow-y-auto p-6", children: selectedDoctorId === "__all__" ? ((() => {
                            const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
                            const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
                            return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-slate-800", children: "\u0412\u0441\u0435 \u0432\u0440\u0430\u0447\u0438" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: prevMonth, className: "p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 18 }) }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm font-medium text-slate-700 min-w-[140px] text-center", children: [MONTH_NAMES[calendarMonth], " ", calendarYear] }), (0, jsx_runtime_1.jsx)("button", { onClick: nextMonth, className: "p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 18 }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-slate-200 rounded-xl p-4 mb-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-7 gap-1 mb-2", children: DAY_NAMES.map((name) => ((0, jsx_runtime_1.jsx)("div", { className: "text-center text-xs font-medium text-slate-400 py-1", children: name }, name))) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-7 gap-1", children: [Array.from({ length: firstDay }).map((_, i) => ((0, jsx_runtime_1.jsx)("div", { className: "aspect-square" }, `empty-${i}`))), Array.from({ length: daysInMonth }).map((_, i) => {
                                                        const day = i + 1;
                                                        const dateObj = new Date(calendarYear, calendarMonth, day);
                                                        const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
                                                        const dateStr = `${String(day).padStart(2, "0")}.${String(calendarMonth + 1).padStart(2, "0")}.${calendarYear}`;
                                                        const count = getAppointmentsCountForDate(dateStr);
                                                        const isToday = day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();
                                                        const isSelected = dateStr === date;
                                                        // Считаем сколько врачей работает в этот день
                                                        const workingDoctors = doctors.filter((d) => d.workDays.includes(dayOfWeek));
                                                        const totalCapacity = workingDoctors.reduce((sum, d) => sum + d.maxPatientsPerDay, 0);
                                                        const isFull = totalCapacity > 0 && count >= totalCapacity;
                                                        const hasDoctors = workingDoctors.length > 0;
                                                        if (!hasDoctors) {
                                                            return ((0, jsx_runtime_1.jsx)("div", { className: "aspect-square flex items-center justify-center rounded-lg bg-slate-50", children: (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-slate-300", children: day }) }, day));
                                                        }
                                                        return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => setDate(dateStr), className: `aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-200 border cursor-pointer ${isToday
                                                                ? "border-medical-400 ring-2 ring-medical-100"
                                                                : "border-transparent"} ${isFull
                                                                ? isSelected
                                                                    ? "bg-slate-300 text-slate-600 hover:bg-slate-400"
                                                                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                                : isSelected
                                                                    ? "bg-emerald-200 text-emerald-800 hover:bg-emerald-300"
                                                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: day }), (0, jsx_runtime_1.jsx)("span", { className: "text-[10px] leading-none mt-0.5", children: isFull ? "занято" : `${totalCapacity - count} мест` })] }, day));
                                                    })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 text-xs text-slate-500 mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded bg-emerald-50 border border-emerald-200" }), (0, jsx_runtime_1.jsx)("span", { children: "\u0415\u0441\u0442\u044C \u043C\u0435\u0441\u0442\u0430" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded bg-slate-100 border border-slate-200" }), (0, jsx_runtime_1.jsx)("span", { children: "\u041D\u0435\u0442 \u043C\u0435\u0441\u0442" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded bg-slate-50" }), (0, jsx_runtime_1.jsx)("span", { children: "\u0412\u044B\u0445\u043E\u0434\u043D\u043E\u0439" })] })] })] }));
                        })()) : selectedDoctorId ? ((() => {
                            const doctor = doctors.find((d) => d.id === selectedDoctorId);
                            if (!doctor)
                                return (0, jsx_runtime_1.jsx)("p", { className: "text-slate-400", children: "\u0412\u0440\u0430\u0447 \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D" });
                            const daysInMonth = getDaysInMonth(calendarMonth, calendarYear);
                            const firstDay = getFirstDayOfMonth(calendarMonth, calendarYear);
                            return ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-6", children: [(0, jsx_runtime_1.jsx)("h2", { className: "text-lg font-semibold text-slate-800", children: doctor.name }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("button", { onClick: prevMonth, className: "p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronLeft, { size: 18 }) }), (0, jsx_runtime_1.jsxs)("span", { className: "text-sm font-medium text-slate-700 min-w-[140px] text-center", children: [MONTH_NAMES[calendarMonth], " ", calendarYear] }), (0, jsx_runtime_1.jsx)("button", { onClick: nextMonth, className: "p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all cursor-pointer", children: (0, jsx_runtime_1.jsx)(lucide_react_1.ChevronRight, { size: 18 }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "bg-white border border-slate-200 rounded-xl p-4 mb-6", children: [(0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-7 gap-1 mb-2", children: DAY_NAMES.map((name) => ((0, jsx_runtime_1.jsx)("div", { className: "text-center text-xs font-medium text-slate-400 py-1", children: name }, name))) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-7 gap-1", children: [Array.from({ length: firstDay }).map((_, i) => ((0, jsx_runtime_1.jsx)("div", { className: "aspect-square" }, `empty-${i}`))), Array.from({ length: daysInMonth }).map((_, i) => {
                                                        const day = i + 1;
                                                        const dateObj = new Date(calendarYear, calendarMonth, day);
                                                        const dayOfWeek = dateObj.getDay() === 0 ? 7 : dateObj.getDay();
                                                        const isWorkDay = doctor.workDays.includes(dayOfWeek);
                                                        const dateStr = `${String(day).padStart(2, "0")}.${String(calendarMonth + 1).padStart(2, "0")}.${calendarYear}`;
                                                        const count = getAppointmentsCountForDate(dateStr);
                                                        const isFull = count >= doctor.maxPatientsPerDay;
                                                        const isToday = day === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear();
                                                        const isSelected = dateStr === date;
                                                        if (!isWorkDay) {
                                                            return ((0, jsx_runtime_1.jsx)("div", { className: "aspect-square flex items-center justify-center rounded-lg bg-slate-50", children: (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-slate-300", children: day }) }, day));
                                                        }
                                                        return ((0, jsx_runtime_1.jsxs)("button", { onClick: () => {
                                                                setDate(dateStr);
                                                            }, className: `aspect-square flex flex-col items-center justify-center rounded-lg transition-all duration-200 border cursor-pointer ${isToday
                                                                ? "border-medical-400 ring-2 ring-medical-100"
                                                                : "border-transparent"} ${isFull
                                                                ? isSelected
                                                                    ? "bg-slate-300 text-slate-600 hover:bg-slate-400"
                                                                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                                                                : isSelected
                                                                    ? "bg-emerald-200 text-emerald-800 hover:bg-emerald-300"
                                                                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"}`, children: [(0, jsx_runtime_1.jsx)("span", { className: "text-sm font-medium", children: day }), (0, jsx_runtime_1.jsx)("span", { className: "text-[10px] leading-none mt-0.5", children: isFull ? "занято" : `${doctor.maxPatientsPerDay - count} мест` })] }, day));
                                                    })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-4 text-xs text-slate-500 mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded bg-emerald-50 border border-emerald-200" }), (0, jsx_runtime_1.jsx)("span", { children: "\u0415\u0441\u0442\u044C \u043C\u0435\u0441\u0442\u0430" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded bg-slate-100 border border-slate-200" }), (0, jsx_runtime_1.jsx)("span", { children: "\u041D\u0435\u0442 \u043C\u0435\u0441\u0442" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1.5", children: [(0, jsx_runtime_1.jsx)("div", { className: "w-3 h-3 rounded bg-slate-50" }), (0, jsx_runtime_1.jsx)("span", { children: "\u0412\u044B\u0445\u043E\u0434\u043D\u043E\u0439" })] })] })] }));
                        })()) : ((0, jsx_runtime_1.jsxs)("div", { className: "flex flex-col items-center justify-center h-full text-slate-400", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Calendar, { size: 48, className: "mb-4 opacity-50" }), (0, jsx_runtime_1.jsx)("p", { className: "text-base font-medium", children: "\u0412\u044B\u0431\u0435\u0440\u0438\u0442\u0435 \u0432\u0440\u0430\u0447\u0430" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm mt-1", children: "\u041D\u0430\u0436\u043C\u0438\u0442\u0435 \u043D\u0430 \u0432\u0440\u0430\u0447\u0430 \u0441\u043B\u0435\u0432\u0430, \u0447\u0442\u043E\u0431\u044B \u0443\u0432\u0438\u0434\u0435\u0442\u044C \u043A\u0430\u043B\u0435\u043D\u0434\u0430\u0440\u044C \u0437\u0430\u043D\u044F\u0442\u043E\u0441\u0442\u0438" })] })) }), (0, jsx_runtime_1.jsx)("aside", { className: "w-[480px] bg-white border-l border-slate-200 overflow-y-auto shrink-0", children: (0, jsx_runtime_1.jsxs)("div", { className: "p-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsxs)("h3", { className: "text-sm font-semibold text-slate-500 uppercase tracking-wider", children: ["\u0417\u0430\u043F\u0438\u0441\u0438 \u043D\u0430 ", formatDate(date)] }), (0, jsx_runtime_1.jsx)("span", { className: "text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full", children: appointments.length })] }), appointments.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-xs text-slate-400", children: "\u041D\u0435\u0442 \u0437\u0430\u043F\u0438\u0441\u0435\u0439" })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2", children: appointments.map((appt) => ((0, jsx_runtime_1.jsx)("div", { className: "bg-white border border-slate-200 rounded-xl p-3 hover:shadow-sm transition-shadow duration-200 cursor-pointer", onClick: () => openEditModal(appt), children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsxs)("p", { className: "text-sm font-medium text-slate-800 truncate", children: [appt.patient?.last_name, " ", appt.patient?.first_name, " ", appt.patient?.middle_name] }), (0, jsx_runtime_1.jsxs)("p", { className: "text-xs text-slate-400 mt-0.5", children: [formatDate(appt.patient?.date_of_birth || ""), ", ", calculateAge(appt.patient?.date_of_birth || "")] }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-1 mt-1.5", children: appt.studies.map((study) => ((0, jsx_runtime_1.jsx)("span", { className: "text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-full border border-emerald-200", children: study }, study))) }), todayDoctors.length > 0 && ((0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-1 mt-1.5", children: todayDoctors.map((doc) => ((0, jsx_runtime_1.jsxs)("span", { className: "text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded-full border border-sky-200", children: ["\uD83C\uDFE5 ", doc.name] }, doc.id))) }))] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-0.5 ml-2 shrink-0", children: [(0, jsx_runtime_1.jsx)("button", { onClick: (e) => { e.stopPropagation(); openEditModal(appt); }, className: "p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer", title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Pencil, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: (e) => { e.stopPropagation(); setDeleteConfirmId(appt.id); }, className: "p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }) }, appt.id))) }))] }) })] }), showModal && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/30", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-4 w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-5 flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-2", children: [(0, jsx_runtime_1.jsx)("div", { className: "flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50", children: (0, jsx_runtime_1.jsx)("svg", { className: "h-4 w-4 text-sky-600", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" }) }) }), (0, jsx_runtime_1.jsx)("h2", { className: "text-sm font-semibold text-slate-800", children: editingAppointment ? "Редактирование пациента" : "Новый пациент" })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowModal(false), className: "rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer", children: (0, jsx_runtime_1.jsx)("svg", { className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M6 18L18 6M6 6l12 12" }) }) })] }), (0, jsx_runtime_1.jsxs)("form", { onSubmit: (e) => { e.preventDefault(); handleSave(); }, className: "space-y-4", children: [(0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-3 gap-3", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400", children: "\u0424\u0430\u043C\u0438\u043B\u0438\u044F" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: lastName, onChange: (e) => setLastName(capitalizeFirstLetter(e.target.value)), required: true, className: "w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400", children: "\u0418\u043C\u044F" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: firstName, onChange: (e) => setFirstName(capitalizeFirstLetter(e.target.value)), required: true, className: "w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400", children: "\u041E\u0442\u0447\u0435\u0441\u0442\u0432\u043E" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: middleName, onChange: (e) => setMiddleName(capitalizeFirstLetter(e.target.value)), className: "w-full border-0 border-b-2 border-slate-200 bg-transparent px-3 py-2 text-sm text-slate-800 outline-none transition-all focus:border-sky-400 focus:bg-sky-50/30 focus:ring-0 rounded-t-md" })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "w-1/3", children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400", children: "\u0414\u0430\u0442\u0430 \u0440\u043E\u0436\u0434\u0435\u043D\u0438\u044F" }), (0, jsx_runtime_1.jsx)(DatePickerField_1.default, { value: dateOfBirth, onChange: setDateOfBirth, placeholder: "\u0434\u0434.\u043C\u043C.\u0433\u0433\u0433\u0433" })] }), !editingAppointment && todayDoctors.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bg-sky-50 border border-sky-200 rounded-lg p-3", children: [(0, jsx_runtime_1.jsx)("p", { className: "text-xs font-medium text-sky-700 mb-1", children: "\u0421\u0435\u0433\u043E\u0434\u043D\u044F \u043F\u0440\u0438\u043D\u0438\u043C\u0430\u044E\u0442:" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-1.5", children: todayDoctors.map((doc) => {
                                                const count = appointments.filter((a) => {
                                                    // Считаем записи на сегодня (без привязки к врачу, т.к. нет doctor_id)
                                                    return true;
                                                }).length;
                                                const isFull = count >= doc.maxPatientsPerDay;
                                                return ((0, jsx_runtime_1.jsxs)("span", { className: `text-xs px-2 py-0.5 rounded-full border ${isFull
                                                        ? "bg-amber-50 text-amber-600 border-amber-200"
                                                        : "bg-emerald-50 text-emerald-600 border-emerald-200"}`, children: [doc.name, " ", isFull ? "(занято)" : `(${doc.maxPatientsPerDay - count} мест`, ")"] }, doc.id));
                                            }) })] })), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "mb-1 block text-[10px] font-semibold uppercase tracking-widest text-slate-400", children: "\u0418\u0441\u0441\u043B\u0435\u0434\u043E\u0432\u0430\u043D\u0438\u044F" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 gap-2 mt-1 max-h-64 overflow-y-auto border border-slate-200 rounded-lg p-2", children: STUDIES_LIST.map((study) => ((0, jsx_runtime_1.jsxs)("label", { className: `flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 text-sm ${selectedStudies.includes(study)
                                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                                    : "text-slate-600 hover:bg-slate-50 border border-transparent"}`, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: selectedStudies.includes(study), onChange: () => toggleStudy(study), className: "sr-only" }), selectedStudies.includes(study) ? ((0, jsx_runtime_1.jsx)(lucide_react_1.Check, { size: 14, className: "text-emerald-600 shrink-0" })) : ((0, jsx_runtime_1.jsx)("div", { className: "w-3.5 h-3.5 border-2 border-slate-300 rounded shrink-0" })), study] }, study))) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between gap-2 pt-2", children: [(0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: () => {
                                                if (editingAppointment) {
                                                    setDeleteConfirmId(editingAppointment.id);
                                                    setShowModal(false);
                                                }
                                            }, className: "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-red-600 transition-all hover:bg-red-50 cursor-pointer", children: [(0, jsx_runtime_1.jsx)("svg", { className: "h-3.5 w-3.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" }) }), "\u0423\u0434\u0430\u043B\u0438\u0442\u044C"] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-2", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setShowModal(false), className: "rounded-full border border-slate-300 bg-white px-4 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 cursor-pointer", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), (0, jsx_runtime_1.jsx)("button", { type: "submit", disabled: !lastName || !firstName || !dateOfBirth || selectedStudies.length === 0, className: "rounded-full bg-sky-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm ring-1 ring-sky-500/70 transition-all hover:-translate-y-[1px] hover:bg-sky-500 hover:shadow-md active:translate-y-0 active:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 cursor-pointer", children: editingAppointment ? "Сохранить" : "Добавить" })] })] })] })] }) })), showSettings && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/30", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-4 w-full max-w-md rounded-2xl bg-white p-6 shadow-xl", children: [(0, jsx_runtime_1.jsxs)("div", { className: "mb-4 flex items-center justify-between", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-base font-semibold text-slate-800", children: "\u041D\u0430\u0441\u0442\u0440\u043E\u0439\u043A\u0438" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowSettings(false), className: "rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer", children: (0, jsx_runtime_1.jsx)(lucide_react_1.X, { size: 18 }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex gap-1 mb-4 border-b border-slate-200", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setSettingsTab("department"), className: `px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 cursor-pointer ${settingsTab === "department"
                                        ? "bg-medical-50 text-medical-700 border-b-2 border-medical-500"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`, children: "\u041E\u0442\u0434\u0435\u043B\u0435\u043D\u0438\u0435" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setSettingsTab("doctors"), className: `px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 cursor-pointer ${settingsTab === "doctors"
                                        ? "bg-medical-50 text-medical-700 border-b-2 border-medical-500"
                                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`, children: "\u0412\u0440\u0430\u0447\u0438" })] }), settingsTab === "department" && ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-sm font-medium text-slate-600 mb-1", children: "\u041D\u0430\u0437\u0432\u0430\u043D\u0438\u0435 \u043E\u0442\u0434\u0435\u043B\u0435\u043D\u0438\u044F" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: departmentInput, onChange: (e) => setDepartmentInput(e.target.value), className: "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200 mb-4" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-end gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setShowSettings(false), className: "px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200 cursor-pointer", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                                setDepartment(departmentInput);
                                                setShowSettings(false);
                                            }, className: "px-4 py-2 text-sm font-medium text-white bg-medical-500 hover:bg-medical-600 rounded-lg transition-all duration-200 cursor-pointer", children: "\u0421\u043E\u0445\u0440\u0430\u043D\u0438\u0442\u044C" })] })] })), settingsTab === "doctors" && ((0, jsx_runtime_1.jsx)("div", { children: !showDoctorForm ? ((0, jsx_runtime_1.jsxs)("div", { children: [doctors.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-400 mb-4", children: "\u0412\u0440\u0430\u0447\u0438 \u043D\u0435 \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D\u044B" })) : ((0, jsx_runtime_1.jsx)("div", { className: "space-y-2 mb-4", children: doctors.map((doctor) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between bg-slate-50 border border-slate-200 rounded-lg px-3 py-2", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex-1 min-w-0", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-sm font-medium text-slate-700 truncate", children: doctor.name }), (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-slate-400", children: ["\u0434\u043E ", doctor.maxPatientsPerDay, " \u043F\u0430\u0446\u0438\u0435\u043D\u0442\u043E\u0432 \u00B7 ", doctor.workDays.map((d) => DAY_NAMES[d - 1]).join(", ")] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center gap-1 ml-2 shrink-0", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => openEditDoctorForm(doctor), className: "p-1 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-all cursor-pointer", title: "\u0420\u0435\u0434\u0430\u043A\u0442\u0438\u0440\u043E\u0432\u0430\u0442\u044C", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Pencil, { size: 14 }) }), (0, jsx_runtime_1.jsx)("button", { onClick: () => handleDeleteDoctor(doctor.id), className: "p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-all cursor-pointer", title: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C", children: (0, jsx_runtime_1.jsx)(lucide_react_1.Trash2, { size: 14 }) })] })] }, doctor.id))) })), (0, jsx_runtime_1.jsxs)("button", { onClick: openAddDoctorForm, className: "w-full px-4 py-2 text-sm font-medium text-medical-600 bg-medical-50 hover:bg-medical-100 border border-medical-200 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer", children: [(0, jsx_runtime_1.jsx)(lucide_react_1.Plus, { size: 16 }), "\u0414\u043E\u0431\u0430\u0432\u0438\u0442\u044C \u0432\u0440\u0430\u0447\u0430"] })] })) : ((0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-sm font-medium text-slate-700 mb-3", children: editingDoctor ? "Редактировать врача" : "Новый врач" }), (0, jsx_runtime_1.jsxs)("div", { className: "space-y-3 mb-4", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-medium text-slate-500 mb-1", children: "\u0424\u0418\u041E \u0432\u0440\u0430\u0447\u0430" }), (0, jsx_runtime_1.jsx)("input", { type: "text", value: doctorName, onChange: (e) => setDoctorName(e.target.value), placeholder: "\u0418\u0432\u0430\u043D\u043E\u0432 \u0418\u0432\u0430\u043D \u0418\u0432\u0430\u043D\u043E\u0432\u0438\u0447", className: "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-medium text-slate-500 mb-1", children: "\u041C\u0430\u043A\u0441\u0438\u043C\u0443\u043C \u043F\u0430\u0446\u0438\u0435\u043D\u0442\u043E\u0432 \u0432 \u0434\u0435\u043D\u044C" }), (0, jsx_runtime_1.jsx)("input", { type: "number", value: doctorMaxPatients, onChange: (e) => setDoctorMaxPatients(e.target.value), min: "1", max: "100", className: "w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-medical-300 focus:border-medical-400 transition-all duration-200" })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("label", { className: "block text-xs font-medium text-slate-500 mb-2", children: "\u0414\u043D\u0438 \u043F\u0440\u0438\u0451\u043C\u0430" }), (0, jsx_runtime_1.jsx)("div", { className: "flex flex-wrap gap-2", children: DAY_NAMES_FULL.map((name, index) => {
                                                            const day = index + 1;
                                                            const isSelected = doctorWorkDays.includes(day);
                                                            return ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => toggleWorkDay(day), className: `px-3 py-1.5 text-xs font-medium rounded-lg border transition-all duration-200 cursor-pointer ${isSelected
                                                                    ? "bg-medical-50 text-medical-700 border-medical-300"
                                                                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"}`, children: name }, day));
                                                        }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-end gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setShowDoctorForm(false), className: "px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), (0, jsx_runtime_1.jsx)("button", { onClick: handleSaveDoctor, disabled: !doctorName.trim(), className: "px-4 py-2 text-sm font-medium text-white bg-medical-500 hover:bg-medical-600 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed", children: editingDoctor ? "Сохранить" : "Добавить" })] })] })) }))] }) })), deleteConfirmId !== null && ((0, jsx_runtime_1.jsx)("div", { className: "fixed inset-0 z-50 flex items-center justify-center bg-black/30", children: (0, jsx_runtime_1.jsxs)("div", { className: "mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl", children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-base font-semibold text-slate-800 mb-2", children: "\u041F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u0435 \u0443\u0434\u0430\u043B\u0435\u043D\u0438\u044F" }), (0, jsx_runtime_1.jsx)("p", { className: "text-sm text-slate-600 mb-4", children: "\u0412\u044B \u0443\u0432\u0435\u0440\u0435\u043D\u044B, \u0447\u0442\u043E \u0445\u043E\u0442\u0438\u0442\u0435 \u0443\u0434\u0430\u043B\u0438\u0442\u044C \u044D\u0442\u0443 \u0437\u0430\u043F\u0438\u0441\u044C?" }), (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-end gap-3", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => setDeleteConfirmId(null), className: "px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200 cursor-pointer", children: "\u041E\u0442\u043C\u0435\u043D\u0430" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => {
                                        handleDelete(deleteConfirmId);
                                        setDeleteConfirmId(null);
                                    }, className: "px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-all duration-200 cursor-pointer", children: "\u0423\u0434\u0430\u043B\u0438\u0442\u044C" })] })] }) }))] }));
}
//# sourceMappingURL=App.js.map