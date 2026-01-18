// /components/print/PrintTestSection.tsx
import React from "react";
import { useResearch } from "@contexts";
import ResearchPrintHeader from "@components/print/ResearchPrintHeader";
import ObpPrint from "@/components/print/researches/ObpPrint";
import KidneysPrint from "@/components/print/researches/KidneysPrint";
import UrinaryBladderStudyPrint from "@/components/print/researches/UrinaryBladderStudyPrint";
import ConclusionPrint from "@/components/print/ConclusionPrint";
import OmtFemalePrint from "@/components/print/researches/OmtFemalePrint";
import OmtMalePrint from "@/components/print/researches/OmtMalePrint";

export const PrintTestSection: React.FC = () => {
  const { studiesData } = useResearch();

  const obpData = studiesData["ОБП"];
  const kidneysData = studiesData["Почки"];
  const bladderStudyData = studiesData["Мочевой пузырь"];
  const omtFemaleData = studiesData["ОМТ (Ж)"];
  const omtMaleData = studiesData["ОМТ (М)"];

  const conclusion =
    (obpData?.conclusion || "") +
    (obpData?.conclusion && kidneysData?.conclusion ? "\n" : "") +
    (kidneysData?.conclusion || "") +
    ((obpData?.conclusion || kidneysData?.conclusion) &&
    bladderStudyData?.conclusion
      ? "\n"
      : "") +
    (bladderStudyData?.conclusion || "") +
    (((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion) &&
      omtFemaleData?.conclusion)
      ? "\n"
      : "") +
    (omtFemaleData?.conclusion || "") +
    (((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion ||
      omtFemaleData?.conclusion) &&
      omtMaleData?.conclusion)
      ? "\n"
      : "") +
    (omtMaleData?.conclusion || "");

  const recommendations =
    (obpData?.recommendations || "") +
    (obpData?.recommendations && kidneysData?.recommendations ? "\n" : "") +
    (kidneysData?.recommendations || "") +
    ((obpData?.recommendations || kidneysData?.recommendations) &&
    bladderStudyData?.recommendations
      ? "\n"
      : "") +
    (bladderStudyData?.recommendations || "") +
    (((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations) &&
      omtFemaleData?.recommendations)
      ? "\n"
      : "") +
    (omtFemaleData?.recommendations || "") +
    (((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations ||
      omtFemaleData?.recommendations) &&
      omtMaleData?.recommendations)
      ? "\n"
      : "") +
    (omtMaleData?.recommendations || "");

  return (
    <div className="flex justify-center py-6 bg-slate-100">
      <div
        style={{
          width: "210mm",
          minHeight: "297mm",
          backgroundColor: "#ffffff",
          padding: "20mm",
          boxShadow:
            "0 4px 10px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)",
          borderRadius: "4px",
          boxSizing: "border-box",
        }}
      >
        <ResearchPrintHeader />

        <ObpPrint />

        <div style={{ marginTop: "10mm" }}>
          <OmtFemalePrint />
        </div>

        <div style={{ marginTop: "10mm" }}>
          <OmtMalePrint />
        </div>

        <div style={{ marginTop: "10mm" }}>
          <KidneysPrint />
        </div>

        <div style={{ marginTop: "10mm" }}>
          <UrinaryBladderStudyPrint />
        </div>

        <div>
          <ConclusionPrint
            value={{
              conclusion,
              recommendations,
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default PrintTestSection;
