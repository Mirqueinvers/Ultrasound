// /components/print/organs/kidney/RightKidneyPrint.tsx
import React from "react";
import type { KidneyProtocol } from "@types";
import { buildKidneyText } from "./kidneyHelpers";

export interface KidneyPrintProps {
  value: KidneyProtocol;
}

export const RightKidneyPrint: React.FC<KidneyPrintProps> = ({ value }) => {
  const fullText = buildKidneyText("Правая почка", value);

  if (!fullText) return null;

  const text = fullText.replace(/^Правая почка:\s*/, "");

  return (
    <div
      style={{
        fontSize: "14px",
        lineHeight: 1.5,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>
          Правая почка:
        </span>{" "}
        {text}
      </p>
    </div>
  );
};

export default RightKidneyPrint;
