import React from "react";
import type { PancreasProtocol } from "@types";

export interface PancreasPrintProps {
  value: PancreasProtocol;
}

export const PancreasPrint: React.FC<PancreasPrintProps> = ({ value }) => {
  const {
    head,
    body,
    tail,
    echogenicity,
    echostructure,
    contour,
    pathologicalFormations,
    pathologicalFormationsText,
    wirsungDuct,
    additional,
  } = value;

  const sizeParts: string[] = [];
  const notVisualizedParts: string[] = [];

  if (head?.trim()) {
    sizeParts.push(`головка ${head} мм`);
  } else {
    notVisualizedParts.push("головки");
  }

  if (body?.trim()) {
    sizeParts.push(`тело ${body} мм`);
  } else {
    notVisualizedParts.push("тела");
  }

  if (tail?.trim()) {
    sizeParts.push(`хвост ${tail} мм`);
  } else {
    notVisualizedParts.push("хвоста");
  }

  let visualizationPhrase = "";
  if (notVisualizedParts.length > 0) {
    if (notVisualizedParts.length === 1) {
      visualizationPhrase = `визуализация ${notVisualizedParts[0]} затруднена`;
    } else if (notVisualizedParts.length === 2) {
      visualizationPhrase = `визуализация ${notVisualizedParts[0]} и ${notVisualizedParts[1]} затруднена`;
    } else {
      const last = notVisualizedParts[notVisualizedParts.length - 1];
      const rest = notVisualizedParts.slice(0, -1);
      visualizationPhrase = `визуализация ${rest.join(", ")} и ${last} затруднена`;
    }
  }

  const structParts: string[] = [];

  if (echogenicity?.trim()) {
    structParts.push(`эхогенность железы ${echogenicity}`);
  }
  if (echostructure?.trim()) {
    structParts.push(`эхоструктура ${echostructure}`);
  }
  if (contour?.trim()) {
    structParts.push(`контур ${contour}`);
  }

  if (pathologicalFormations?.trim()) {
    if (pathologicalFormations === "Не определяются") {
      structParts.push("патологические объемные образования не определяются");
    } else if (pathologicalFormations === "Определяются") {
      if (pathologicalFormationsText?.trim()) {
        structParts.push(pathologicalFormationsText.trim());
      } else {
        structParts.push("патологические образования определяются");
      }
    }
  }

  const wirsungParts: string[] = [];

  if (wirsungDuct?.trim()) {
    wirsungParts.push(`вирсунгов проток ${wirsungDuct} мм`);
  }

  const additionalText = additional?.trim();

  const hasAnyContent =
    sizeParts.length > 0 ||
    !!visualizationPhrase ||
    structParts.length > 0 ||
    wirsungParts.length > 0 ||
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
      <span style={{ fontWeight: 700, fontSize: "16px" }}>
        Поджелудочная железа:
      </span>{" "}
      {/* Размеры + вирсунгов проток + визуализация */}
      {(sizeParts.length > 0 || wirsungParts.length > 0) && (
        <>
          {sizeParts.join(", ")}
          {wirsungParts.length > 0 &&
            `${sizeParts.length > 0 ? ", " : ""}${wirsungParts.join(", ")}`}
          {visualizationPhrase &&
            `, ${visualizationPhrase}`}
          .
        </>
      )}

      {/* Если размеров нет, но есть только визуализация */}
      {sizeParts.length === 0 &&
        wirsungParts.length === 0 &&
        visualizationPhrase && (
          <>
            {visualizationPhrase}.
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

export default PancreasPrint;
