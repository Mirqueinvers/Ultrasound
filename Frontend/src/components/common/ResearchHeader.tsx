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

  return (
    <div className="border-b-2 border-slate-200 pb-6 mb-6">
      {/* Информация о пациенте в столбик */}
      <div className="flex flex-col gap-4">
        {/* ФИО */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1">
            ФИО
          </label>
          <input
            type="text"
            value={patientFullName}
            onChange={(e) => setPatientFullName(e.target.value)}
            className="w-48 px-2 py-1 border border-slate-300 rounded text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
