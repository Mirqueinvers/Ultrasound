import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface ResearchContextType {
  patientFullName: string;
  setPatientFullName: (name: string) => void;
  patientDateOfBirth: string;
  setPatientDateOfBirth: (dob: string) => void;
  researchDate: string;
  setResearchDate: (date: string) => void;

  organization: string;
  setOrganization: (org: string) => void;

  studiesData: { [studyType: string]: any };
  setStudyData: (studyType: string, data: any) => void;
  clearStudyData: (studyType: string) => void;
  clearStudiesData: () => void;

  clearHeaderData: () => void;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export const ResearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getCurrentDate = () => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  };

  const [patientFullName, setPatientFullName] = useState("");
  const [patientDateOfBirth, setPatientDateOfBirth] = useState("");
  const [researchDate, setResearchDate] = useState(getCurrentDate);
  const [organization, setOrganization] = useState("");
  const [studiesData, setStudiesDataState] = useState<{ [studyType: string]: any }>({});

  const setStudyData = useCallback((studyType: string, data: any) => {
    setStudiesDataState((prev) => ({
      ...prev,
      [studyType]: data,
    }));
  }, []);

  const clearStudyData = useCallback((studyType: string) => {
    setStudiesDataState((prev) => {
      if (!(studyType in prev)) {
        return prev;
      }

      const next = { ...prev };
      delete next[studyType];
      return next;
    });
  }, []);

  const clearStudiesData = useCallback(() => {
    setStudiesDataState({});
  }, []);

  const clearHeaderData = useCallback(() => {
    setPatientFullName("");
    setPatientDateOfBirth("");
    setResearchDate(getCurrentDate());
    setOrganization("");
  }, []);

  const contextValue = useMemo(
    () => ({
      patientFullName,
      setPatientFullName,
      patientDateOfBirth,
      setPatientDateOfBirth,
      researchDate,
      setResearchDate,
      organization,
      setOrganization,
      studiesData,
      setStudyData,
      clearStudyData,
      clearStudiesData,
      clearHeaderData,
    }),
    [
      clearHeaderData,
      clearStudiesData,
      clearStudyData,
      organization,
      patientDateOfBirth,
      patientFullName,
      researchDate,
      setOrganization,
      setPatientDateOfBirth,
      setPatientFullName,
      setResearchDate,
      setStudyData,
      studiesData,
    ],
  );

  return <ResearchContext.Provider value={contextValue}>{children}</ResearchContext.Provider>;
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error("useResearch must be used within ResearchProvider");
  }
  return context;
};
