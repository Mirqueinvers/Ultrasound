import React, { createContext, useState, useContext } from "react";

export interface ResearchContextType {
  patientFullName: string;
  setPatientFullName: (name: string) => void;
  patientDateOfBirth: string;
  setPatientDateOfBirth: (date: string) => void;
  researchDate: string;
  setResearchDate: (date: string) => void;
}

export const ResearchContext = createContext<ResearchContextType | undefined>(
  undefined
);

export const ResearchProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [patientFullName, setPatientFullName] = useState("");
  const [patientDateOfBirth, setPatientDateOfBirth] = useState("");
  const [researchDate, setResearchDate] = useState("");

  return (
    <ResearchContext.Provider
      value={{
        patientFullName,
        setPatientFullName,
        patientDateOfBirth,
        setPatientDateOfBirth,
        researchDate,
        setResearchDate,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error("useResearch must be used within ResearchProvider");
  }
  return context;
};
