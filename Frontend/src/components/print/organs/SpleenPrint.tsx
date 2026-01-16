import React from "react";
import type { SpleenProtocol } from "@types";

export interface SpleenPrintProps {
  value: SpleenProtocol;
}

export const SpleenPrint: React.FC<SpleenPrintProps> = ({ value }) => {
  const {
    position,
    length,
    width,
    echogenicity,
    echostructure,
    contours,
    pathologicalFormations,
    pathologicalFormationsText,
    splenicVein,
    splenicArtery,
    additional,
  } = value;

  const additionalText = additional?.trim();

  // Спленэктомия
  if (position === "спленэктомия") {
    const extra =
      additionalText && additionalText.length > 0
        ? `, ${additionalText.charAt(0).toLowerCase()}${additionalText.slice(1)}`
        : "";

    return (
      <div
        style={{
          fontSize: "14px",
          lineHeight: 1.5,
          fontFamily: '"Times New Roman", Times, serif',
        }}
      >
        <p style={{ margin: 0 }}>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Селезенка:</span>{" "}
          спленэктомия{extra}.
        </p>
      </div>
    );
  }

  // Положение
  let positionTextPart = "";
  if (position === "обычное") {
    positionTextPart = "положение обычное";
  }

  const sizeParts: string[] = [];

  if (length?.trim()) {
    sizeParts.push(`длина ${length} мм`);
  }
  if (width?.trim()) {
    sizeParts.push(`ширина ${width} мм`);
  }

  const structParts: string[] = [];

  if (echogenicity?.trim()) {
    structParts.push(`эхогенность ${echogenicity}`);
  }
  if (echostructure?.trim()) {
    structParts.push(`эхоструктура ${echostructure}`);
  }
  if (contours?.trim()) {
    structParts.push(`контуры ${contours}`);
  }

  if (pathologicalFormations?.trim()) {
    if (pathologicalFormations === "Не определяются") {
      structParts.push("патологические объемные образования не определяются");
    } else if (pathologicalFormations === "Определяются") {
      if (pathologicalFormationsText?.trim()) {
        structParts.push(pathologicalFormationsText.trim());
      } else {
        structParts.push("патологические объемные образования определяются");
      }
    }
  }

  const vesselsParts: string[] = [];

  if (splenicVein?.trim()) {
    vesselsParts.push(`селезеночная вена ${splenicVein} мм`);
  }
  if (splenicArtery?.trim()) {
    vesselsParts.push(`селезеночная артерия ${splenicArtery} мм`);
  }

  const hasAnyContent =
    !!positionTextPart ||
    sizeParts.length > 0 ||
    structParts.length > 0 ||
    vesselsParts.length > 0 ||
    !!additionalText;

  if (!hasAnyContent) {
    return null;
  }

  return (
    <div
      style={{
        fontSize: "14px",
        lineHeight: 1.5,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Селезенка:</span>{" "}
        {positionTextPart && (
          <>
            {positionTextPart}
            {sizeParts.length > 0 ? ", " : "."}
          </>
        )}
        {sizeParts.length > 0 && (
          <>
            {!positionTextPart && ""}
            {sizeParts.join(", ")}.
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
        {additionalText && position !== "спленэктомия" && (
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

export default SpleenPrint;
