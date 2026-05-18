import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { createSyncTimestamp, type MobileSyncWireMessage } from "@/sync/mobileSync";
import { useResearchMobileSync } from "@/hooks";
import type { DesktopStudiesDataMap, DesktopStudyData } from "@/researches/types";

interface ResearchContextType {
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
  clearStudyData: (studyType: string) => void;
  clearStudiesData: () => void;

  clearHeaderData: () => void;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export const ResearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getCurrentDate = useCallback(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
  }, []);

  const [patientFullName, setPatientFullNameState] = useState("");
  const [patientDateOfBirth, setPatientDateOfBirthState] = useState("");
  const [researchDate, setResearchDateState] = useState(getCurrentDate);
  const [organization, setOrganizationState] = useState("");
  const [studiesData, setStudiesDataState] = useState<DesktopStudiesDataMap>({});

  const publishSyncMessage = useCallback((message: MobileSyncWireMessage) => {
    void window.mobileHostAPI?.publishSync(message);
  }, []);

  useResearchMobileSync({
    setPatientFullNameState,
    setPatientDateOfBirthState,
    setResearchDateState,
    setOrganizationState,
    setStudiesDataState,
    getCurrentDate,
  });

  const setStudyData = useCallback((studyType: string, data: DesktopStudyData) => {
    setStudiesDataState((prev) => ({
      ...prev,
      [studyType]: data,
    }));

    publishSyncMessage({
      type: "sync:update",
      fragment: "studiesData",
      data: {
        mode: "set",
        studyType,
        value: data,
      },
      origin: "desktop",
      updatedAt: createSyncTimestamp(),
    });
  }, [publishSyncMessage]);

  const setPatientFullName = useCallback((value: string) => {
    setPatientFullNameState(value);
    publishSyncMessage({
      type: "sync:update",
      fragment: "header",
      data: { patientFullName: value },
      origin: "desktop",
      updatedAt: createSyncTimestamp(),
    });
  }, [publishSyncMessage]);

  const setPatientDateOfBirth = useCallback((value: string) => {
    setPatientDateOfBirthState(value);
    publishSyncMessage({
      type: "sync:update",
      fragment: "header",
      data: { patientDateOfBirth: value },
      origin: "desktop",
      updatedAt: createSyncTimestamp(),
    });
  }, [publishSyncMessage]);

  const setResearchDate = useCallback((value: string) => {
    setResearchDateState(value);
    publishSyncMessage({
      type: "sync:update",
      fragment: "header",
      data: { researchDate: value },
      origin: "desktop",
      updatedAt: createSyncTimestamp(),
    });
  }, [publishSyncMessage]);

  const setOrganization = useCallback((value: string) => {
    setOrganizationState(value);
    publishSyncMessage({
      type: "sync:update",
      fragment: "header",
      data: { organization: value },
      origin: "desktop",
      updatedAt: createSyncTimestamp(),
    });
  }, [publishSyncMessage]);

  const clearStudyData = useCallback((studyType: string) => {
    setStudiesDataState((prev) => {
      if (!(studyType in prev)) {
        return prev;
      }

      const next = { ...prev };
      delete next[studyType];
      return next;
    });

    publishSyncMessage({
      type: "sync:update",
      fragment: "studiesData",
      data: {
        mode: "remove",
        studyType,
      },
      origin: "desktop",
      updatedAt: createSyncTimestamp(),
    });
  }, [publishSyncMessage]);

  const clearStudiesData = useCallback(() => {
    setStudiesDataState({});
    publishSyncMessage({
      type: "sync:update",
      fragment: "studiesData",
      data: {
        mode: "replace",
        studiesData: {},
      },
      origin: "desktop",
      updatedAt: createSyncTimestamp(),
    });
  }, [publishSyncMessage]);

  const clearHeaderData = useCallback(() => {
        setPatientFullNameState("");
        setPatientDateOfBirthState("");
        setResearchDateState(getCurrentDate());
        setOrganizationState("");

    publishSyncMessage({
      type: "sync:update",
      fragment: "header",
      data: {
        patientFullName: "",
        patientDateOfBirth: "",
        researchDate: getCurrentDate(),
        organization: "",
      },
      origin: "desktop",
      updatedAt: createSyncTimestamp(),
    });
  }, [getCurrentDate, publishSyncMessage]);

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
