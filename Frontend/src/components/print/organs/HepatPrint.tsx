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
    echogenicity,
    homogeneity,
    contours,
    lowerEdgeAngle,
    focalLesionsPresence,
    focalLesions,
    vascularPattern,
    portalVeinDiameter,
    ivc,
    additional,
  } = value;

  const rightParts: string[] = [];

  if (rightLobeAP?.trim()) {
    rightParts.push(`ПЗР правой доли ${rightLobeAP} мм`);
  }
  if (rightLobeCCR?.trim()) {
    rightParts.push(`ККР правой доли ${rightLobeCCR} мм`);
  }
  if (rightLobeCVR?.trim()) {
    rightParts.push(`КВР правой доли ${rightLobeCVR} мм`);
  }
  if (rightLobeTotal?.trim()) {
    rightParts.push(`Сумма ККР + ПЗР ${rightLobeTotal} мм`);
  }

  const leftParts: string[] = [];

  if (leftLobeAP?.trim()) {
    leftParts.push(`ПЗР левой доли ${leftLobeAP} мм`);
  }
  if (leftLobeCCR?.trim()) {
    leftParts.push(`ККР левой доли ${leftLobeCCR} мм`);
  }
  if (leftLobeTotal?.trim()) {
    leftParts.push(`Сумма ККР + ПЗР левой доли ${leftLobeTotal} мм`);
  }

  const structParts: string[] = [];

  if (echogenicity?.trim()) {
    structParts.push(`эхогенность ${echogenicity}`);
  }
  if (homogeneity?.trim()) {
    structParts.push(`эхоструктура ${homogeneity}`);
  }
  if (contours?.trim()) {
    structParts.push(`контур ${contours}`);
  }
  if (lowerEdgeAngle?.trim()) {
    structParts.push(`угол нижнего края ${lowerEdgeAngle}`);
  }

  if (focalLesionsPresence?.trim()) {
    if (focalLesionsPresence === "не определяются") {
      structParts.push("патологические объемные образования не определяются");
    } else if (focalLesionsPresence === "определяются") {
      if (focalLesions?.trim()) {
        structParts.push(focalLesions.trim());
      } else {
        structParts.push("патологические образования определяются");
      }
    }
  }

  const vesselsParts: string[] = [];

  if (vascularPattern?.trim()) {
    vesselsParts.push(`сосудистый рисунок ${vascularPattern}`);
  }
  if (portalVeinDiameter?.trim()) {
    vesselsParts.push(`воротная вена ${portalVeinDiameter} мм`);
  }
  if (ivc?.trim()) {
    vesselsParts.push(`нижняя полая вена ${ivc} мм`);
  }

  const additionalText = additional?.trim();

  const hasAnyContent =
    rightParts.length > 0 ||
    leftParts.length > 0 ||
    structParts.length > 0 ||
    vesselsParts.length > 0 ||
    !!additionalText;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <div style={{ fontSize: "14px", lineHeight: 1.5, fontFamily: '"Times New Roman", Times, serif', }}>
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Печень:</span>{" "}
        {rightParts.length > 0 && (
          <>
            {rightParts.join(", ")}.
          </>
        )}
        {leftParts.length > 0 && (
          <>
            {rightParts.length > 0 && " "}
            {leftParts.join(", ")}.
          </>
        )}
        {structParts.length > 0 && (
          <>
            {" "}
            {(() => {
              const text = structParts.join(", ");
              return text.charAt(0).toUpperCase() + text.slice(1) + ".";
            })()}
          </>
        )}
        {vesselsParts.length > 0 && (
          <>
            {" "}
            {(() => {
              const text = vesselsParts.join(", ");
              return text.charAt(0).toUpperCase() + text.slice(1) + ".";
            })()}
          </>
        )}
        {additionalText && (
          <>
            {" "}
            {additionalText}
            {!additionalText.endsWith(".") && "."}
          </>
        )}
      </p>
    </div>
  );
};

export default HepatPrint;
