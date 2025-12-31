import React from "react";
import { useResearch } from "@contexts";

export interface ResearchHeaderProps {}

export const ResearchHeader: React.FC<ResearchHeaderProps> = () => {
  const {
    patientFullName,
    setPatientFullName,
    patientDateOfBirth,
    setPatientDateOfBirth,
    researchDate,
    setResearchDate,
  } = useResearch();

  // Разбиваем ФИО на части
  const fullNameParts = patientFullName.split(' ');
  const lastName = fullNameParts[0] || '';
  const firstName = fullNameParts[1] || '';
  const middleName = fullNameParts[2] || '';

  // Функция для капитализации первой буквы
  const capitalizeFirstLetter = (str: string): string => {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Функция для форматирования даты
  const formatDate = (value: string): string => {
    // Убираем все нецифровые символы
    const numbersOnly = value.replace(/\D/g, '');
    
    // Если введено 8 цифр (ddmmyyyy)
    if (numbersOnly.length === 8) {
      const day = numbersOnly.substring(0, 2);
      const month = numbersOnly.substring(2, 4);
      const year = numbersOnly.substring(4, 8);
      return `${day}.${month}.${year}`;
    }
    
    return value;
  };

  // Обработчики для каждого поля ФИО
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

  // Обработчик для даты рождения
  const handleDateOfBirthBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const formatted = formatDate(e.target.value);
    setPatientDateOfBirth(formatted);
  };

  // Обновление полного имени
  const updateFullName = (last: string, first: string, middle: string) => {
    const parts = [last, first, middle].filter(part => part.trim() !== '');
    setPatientFullName(parts.join(' '));
  };

  // Обработчики onChange для ФИО
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
    <div className="border-b-2 border-slate-200 pb-6 mb-6">
      {/* Информация о пациенте в столбик */}
      <div className="flex flex-col gap-4">
        {/* Фамилия */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Фамилия
          </label>
          <input
            type="text"
            value={lastName}
            onChange={handleLastNameChange}
            onBlur={handleLastNameBlur}
            className="w-96 px-2 py-1 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Имя */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Имя
          </label>
          <input
            type="text"
            value={firstName}
            onChange={handleFirstNameChange}
            onBlur={handleFirstNameBlur}
            className="w-96 px-2 py-1 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Отчество */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Отчество
          </label>
          <input
            type="text"
            value={middleName}
            onChange={handleMiddleNameChange}
            onBlur={handleMiddleNameBlur}
            className="w-96 px-2 py-1 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Дата рождения */}
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
            className="w-48 px-2 py-1 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Дата исследования */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            Дата исследования
          </label>
          <input
            type="date"
            value={researchDate}
            onChange={(e) => setResearchDate(e.target.value)}
            className="w-48 px-2 py-1 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
};

export default ResearchHeader;
