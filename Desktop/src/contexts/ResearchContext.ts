import { createContext } from "react";
import type { DesktopStudiesDataMap, DesktopStudyData } from "@/researches/types";

export interface ResearchContextType {
  patientFullName: string;
  setPatientFullName: (name: string) => void;
  patientDateOfBirth: string;
  setPatientDateOfBirth: (dob: string) => void;
  researchDate: string;
  setResearchDate: (date: string) => void;

  organization: string;
  setOrganization: (org: string) => void;

  studiesData: DesktopStudiesDataMap;
  setStudyData: (studyType: string, data: DesktopStudyData) => void;
  mergeStudyData: (studyType: string, partialData: Record<string, unknown>) => void;
  clearStudyData: (studyType: string) => void;
  clearStudiesData: () => void;

  clearHeaderData: () => void;
}

export const ResearchContext = createContext<ResearchContextType | undefined>(undefined);