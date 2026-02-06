// /components/print/researches/LowerExtremityVeinsPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import { LowerExtremityVeinsPrint as LowerExtremityVeinsPrintComponent } from "@/components/print/organs/LowerExtremityVeinsPrint";
import type { LowerExtremityVeinsProtocol } from "@types";

export const LowerExtremityVeinsResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const veinsData = studiesData["УВНК"];
  const veinsProtocol = veinsData?.lowerExtremityVeins as LowerExtremityVeinsProtocol | undefined;

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