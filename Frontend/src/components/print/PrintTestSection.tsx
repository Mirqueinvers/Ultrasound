// /components/print/PrintTestSection.tsx
import React from "react";
import { useResearch } from "@contexts";
import ResearchPrintHeader from "@components/print/ResearchPrintHeader";
import ObpPrint from "@/components/print/researches/ObpPrint";
import KidneysPrint from "@/components/print/researches/KidneysPrint";
import ConclusionPrint from "@/components/print/ConclusionPrint";

export const PrintTestSection: React.FC = () => {
  const { studiesData } = useResearch();

  const obpData = studiesData["ОБП"];
  const kidneysData = studiesData["Почки"];

  const conclusion =
    (obpData?.conclusion || "") +
    (obpData?.conclusion && kidneysData?.conclusion ? "\n" : "") +
    (kidneysData?.conclusion || "");

  const recommendations =
    (obpData?.recommendations || "") +
    (obpData?.recommendations && kidneysData?.recommendations ? "\n" : "") +
    (kidneysData?.recommendations || "");

  return (
    <div className="flex justify-center py-6 bg-slate-100">
      {/* Лист A4 */}
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
          <KidneysPrint />
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
