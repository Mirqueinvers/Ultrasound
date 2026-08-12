// /components/print/researches/PleuralPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import type { PleuralStudyProtocol } from "@types";
import { PleuralPrint as PleuralPrintComponent } from "@/components/print/organs/PleuralPrint";
import { STUDY_KEYS } from "@/domain/studyKeys";

export const PleuralResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const pleuralData = studiesData[STUDY_KEYS.PLEURAL] as
    | PleuralStudyProtocol
    | undefined;
  const pleuralProtocol = pleuralData?.pleural;

  if (!pleuralProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование плевральных полостей
      </p>

      <PleuralPrintComponent value={pleuralProtocol} />
    </>
  );
};

export default PleuralResearchPrint;
