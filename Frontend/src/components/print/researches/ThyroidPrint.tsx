// /components/print/researches/ThyroidPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import type { ThyroidStudyProtocol } from "@types";
import ThyroidPrint from "@/components/print/organs/ThyroidPrint";

export const ThyroidResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const thyroidData = studiesData["Щитовидная железа"] as
    | ThyroidStudyProtocol
    | undefined;
  const thyroidProtocol = thyroidData?.thyroid;

  if (!thyroidProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование щитовидной железы
      </p>

      <ThyroidPrint value={thyroidProtocol} />
    </>
  );
};

export default ThyroidResearchPrint;
