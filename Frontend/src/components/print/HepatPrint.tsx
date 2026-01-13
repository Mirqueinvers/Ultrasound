import React from "react";
import type { LiverProtocol } from "@types";

export interface HepatPrintProps {
  value: LiverProtocol;
}

export const HepatPrint: React.FC<HepatPrintProps> = ({ value }) => {
  const {
    rightLobeAP,
    rightLobeCCR,
    rightLobeCVR,
    rightLobeTotal,
    leftLobeAP,
    leftLobeCCR,
    leftLobeTotal,
  } = value;

  const hasRightLobeCCR = !!rightLobeCCR?.trim();
  const hasRightLobeCVR = !!rightLobeCVR?.trim();
  const hasRightLobeTotal = !!rightLobeTotal?.trim();

  const hasLeftLobeAP = !!leftLobeAP?.trim();
  const hasLeftLobeCCR = !!leftLobeCCR?.trim();
  const hasLeftLobeTotal = !!leftLobeTotal?.trim();

  return (
    <div style={{ fontSize: "12px", lineHeight: 1.4 }}>
      {/* Правая доля */}
      <p style={{ margin: 0 }}>
        <strong>Печень:</strong>{" "}
        ПЗР правой доли {rightLobeAP || "____"} мм
        {hasRightLobeCCR && (
          <> , ККР правой доли {rightLobeCCR} мм</>
        )}
        {hasRightLobeCVR && (
          <> , КВР правой доли {rightLobeCVR} мм</>
        )}
        {hasRightLobeTotal && (
          <> , сумма ККР + ПЗР {rightLobeTotal} мм</>
        )}
      </p>

      {/* Левая доля (отдельной строкой) */}
      {hasLeftLobeAP && (
        <p style={{ margin: 0 }}>
          ПЗР левой доли {leftLobeAP} мм
          {hasLeftLobeCCR && (
            <> , ККР левой доли {leftLobeCCR} мм</>
          )}
          {hasLeftLobeTotal && (
            <> , сумма ККР + ПЗР {leftLobeTotal} мм</>
          )}
        </p>
      )}
    </div>
  );
};

export default HepatPrint;
