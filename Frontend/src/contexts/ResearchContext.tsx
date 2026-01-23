// src/contexts/ResearchContext.tsx
import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ResearchContextType {
  patientFullName: string;
  setPatientFullName: (name: string) => void;
  patientDateOfBirth: string;
  setPatientDateOfBirth: (dob: string) => void;
  researchDate: string;
  setResearchDate: (date: string) => void;

  studiesData: { [studyType: string]: any };
  setStudyData: (studyType: string, data: any) => void;
  clearStudiesData: () => void;

  clearHeaderData: () => void; // <-- новое
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export const ResearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [patientFullName, setPatientFullName] = useState('');
  const [patientDateOfBirth, setPatientDateOfBirth] = useState('');
  const [researchDate, setResearchDate] = useState('');
  const [studiesData, setStudiesDataState] = useState<{ [studyType: string]: any }>({});

  const setStudyData = (studyType: string, data: any) => {
    setStudiesDataState(prev => ({
      ...prev,
      [studyType]: data,
    }));
  };

  const clearStudiesData = () => {
    setStudiesDataState({});
  };

  const clearHeaderData = () => {
    setPatientFullName('');
    setPatientDateOfBirth('');
    setResearchDate('');
  };

  return (
    <ResearchContext.Provider
      value={{
        patientFullName,
        setPatientFullName,
        patientDateOfBirth,
        setPatientDateOfBirth,
        researchDate,
        setResearchDate,
        studiesData,
        setStudyData,
        clearStudiesData,
        clearHeaderData,
      }}
    >
      {children}
    </ResearchContext.Provider>
  );
};

export const useResearch = () => {
  const context = useContext(ResearchContext);
  if (!context) {
    throw new Error('useResearch must be used within ResearchProvider');
  }
  return context;
};
