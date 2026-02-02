// Frontend/src/components/print/researches/LymphNodesPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import LymphNodesPrint from "@/components/print/organs/LymphNodesPrint";
import type { LymphNodesProtocol } from "@types";

export const LymphNodesResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const lymphNodesData = studiesData["Лимфоузлы"];
  const lymphNodesProtocol = lymphNodesData?.lymphNodes as
    | LymphNodesProtocol
    | undefined;

  if (!lymphNodesProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование лимфатических узлов
      </p>

      <LymphNodesPrint value={lymphNodesProtocol} />
    </>
  );
};

export default LymphNodesResearchPrint;
