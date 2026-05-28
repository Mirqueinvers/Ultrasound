import React from "react";
import { useResearch } from "@contexts";
import DatePickerField from "./DatePickerField";

export interface ResearchHeaderProps {
  paymentType: "oms" | "paid";
  setPaymentType: (type: "oms" | "paid") => void;
}

export const ResearchHeader: React.FC<ResearchHeaderProps> = ({ paymentType, setPaymentType }) => {
  const {
    patientFullName,
    setPatientFullName,
    patientDateOfBirth,
    setPatientDateOfBirth,
    researchDate,
    setResearchDate,
  } = useResearch();

  const fullNameParts = patientFullName.split(" ");
  const lastName = fullNameParts[0] || "";
  const firstName = fullNameParts[1] || "";
  const middleName = fullNameParts[2] || "";

  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const formatDate = (value: string): string => {
    const numbersOnly = value.replace(/\D/g, "");
    if (numbersOnly.length === 8) {
      const day = numbersOnly.substring(0, 2);
      const month = numbersOnly.substring(2, 4);
      const year = numbersOnly.substring(4, 8);
      return `${day}.${month}.${year}`;
    }
    return value;
  };

  const updateFullName = (last: string, first: string, middle: string) => {
    const parts = [last, first, middle].filter((part) => part.trim() !== "");
    setPatientFullName(parts.join(" "));
  };

  const handleLastNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const rest = parts.slice(1).filter(Boolean);
    setPatientFullName([capitalized, ...rest].join(" "));
  };

  const handleFirstNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const last = parts[0] || "";
    const rest = parts.slice(2).filter(Boolean);
    setPatientFullName([last, capitalized, ...rest].join(" "));
  };

  const handleMiddleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const last = parts[0] || "";
    const first = parts[1] || "";
    setPatientFullName([last, first, capitalized].join(" "));
  };

  const handleDateOfBirthBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setPatientDateOfBirth(formatted);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const rest = parts.slice(1).filter(Boolean);
    setPatientFullName([capitalized, ...rest].join(" "));
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const last = parts[0] || "";
    const rest = parts.slice(2).filter(Boolean);
    setPatientFullName([last, capitalized, ...rest].join(" "));
  };

  const handleMiddleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    const parts = patientFullName.split(" ");
    const last = parts[0] || "";
    const first = parts[1] || "";
    setPatientFullName([last, first, capitalized].join(" "));
  };

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white">
      {/* Шапка с иконкой и заголовком */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h2 className="text-sm font-semibold text-slate-800">
          Данные пациента
        </h2>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {/* Левая колонка — ФИО */}
          <div className="space-y-3">
            <Field label="Фамилия">
              <input
                type="text"
                value={lastName}
                onChange={handleLastNameChange}
                onBlur={handleLastNameBlur}
                className="w-2/3 px-3 py-2 border-0 border-b-2 border-slate-200 bg-transparent text-sm text-slate-800 transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-sky-400 focus:bg-sky-50/30 rounded-t-md"
              />
            </Field>
            <Field label="Имя">
              <input
                type="text"
                value={firstName}
                onChange={handleFirstNameChange}
                onBlur={handleFirstNameBlur}
                className="w-2/3 px-3 py-2 border-0 border-b-2 border-slate-200 bg-transparent text-sm text-slate-800 transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-sky-400 focus:bg-sky-50/30 rounded-t-md"
              />
            </Field>
            <Field label="Отчество">
              <input
                type="text"
                value={middleName}
                onChange={handleMiddleNameChange}
                onBlur={handleMiddleNameBlur}
                className="w-2/3 px-3 py-2 border-0 border-b-2 border-slate-200 bg-transparent text-sm text-slate-800 transition-all outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus:border-sky-400 focus:bg-sky-50/30 rounded-t-md"
              />
            </Field>
          </div>

          {/* Правая колонка — даты + оплата */}
          <div className="space-y-3">
            <Field label="Дата рождения">
              <DatePickerField
                value={patientDateOfBirth}
                onChange={setPatientDateOfBirth}
                placeholder="дд.мм.гггг"
              />
            </Field>
            <Field label="Дата исследования">
              <DatePickerField
                value={researchDate}
                onChange={setResearchDate}
              />
            </Field>
            <Field label="Тип оплаты">
              <div className="flex gap-1.5 pt-1 max-w-[200px]">
                <button
                  type="button"
                  onClick={() => setPaymentType("oms")}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    paymentType === "oms"
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  ОМС
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("paid")}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                    paymentType === "paid"
                      ? "bg-sky-500 text-white shadow-sm shadow-sky-200"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  Платно
                </button>
              </div>
            </Field>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
        {label}
      </label>
      {children}
    </div>
  );
};

export default ResearchHeader;
