import React from "react";
import { useResearch } from "@contexts";
import TestisPrint from "@/components/print/organs/TestisPrint";
import type { TestisProtocol } from "@types";

export const ScrotumResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const scrotumData = studiesData["Органы мошонки"];
  const testisProtocol = scrotumData?.testis as TestisProtocol | undefined;

  if (!testisProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование органов мошонки
      </p>

      <TestisPrint value={testisProtocol} />
    </>
  );
};

export default ScrotumResearchPrint;
