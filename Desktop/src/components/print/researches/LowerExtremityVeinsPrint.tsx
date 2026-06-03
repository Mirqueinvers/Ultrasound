// /components/print/researches/LowerExtremityVeinsPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import type { LowerExtremityVeinsStudyProtocol } from "@types";
import { LowerExtremityVeinsPrint as LowerExtremityVeinsPrintComponent } from "@/components/print/organs/LowerExtremityVeinsPrint";

export const LowerExtremityVeinsResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const veinsData = studiesData["УВНК"] as
    | LowerExtremityVeinsStudyProtocol
    | undefined;
  const veinsProtocol = veinsData?.lowerExtremityVeins;

  if (!veinsProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование вен нижних конечностей
      </p>

      <LowerExtremityVeinsPrintComponent value={veinsProtocol} />
    </>
  );
};

export default LowerExtremityVeinsResearchPrint;
