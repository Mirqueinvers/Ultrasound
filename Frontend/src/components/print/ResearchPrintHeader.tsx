// /components/print/ResearchPrintHeader.tsx
import React from "react";
import { useResearch } from "@contexts";

const formatDateRu = (iso?: string | null): string => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const ResearchPrintHeader: React.FC = () => {
  const {
    patientFullName,
    patientDateOfBirth,
    researchDate,
    organization,
  } = useResearch();

  const formattedResearchDate = formatDateRu(researchDate);
  const formattedDob = formatDateRu(patientDateOfBirth);

  return (
    <div
      style={{
        fontSize: "12px",
        lineHeight: 1.4,
        marginBottom: "16px",
      }}
    >
      <div
        style={{
          textAlign: "center",
          fontWeight: 600,
          marginBottom: "12px",
        }}
      >
        {organization}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <div>
          ФИО пациента:{" "}
          <span style={{ fontWeight: 500 }}>{patientFullName}</span>
        </div>
        <div>
          Дата исследования:{" "}
          <span style={{ fontWeight: 500 }}>{formattedResearchDate}</span>
        </div>
      </div>

      <div>
        Дата рождения:{" "}
        <span style={{ fontWeight: 500 }}>{formattedDob}</span>
      </div>
    </div>
  );
};

export default ResearchPrintHeader;
