"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatePickerField = void 0;
exports.parseDate = parseDate;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const MONTHS = [
    "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
    "Июль", "Август", "Сентябрь", "Окторябрь", "Ноябрь", "Декабрь",
];
const DAYS_OF_WEEK = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
/** Парсит дату из формата "дд.мм.гггг" или "гггг-мм-дд" */
function parseDate(value) {
    if (!value)
        return null;
    // "дд.мм.гггг"
    const dotMatch = value.match(/^(\d{2})\.(\d{2})\.(\d{4})$/);
    if (dotMatch) {
        return new Date(+dotMatch[3], +dotMatch[2] - 1, +dotMatch[1]);
    }
    // "гггг-мм-дд"
    const dashMatch = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (dashMatch) {
        return new Date(+dashMatch[1], +dashMatch[2] - 1, +dashMatch[3]);
    }
    return null;
}
const DatePickerField = ({ value, onChange, placeholder }) => {
    const [isOpen, setIsOpen] = (0, react_1.useState)(false);
    const [view, setView] = (0, react_1.useState)("days");
    const [viewDate, setViewDate] = (0, react_1.useState)(() => {
        const d = parseDate(value) ?? new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const ref = (0, react_1.useRef)(null);
    // Закрытие по клику вне компонента
    (0, react_1.useEffect)(() => {
        if (!isOpen)
            return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [isOpen]);
    const selectedDate = parseDate(value);
    const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();
    const firstDayOfWeek = (new Date(viewDate.getFullYear(), viewDate.getMonth(), 1).getDay() + 6) % 7; // Пн = 0
    const handlePrev = () => {
        if (view === "days") {
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
        }
        else if (view === "months") {
            setViewDate(new Date(viewDate.getFullYear() - 1, viewDate.getMonth(), 1));
        }
        else {
            setViewDate(new Date(viewDate.getFullYear() - 12, viewDate.getMonth(), 1));
        }
    };
    const handleNext = () => {
        if (view === "days") {
            setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
        }
        else if (view === "months") {
            setViewDate(new Date(viewDate.getFullYear() + 1, viewDate.getMonth(), 1));
        }
        else {
            setViewDate(new Date(viewDate.getFullYear() + 12, viewDate.getMonth(), 1));
        }
    };
    const handleDayClick = (day) => {
        const m = viewDate.getMonth() + 1;
        const y = viewDate.getFullYear();
        const mm = String(m).padStart(2, "0");
        const dd = String(day).padStart(2, "0");
        onChange(`${dd}.${mm}.${y}`);
        setIsOpen(false);
    };
    const handleMonthClick = (monthIndex) => {
        setViewDate(new Date(viewDate.getFullYear(), monthIndex, 1));
        setView("days");
    };
    const handleYearClick = (year) => {
        setViewDate(new Date(year, viewDate.getMonth(), 1));
        setView("months");
    };
    const handleInputChange = (e) => {
        const raw = e.target.value;
        const numbersOnly = raw.replace(/\D/g, "");
        if (numbersOnly.length === 8) {
            const day = numbersOnly.substring(0, 2);
            const month = numbersOnly.substring(2, 4);
            const year = numbersOnly.substring(4, 8);
            onChange(`${day}.${month}.${year}`);
        }
        else {
            onChange(raw);
        }
    };
    const handleInputBlur = (e) => {
        const raw = e.target.value;
        const numbersOnly = raw.replace(/\D/g, "");
        if (numbersOnly.length === 8) {
            const day = numbersOnly.substring(0, 2);
            const month = numbersOnly.substring(2, 4);
            const year = numbersOnly.substring(4, 8);
            onChange(`${day}.${month}.${year}`);
        }
    };
    const isToday = (day) => {
        const today = new Date();
        return (today.getDate() === day &&
            today.getMonth() === viewDate.getMonth() &&
            today.getFullYear() === viewDate.getFullYear());
    };
    const isSelected = (day) => {
        if (!selectedDate)
            return false;
        return (selectedDate.getDate() === day &&
            selectedDate.getMonth() === viewDate.getMonth() &&
            selectedDate.getFullYear() === viewDate.getFullYear());
    };
    const isSelectedMonth = (monthIndex) => {
        if (!selectedDate)
            return false;
        return (selectedDate.getMonth() === monthIndex &&
            selectedDate.getFullYear() === viewDate.getFullYear());
    };
    const isSelectedYear = (year) => {
        if (!selectedDate)
            return false;
        return selectedDate.getFullYear() === year;
    };
    const isCurrentMonth = (monthIndex) => {
        const today = new Date();
        return (today.getMonth() === monthIndex &&
            today.getFullYear() === viewDate.getFullYear());
    };
    const isCurrentYear = (year) => {
        return new Date().getFullYear() === year;
    };
    // Заголовок в зависимости от режима
    const headerLabel = view === "days"
        ? `${MONTHS[viewDate.getMonth()]} ${viewDate.getFullYear()}`
        : view === "months"
            ? `${viewDate.getFullYear()}`
            : `${viewDate.getFullYear() - 5} – ${viewDate.getFullYear() + 6}`;
    const handleHeaderClick = () => {
        if (view === "days")
            setView("months");
        else if (view === "months")
            setView("years");
    };
    return ((0, jsx_runtime_1.jsxs)("div", { ref: ref, className: "relative max-w-[200px]", children: [(0, jsx_runtime_1.jsxs)("div", { className: "relative", children: [(0, jsx_runtime_1.jsx)("input", { type: "text", value: value, onChange: handleInputChange, onBlur: handleInputBlur, onFocus: () => setIsOpen(true), placeholder: placeholder, className: "w-full pl-3 pr-9 py-2 border-0 border-b-2 border-slate-200 bg-transparent text-sm text-slate-800 transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-sky-400 focus:bg-sky-50/30 rounded-t-md" }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => setIsOpen(!isOpen), className: "absolute right-1 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-sky-500 transition-colors", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" }) }) })] }), isOpen && ((0, jsx_runtime_1.jsxs)("div", { className: "absolute z-50 mt-1 w-[280px] bg-white rounded-xl border border-slate-200 shadow-lg p-3", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between mb-3", children: [(0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handlePrev, className: "p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M15 19l-7-7 7-7" }) }) }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleHeaderClick, className: "text-sm font-semibold text-slate-700 hover:text-sky-600 transition-colors px-2 py-0.5 rounded-md hover:bg-slate-50", children: headerLabel }), (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: handleNext, className: "p-1 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors", children: (0, jsx_runtime_1.jsx)("svg", { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", strokeWidth: 2, children: (0, jsx_runtime_1.jsx)("path", { strokeLinecap: "round", strokeLinejoin: "round", d: "M9 5l7 7-7 7" }) }) })] }), view === "days" && ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-7 gap-0.5 mb-1", children: DAYS_OF_WEEK.map((d) => ((0, jsx_runtime_1.jsx)("div", { className: "text-center text-[10px] font-semibold text-slate-400 uppercase py-1", children: d }, d))) }), (0, jsx_runtime_1.jsxs)("div", { className: "grid grid-cols-7 gap-0.5", children: [Array.from({ length: firstDayOfWeek }).map((_, i) => ((0, jsx_runtime_1.jsx)("div", {}, `empty-${i}`))), Array.from({ length: daysInMonth }).map((_, i) => {
                                        const day = i + 1;
                                        const sel = isSelected(day);
                                        const today = isToday(day);
                                        return ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleDayClick(day), className: `
                        w-8 h-8 rounded-lg text-xs font-medium transition-all
                        ${sel
                                                ? "bg-sky-500 text-white shadow-sm"
                                                : today
                                                    ? "bg-sky-50 text-sky-600 font-semibold"
                                                    : "text-slate-700 hover:bg-slate-100"}
                      `, children: day }, day));
                                    })] })] })), view === "months" && ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-3 gap-2", children: MONTHS.map((name, i) => {
                            const sel = isSelectedMonth(i);
                            const current = isCurrentMonth(i);
                            return ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleMonthClick(i), className: `
                      py-2 rounded-lg text-xs font-medium transition-all
                      ${sel
                                    ? "bg-sky-500 text-white shadow-sm"
                                    : current
                                        ? "bg-sky-50 text-sky-600 font-semibold"
                                        : "text-slate-700 hover:bg-slate-100"}
                    `, children: name.substring(0, 3) }, i));
                        }) })), view === "years" && ((0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-3 gap-2", children: Array.from({ length: 12 }).map((_, i) => {
                            const year = viewDate.getFullYear() - 5 + i;
                            const sel = isSelectedYear(year);
                            const current = isCurrentYear(year);
                            return ((0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleYearClick(year), className: `
                      py-2 rounded-lg text-xs font-medium transition-all
                      ${sel
                                    ? "bg-sky-500 text-white shadow-sm"
                                    : current
                                        ? "bg-sky-50 text-sky-600 font-semibold"
                                        : "text-slate-700 hover:bg-slate-100"}
                    `, children: year }, year));
                        }) }))] }))] }));
};
exports.DatePickerField = DatePickerField;
exports.default = DatePickerField;
//# sourceMappingURL=DatePickerField.js.map