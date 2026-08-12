// /components/print/researches/BrachioCephalicArteriesPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import type { BrachioCephalicArteriesStudyProtocol } from "@types";
import { BrachioCephalicArteriesPrint as BrachioCephalicArteriesPrintComponent } from "@/components/print/organs/BrachioCephalicArteriesPrint";
import { STUDY_KEYS } from "@/domain/studyKeys";

export const BrachioCephalicArteriesResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const brachioData = studiesData[STUDY_KEYS.BCA] as
    | BrachioCephalicArteriesStudyProtocol
    | undefined;
  const brachioProtocol = brachioData?.brachioCephalicArteries;

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
