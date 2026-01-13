// /components/print/ResearchPrintHeader.tsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useResearch } from "@contexts";

export const ResearchPrintHeader: React.FC = () => {
  const { user } = useAuth();
  const {
    patientFullName,
    patientDateOfBirth,
    researchDate,
  } = useResearch();

  if (!user) return null;

  const organization = user.organization || "";

  return (
    <div
      style={{
        fontSize: "12px",
        lineHeight: 1.4,
        marginBottom: "16px",
      }}
    >
      {/* Организация по центру */}
      <div
        style={{
          textAlign: "center",
          fontWeight: 600,
          marginBottom: "12px",
        }}
      >
        {organization}
      </div>

      {/* Строка: ФИО слева, дата исследования справа */}
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
          <span style={{ fontWeight: 500 }}>{researchDate}</span>
        </div>
      </div>

      {/* Строка: дата рождения слева */}
      <div>
        Дата рождения:{" "}
        <span style={{ fontWeight: 500 }}>{patientDateOfBirth}</span>
      </div>
    </div>
  );
};

export default ResearchPrintHeader;
