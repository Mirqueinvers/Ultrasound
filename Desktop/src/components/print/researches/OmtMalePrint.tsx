// /components/print/researches/OmtMalePrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import ProstatePrint from "@/components/print/organs/ProstatePrint";
import UrinaryBladderPrint from "@/components/print/organs/UrinaryBladderPrint";
import type { OmtMaleProtocol } from "@types";

export const OmtMalePrint: React.FC = () => {
  const { studiesData } = useResearch();
  const omtData = studiesData["ОМТ (М)"] as OmtMaleProtocol | undefined;

  if (!omtData) return null;

  const prostate = omtData.prostate;
  const urinaryBladder = omtData.urinaryBladder;

  if (!prostate && !urinaryBladder) return null;

  const { studyType } = prostate ?? {};

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование органов малого таза
      </p>

      {studyType && (
        <div
          style={{
            fontSize: "14px",
            lineHeight: 1.5,
            fontFamily: '"Times New Roman", Times, serif',
            marginBottom: "6px",
          }}
        >
          <p style={{ margin: 0 }}>
            Вид исследования - {studyType.toLowerCase()}.
          </p>
        </div>
      )}

      {prostate && <ProstatePrint value={prostate} />}

      {urinaryBladder && (
        <div>
          <UrinaryBladderPrint value={urinaryBladder} />
        </div>
      )}
    </>
  );
};

export default OmtMalePrint;
