// /components/print/researches/BrachioCephalicArteriesPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import { BrachioCephalicArteriesPrint as BrachioCephalicArteriesPrintComponent } from "@/components/print/organs/BrachioCephalicArteriesPrint";
import type { BrachioCephalicProtocol } from "@types";

export const BrachioCephalicArteriesResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const brachioData = studiesData["БЦА"];
  const brachioProtocol = brachioData?.brachioCephalicArteries as BrachioCephalicProtocol | undefined;

  if (!brachioProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование брахиоцефальных артерий
      </p>

      <BrachioCephalicArteriesPrintComponent value={brachioProtocol} />
    </>
  );
};

export default BrachioCephalicArteriesResearchPrint;