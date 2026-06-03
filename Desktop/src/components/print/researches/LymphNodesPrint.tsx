// Frontend/src/components/print/researches/LymphNodesPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import type { LymphNodesProtocol, LymphNodesStudyProtocol } from "@types";
import LymphNodesPrint from "@/components/print/organs/LymphNodesPrint";

export const LymphNodesResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const lymphNodesData =
    (studiesData["Лимфоузлы"] as LymphNodesStudyProtocol | undefined) ||
    (studiesData["Лимфатические узлы"] as LymphNodesStudyProtocol | undefined) ||
    (studiesData["lymphNodes"] as LymphNodesStudyProtocol | undefined);

  const lymphNodesProtocol = lymphNodesData?.lymphNodes as LymphNodesProtocol | undefined;

  if (!lymphNodesProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование периферических лимфатических узлов
      </p>

      <LymphNodesPrint value={lymphNodesProtocol} />
    </>
  );
};

export default LymphNodesResearchPrint;
