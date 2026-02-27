// /components/print/organs/UrinaryBladderPrint.tsx
import React from "react";
import type { UrinaryBladderProtocol } from "@types";

export interface UrinaryBladderPrintProps {
  value: UrinaryBladderProtocol;
}

export const UrinaryBladderPrint: React.FC<UrinaryBladderPrintProps> = ({ value }) => {
  const {
    length,
    width,
    depth,
    volume,
    wallThickness,
    residualVolume,
    residualStatus,
    contents,
    contentsText,
    additional,
  } = value;

  const sizeParts: string[] = [];

  const dimensions = [length?.trim(), width?.trim(), depth?.trim()].filter(
    (dimension): dimension is string => !!dimension
  );

  if (dimensions.length > 0) {
    sizeParts.push(`размерами ${dimensions.join(" х ")} мм`);
  }
  if (volume?.trim()) {
    sizeParts.push(`объем ${volume} мл`);
  }
  if (wallThickness?.trim()) {
    sizeParts.push(`толщина стенки ${wallThickness} мм`);
  }

  const contentsParts: string[] = [];

  if (contents?.trim()) {
    if (contents === "однородное") {
      contentsParts.push("содержимое однородное");
    } else if (contents === "неоднородное") {
      if (contentsText?.trim()) {
        contentsParts.push(contentsText.trim());
      } else {
        contentsParts.push("содержимое неоднородное");
      }
    }
  }

  let residualPhrase = "";

  if (residualStatus === "определяется" && residualVolume?.trim()) {
    residualPhrase = `После микции объем остаточной мочи ${residualVolume} мл.`;
  } else if (residualStatus === "не определяется") {
    residualPhrase = "После микции остаточной мочи не определяется.";
  }

  const additionalText = additional?.trim();

  const hasAnyContent =
    sizeParts.length > 0 ||
    contentsParts.length > 0 ||
    !!residualPhrase ||
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
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Мочевой пузырь:</span>{" "}
        {sizeParts.length > 0 && (
          <>
            {(() => {
              const text = sizeParts.join(", ");
              return text + ".";
            })()}
          </>
        )}
        {contentsParts.length > 0 && (
          <>
            {" "}
            {(() => {
              const text = contentsParts.join(", ");
              return text.charAt(0).toUpperCase() + text.slice(1) + ".";
            })()}
          </>
        )}
        {residualPhrase && <> {residualPhrase}</>}
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

export default UrinaryBladderPrint;
