// /components/print/researches/ThyroidPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import ThyroidPrint from "@/components/print/organs/ThyroidPrint";
import type { ThyroidProtocol } from "@types";

export const ThyroidResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const thyroidData = studiesData["Щитовидная железа"];
  const thyroidProtocol = thyroidData?.thyroid as ThyroidProtocol | undefined;

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
