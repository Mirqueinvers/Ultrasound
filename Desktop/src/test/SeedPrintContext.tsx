// src/test/SeedPrintContext.tsx
// Компонент-«сид» для снапшот-тестов печати (этап 2.6):
// наполняет ResearchProvider данными (исследования и шапка печати).
import { useEffect } from "react";
import { useResearch } from "@/contexts/useResearch";

export interface SeedPrintContextApi {
  setStudyData: (studyType: string, data: unknown) => void;
  setPatientFullName: (v: string) => void;
  setPatientDateOfBirth: (v: string) => void;
  setResearchDate: (v: string) => void;
  setOrganization: (v: string) => void;
}

/** Компонент-«сид», который наполняет ResearchProvider данными для печати. */
export const SeedPrintContext: React.FC<{
  children: React.ReactNode;
  seed: (api: SeedPrintContextApi) => void;
}> = ({ children, seed }) => {
  const {
    setStudyData,
    setPatientFullName,
    setPatientDateOfBirth,
    setResearchDate,
    setOrganization,
  } = useResearch();

  useEffect(() => {
    seed({
      setStudyData,
      setPatientFullName,
      setPatientDateOfBirth,
      setResearchDate,
      setOrganization,
    });
    // Сид выполняется один раз при монтировании.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};