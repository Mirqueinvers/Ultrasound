import React from "react";
import { useResearch } from "@contexts";
import type { ScrotumProtocol } from "@types";
import TestisPrint from "@/components/print/organs/TestisPrint";

export const ScrotumResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const scrotumData = studiesData["Органы мошонки"] as ScrotumProtocol | undefined;
  const testisProtocol = scrotumData?.testis as unknown as
    | import("@types").TestisProtocol
    | undefined;

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
