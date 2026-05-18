// /components/print/researches/UrinaryBladderStudyPrint.tsx
import React from "react";

import { useResearch } from "@contexts";
import type { UrinaryBladderProtocol, UrinaryBladderStudyProtocol } from "@types";
import UrinaryBladderPrint from "@/components/print/organs/UrinaryBladderPrint";

export const UrinaryBladderStudyPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const bladderStudyData = studiesData["РњРѕС‡РµРІРѕР№ РїСѓР·С‹СЂСЊ"] as
    | UrinaryBladderStudyProtocol
    | undefined;
  const bladderProtocol = bladderStudyData?.urinaryBladder as UrinaryBladderProtocol | undefined;

  if (!bladderProtocol) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        РЈР»СЊС‚СЂР°Р·РІСѓРєРѕРІРѕРµ РёСЃСЃР»РµРґРѕРІР°РЅРёРµ РјРѕС‡РµРІРѕРіРѕ РїСѓР·С‹СЂСЏ
      </p>

      <UrinaryBladderPrint value={bladderProtocol} />
    </>
  );
};

export default UrinaryBladderStudyPrint;
