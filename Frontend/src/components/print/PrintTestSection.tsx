// /components/print/PrintTestSection.tsx
import React from "react";
import ObpPrint from "@/components/print/researches/ObpPrint";

export const PrintTestSection: React.FC = () => {
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
        <ObpPrint />
      </div>
    </div>
  );
};

export default PrintTestSection;
