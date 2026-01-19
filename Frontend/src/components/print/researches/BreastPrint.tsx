// /components/print/researches/BreastPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import BreastPrint from "@/components/print/organs/BreastPrint";
import type { BreastProtocol } from "@types";

export const BreastResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const breastData = studiesData["Молочные железы"];
  const breastProtocol = breastData?.breast as BreastProtocol | undefined;

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
