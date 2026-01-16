// /components/print/organs/kidney/LeftKidneyPrint.tsx
import React from "react";
import type { KidneyProtocol } from "@types";
import { buildKidneyText } from "./kidneyHelpers";
import type { KidneyPrintProps } from "./RightKidneyPrint";

export const LeftKidneyPrint: React.FC<KidneyPrintProps> = ({ value }) => {
  const fullText = buildKidneyText("Левая почка", value);

  if (!fullText) return null;

  const text = fullText.replace(/^Левая почка:\s*/, "");

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
          Левая почка:
        </span>{" "}
        {text}
      </p>
    </div>
  );
};

export default LeftKidneyPrint;
