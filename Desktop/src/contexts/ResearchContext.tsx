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
  mergeStudyData: (studyType: string, partialData: Record<string, unknown>) => void;
  clearStudyData: (studyType: string) => void;
  clearStudiesData: () => void;

  clearHeaderData: () => void;
}

const ResearchContext = createContext<ResearchContextType | undefined>(undefined);

export const ResearchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const getCurrentDate = useCallback(() => {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    const y = localDate.getFullYear();
    const m = String(localDate.getMonth() + 1).padStart(2, "0");
    const d = String(localDate.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
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

  /** 
   * Мержит два массива узлов по индексу: source-значения имеют приоритет,
   * но только если поле в source не пустое. Это защищает селекты от затирания,
   * когда source содержит неполные узлы (например, только size1/size2 с флешки).
   */
  const mergeNodeArrays = useCallback((target: unknown[], source: unknown[]): unknown[] => {
    return target.map((existingNode, i) => {
      const sourceNode = source[i];
      if (!sourceNode || typeof sourceNode !== "object") return existingNode;
      if (typeof existingNode !== "object") return sourceNode;
      const result = { ...(existingNode as Record<string, unknown>) };
      for (const key of Object.keys(sourceNode as Record<string, unknown>)) {
        const sourceVal = (sourceNode as Record<string, unknown>)[key];
        if (sourceVal !== undefined && sourceVal !== null && sourceVal !== "") {
          result[key] = sourceVal;
        }
      }
      return result;
    }).concat(
      source.slice(target.length).map((n) => (typeof n === "object" ? { ...(n as Record<string, unknown>) } : n)),
    );
  }, []);

  // Глубокое рекурсивное слияние — мержит вложенные объекты, а не заменяет их
  const deepMerge = useCallback((target: unknown, source: unknown): unknown => {
    if (source === null || source === undefined) return target;
    if (target === null || target === undefined) return source;
    if (typeof target !== "object" || typeof source !== "object") return source;
    if (Array.isArray(target) || Array.isArray(source)) return source;

    const result = { ...(target as Record<string, unknown>) };
    for (const key of Object.keys(source as Record<string, unknown>)) {
      const targetVal = (target as Record<string, unknown>)[key];
      const sourceVal = (source as Record<string, unknown>)[key];
      if (
        targetVal !== null && targetVal !== undefined &&
        typeof targetVal === "object" && !Array.isArray(targetVal) &&
        typeof sourceVal === "object" && !Array.isArray(sourceVal)
      ) {
        result[key] = deepMerge(targetVal, sourceVal);
      } else if (
        targetVal !== null && targetVal !== undefined &&
        Array.isArray(targetVal) && Array.isArray(sourceVal) &&
        sourceVal.length > 0 && typeof sourceVal[0] === "object" && "number" in (sourceVal[0] as Record<string, unknown>)
      ) {
        // Спецобработка для массивов с числовым полем "number" (nodesList, concretionsList и т.д.)
        result[key] = mergeNodeArrays(targetVal, sourceVal);
      } else {
        result[key] = sourceVal;
      }
    }
    return result;
  }, []);

  const mergeStudyData = useCallback((studyType: string, partialData: Record<string, unknown>) => {
    setStudiesDataState((prev) => {
      const existing = prev[studyType];
      const merged = existing && typeof existing === "object" && !Array.isArray(existing)
        ? deepMerge(existing, partialData)
        : partialData;
      return {
        ...prev,
        [studyType]: merged,
      };
    });
  }, [deepMerge]);


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
      mergeStudyData,
      clearStudyData,
      clearStudiesData,
      clearHeaderData,
    }),
    [
      clearHeaderData,
      clearStudiesData,
      clearStudyData,
      mergeStudyData,
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
