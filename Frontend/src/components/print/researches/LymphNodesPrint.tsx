// Frontend/src/components/print/researches/LymphNodesPrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import type { LymphNodesProtocol, LymphNodesStudyProtocol } from "@types";
import LymphNodesPrint from "@/components/print/organs/LymphNodesPrint";

export const LymphNodesResearchPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const lymphNodesData =
    (studiesData["Р›РёРјС„Р°С‚РёС‡РµСЃРєРёРµ СѓР·Р»С‹"] as LymphNodesStudyProtocol | undefined) ||
    (studiesData["Р›РёРјС„РѕСѓР·Р»С‹"] as LymphNodesStudyProtocol | undefined) ||
    (studiesData["lymphNodes"] as LymphNodesStudyProtocol | undefined);

  const lymphNodesProtocol = lymphNodesData?.lymphNodes as LymphNodesProtocol | undefined;

  if (!lymphNodesProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        РЈР»СЊС‚СЂР°Р·РІСѓРєРѕРІРѕРµ РёСЃСЃР»РµРґРѕРІР°РЅРёРµ РїРµСЂРёС„РµСЂРёС‡РµСЃРєРёС… Р»РёРјС„Р°С‚РёС‡РµСЃРєРёС… СѓР·Р»РѕРІ
      </p>

      <LymphNodesPrint value={lymphNodesProtocol} />
    </>
  );
};

export default LymphNodesResearchPrint;
