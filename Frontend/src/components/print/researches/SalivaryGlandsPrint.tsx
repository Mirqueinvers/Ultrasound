// /components/print/researches/SalivaryGlandsPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import { SalivaryGlandsPrint as SalivaryGlandsPrintComponent } from "@/components/print/organs/SalivaryGlandsPrint";
import type { SalivaryGlandsProtocol } from "@types";

export const SalivaryGlandsResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const salivaryData = studiesData["Слюнные железы"];
  const salivaryProtocol = salivaryData?.salivaryGlands as SalivaryGlandsProtocol | undefined;

  if (!salivaryProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование слюнных желез
      </p>

      <SalivaryGlandsPrintComponent value={salivaryProtocol} />
    </>
  );
};

export default SalivaryGlandsResearchPrint;