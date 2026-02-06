// /components/print/researches/PleuralPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import { PleuralPrint as PleuralPrintComponent } from "@/components/print/organs/PleuralPrint";
import type { PleuralProtocol } from "@types";

export const PleuralResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const pleuralData = studiesData["Плевральные полости"];
  const pleuralProtocol = pleuralData?.pleural as PleuralProtocol | undefined;

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