// /components/print/researches/BreastPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import { STUDY_KEYS } from "@/domain/studyKeys";
import type { BreastStudyProtocol } from "@types";
import BreastPrint from "@/components/print/organs/BreastPrint";

export const BreastResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const breastData = studiesData[STUDY_KEYS.BREAST] as
    | BreastStudyProtocol
    | undefined;
  const breastProtocol = breastData?.breast;

  if (!breastProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование молочных желез
      </p>

      <BreastPrint value={breastProtocol} />
    </>
  );
};

export default BreastResearchPrint;
