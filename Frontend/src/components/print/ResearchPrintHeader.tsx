// /components/print/ResearchPrintHeader.tsx
import React from "react";
import { useResearch } from "@contexts";

const parseRuDate = (str?: string | null): Date | null => {
  if (!str || typeof str !== 'string') return null;
  const match = str.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!match) return null;
  const [, dayStr, monthStr, yearStr] = match;
  const day = parseInt(dayStr, 10);
  const month = parseInt(monthStr, 10) - 1; // JS месяцы от 0
  const year = parseInt(yearStr, 10);
  const date = new Date(year, month, day);
  // Валидация: если день вышел за пределы месяца, дата неверная
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
};

const formatDateRu = (str?: string | null): string => {
  const date = parseRuDate(str) ?? (str ? new Date(str) : null);
  if (!date || Number.isNaN(date.getTime())) return str ?? '';
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
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
