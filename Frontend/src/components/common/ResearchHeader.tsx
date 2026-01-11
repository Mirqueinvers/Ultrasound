import React from "react";
import { useResearch } from "@contexts";

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
    updateFullName(capitalized, firstName, middleName);
  };

  const handleFirstNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    updateFullName(lastName, capitalized, middleName);
  };

  const handleMiddleNameBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const capitalized = capitalizeFirstLetter(e.target.value);
    updateFullName(lastName, firstName, capitalized);
  };

  const handleDateOfBirthBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setPatientDateOfBirth(formatted);
  };

  const handleLastNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFullName(e.target.value, firstName, middleName);
  };

  const handleFirstNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFullName(lastName, e.target.value, middleName);
  };

  const handleMiddleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFullName(lastName, firstName, e.target.value);
  };

  return (
    <div className="mb-6">
      {/* Заголовок */}
      <div className="bg-sky-700 rounded-t-2xl px-6 py-3">
        <h2 className="text-white font-semibold text-lg">
          Данные пациента
        </h2>
      </div>

      <div className="bg-white border border-slate-200 rounded-b-2xl shadow-lg px-6 py-5">
        <div className="grid grid-cols-2 gap-6">
          {/* ФИО */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Фамилия
              </label>
              <input
                type="text"
                value={lastName}
                onChange={handleLastNameChange}
                onBlur={handleLastNameBlur}
                className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Имя
              </label>
              <input
                type="text"
                value={firstName}
                onChange={handleFirstNameChange}
                onBlur={handleFirstNameBlur}
                className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Отчество
              </label>
              <input
                type="text"
                value={middleName}
                onChange={handleMiddleNameChange}
                onBlur={handleMiddleNameBlur}
                className="w-full max-w-xs px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>
          </div>

          {/* Даты + тип оплаты */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Дата рождения
              </label>
              <input
                type="text"
                value={patientDateOfBirth}
                onChange={(e) => setPatientDateOfBirth(e.target.value)}
                onBlur={handleDateOfBirthBlur}
                placeholder="дд.мм.гггг"
                className="w-48 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Дата исследования
              </label>
              <input
                type="date"
                value={researchDate}
                onChange={(e) => setResearchDate(e.target.value)}
                className="w-48 px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
              />
            </div>

            {/* Переключатель оплаты */}
            <div className="pt-1">
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Тип оплаты
              </label>
              <div className="inline-flex bg-slate-100 rounded-full px-1 py-1 gap-1">
                <button
                  type="button"
                  onClick={() => setPaymentType("oms")}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                    paymentType === "oms"
                      ? "bg-emerald-500 text-white shadow-sm shadow-emerald-300"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  ОМС
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentType("paid")}
                  className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${
                    paymentType === "paid"
                      ? "bg-sky-500 text-white shadow-sm shadow-sky-300"
                      : "text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  Платно
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResearchHeader;
