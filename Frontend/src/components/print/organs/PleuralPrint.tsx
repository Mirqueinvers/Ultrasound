// /components/print/organs/PleuralPrint.tsx
import React from "react";
import type {
  PleuralProtocol,
  PleuralSideProtocol,
} from "@types";

export interface PleuralPrintProps {
  value: PleuralProtocol;
}

const formatSideContent = (
  side: "right" | "left",
  sideData?: PleuralSideProtocol
): React.ReactNode => {
  if (!sideData) return null;

  const sideLabel = side === "right" ? "Правая" : "Левая";
  const isFluidDetected = sideData.presence === "определяется";

  return (
    <>
      <strong>{sideLabel} плевральная полость:</strong>{" "}
      {isFluidDetected ? (
        <>
          жидкость определяется
          {sideData.content && `, содержимое: ${sideData.content}`}
          .
          {(sideData.volumeSitting || sideData.volumeLying || sideData.volumeEstimated) && (
            <>
              {" "}
              {sideData.volumeSitting && `1) Объем сидя: ${sideData.volumeSitting}. `}
              {sideData.volumeLying && `2) Объем лежа: ${sideData.volumeLying}. `}
              {sideData.volumeEstimated && `3) Объем на глаз: ${sideData.volumeEstimated}.`}
            </>
          )}
        </>
      ) : (
        <>жидкость не определяется.</>
      )}
      {"\n"}
    </>
  );
};

export const PleuralPrint: React.FC<PleuralPrintProps> = ({ value }) => {
  const { rightSide, leftSide } = value;

  const hasContent = rightSide || leftSide;
  if (!hasContent) return null;

  return (
    <div
      style={{
        fontSize: "14px",
        lineHeight: 1.5,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <p style={{ margin: 0, whiteSpace: "pre-line" }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>
          Плевральные полости:
        </span>{" "}
        {formatSideContent("right", rightSide)}
        {formatSideContent("left", leftSide)}
      </p>
    </div>
  );
};

export default PleuralPrint;
