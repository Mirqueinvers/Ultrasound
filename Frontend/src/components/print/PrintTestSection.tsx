// /components/print/PrintTestSection.tsx
import React from "react";
import { useResearch } from "@contexts";
import ResearchPrintHeader from "@components/print/ResearchPrintHeader";
import HepatPrint from "@components/print/HepatPrint";
import GallbladderPrint from "@components/print/GallbladderPrint";

export const PrintTestSection: React.FC = () => {
  const { studiesData } = useResearch();

  const obpData = studiesData["ОБП"];
  const liverData = obpData?.liver;
  const gallbladderData = obpData?.gallbladder;

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

        {liverData ? (
          <HepatPrint value={liverData} />
        ) : (
          <p className="text-slate-500 text-sm">
            Заполни протокол ОБП (раздел Печень), чтобы увидеть печатную версию.
          </p>
        )}

        {gallbladderData ? (
          <GallbladderPrint value={gallbladderData} />
        ) : (
          <p className="text-slate-500 text-sm">
            Заполни протокол ОБП (раздел Желчный пузырь), чтобы увидеть печатную версию.
          </p>
        )}
      </div>
    </div>
  );
};

export default PrintTestSection;
