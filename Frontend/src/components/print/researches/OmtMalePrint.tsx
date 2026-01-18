// /components/print/researches/OmtMalePrint.tsx
import React from "react";
import { useResearch } from "@contexts";
import ProstatePrint from "@/components/print/organs/ProstatePrint";
import UrinaryBladderStudyPrint from "@/components/print/researches/UrinaryBladderStudyPrint";
import type { OmtMaleProtocol } from "@types";

const formatDateRu = (iso?: string | null): string | undefined => {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || undefined;
  return d.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const OmtMalePrint: React.FC = () => {
  const { studiesData } = useResearch();
  const omtData = studiesData["ОМТ (М)"] as OmtMaleProtocol | undefined;

  if (!omtData) return null;

  const prostate = omtData.prostate;
  const urinaryBladder = omtData.urinaryBladder;

  if (!prostate && !urinaryBladder) return null;

  const { studyType } = prostate ?? {};
  // если мочевой пузырь где-то хранит дату/тип отдельно, можно расширить шапку

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование органов малого таза
      </p>

      {/* Шапка исследования (пока только вид исследования из простаты, если есть) */}
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

      {/* Мочевой пузырь уже имеет свою печатную форму в UrinaryBladderStudyPrint */}
      {urinaryBladder && (
        <div style={{ marginTop: "6px" }}>
          <UrinaryBladderStudyPrint />
        </div>
      )}
    </>
  );
};

export default OmtMalePrint;
