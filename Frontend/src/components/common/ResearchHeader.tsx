import React from "react";

export interface PatientInfo {
  fullName: string;
  dateOfBirth: string;
}

export interface ResearchHeaderProps {
  organizationName?: string;
  researchType: string;
  patientInfo: PatientInfo;
  researchDate: string;
}

export const ResearchHeader: React.FC<ResearchHeaderProps> = ({
  organizationName = "Медицинское учреждение",
  researchType,
  patientInfo,
  researchDate,
}) => {
  return (
    <div className="border-b-2 border-slate-200 pb-6 mb-6">
      {/* Организация */}
      <div className="text-center mb-4">
        <h1 className="m-0 text-slate-900 text-2xl font-bold">
          {organizationName}
        </h1>
      </div>

      {/* Вид исследования */}
      <div className="text-center mb-4">
        <h2 className="m-0 text-slate-700 text-lg font-semibold">
          {researchType}
        </h2>
      </div>

      {/* Информация о пациенте и дата */}
      <div className="flex justify-between items-center text-sm text-slate-600">
        <div>
          <p className="m-0">
            <span className="font-semibold">ФИО:</span> {patientInfo.fullName}
          </p>
          <p className="m-0 mt-1">
            <span className="font-semibold">Дата рождения:</span>{" "}
            {patientInfo.dateOfBirth}
          </p>
        </div>
        <div className="text-right">
          <p className="m-0">
            <span className="font-semibold">Дата исследования:</span>{" "}
            {researchDate}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResearchHeader;
