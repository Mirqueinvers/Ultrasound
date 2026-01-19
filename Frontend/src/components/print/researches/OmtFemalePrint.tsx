// /components/print/researches/OmtFemalePrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import UterusPrint from "@/components/print/organs/UterusPrint";
import OvaryPrint from "@/components/print/organs/OvaryPrint";
import UrinaryBladderPrint from "@/components/print/organs/UrinaryBladderPrint";
import type { OmtFemaleProtocol } from "@types";

const formatDateRu = (iso?: string): string | undefined => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const OmtFemalePrint: React.FC = () => {
  const { studiesData } = useResearch();
  const omtData = studiesData["ОМТ (Ж)"] as OmtFemaleProtocol | undefined;
  const uterus = omtData?.uterus;
  const rightOvary = omtData?.rightOvary;
  const leftOvary = omtData?.leftOvary;
  const urinaryBladder = omtData?.urinaryBladder;

  if (!omtData || !uterus) return null;

  const { studyType, lastMenstruationDate, cycleDay, menopause } = uterus;

  const formattedLmp = formatDateRu(lastMenstruationDate);

  let cycleLine = "";
  if (menopause) {
    cycleLine = `День цикла - ${menopause}.`;
  } else if (cycleDay) {
    cycleLine = `День цикла - ${cycleDay}.`;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование органов малого таза
      </p>

      <div
        style={{
          fontSize: "14px",
          lineHeight: 1.5,
          fontFamily: '"Times New Roman", Times, serif',
          marginBottom: "6px",
        }}
      >
        {studyType && (
          <p style={{ margin: 0 }}>
            Вид исследования - {studyType.toLowerCase()}.
          </p>
        )}
        {formattedLmp && (
          <p style={{ margin: 0 }}>
            Дата последней менструации - {formattedLmp}.
          </p>
        )}
        {cycleLine && <p style={{ margin: 0 }}>{cycleLine}</p>}
      </div>

      <UterusPrint value={uterus} />

      {rightOvary && <OvaryPrint value={rightOvary} side="right" />}

      {leftOvary && <OvaryPrint value={leftOvary} side="left" />}

      {urinaryBladder && <UrinaryBladderPrint value={urinaryBladder} />}
    </>
  );
};

export default OmtFemalePrint;
