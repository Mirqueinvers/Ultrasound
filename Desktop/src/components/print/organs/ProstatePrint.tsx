// src/print/ProstatePrint.tsx
import React from "react";
import type { ProstateProtocol } from "@types";

export interface ProstatePrintProps {
  value: ProstateProtocol;
}

export const ProstatePrint: React.FC<ProstatePrintProps> = ({ value }) => {
  const {
    position,
    // studyType, // больше не используем в тексте
    length,
    width,
    apDimension,
    volume,
    contour,
    symmetry,
    shape,
    echogenicity,
    echotexture,
    echotextureText,
    bladderProtrusion,
    bladderProtrusionMm,
    pathologicLesions,
    pathologicLesionsText,
    additional,
  } = value;

  const additionalText = additional?.trim();
  const echoTextureTextTrimmed = echotextureText?.trim();
  const lesionsTextTrimmed = pathologicLesionsText?.trim();

  // Простатэктомия: отдельный короткий текст
  if (position === "простатэктомия") {
    const base = "простатэктомия";
    const extra =
      additionalText && additionalText.length
        ? `, ${additionalText.charAt(0).toLowerCase()}${additionalText.slice(
            1
          )}`
        : "";
    const sentence = base + extra + ".";

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
            Простата:
          </span>{" "}
          {sentence}
        </p>
      </div>
    );
  }

  const infoParts: string[] = [];

  // Положение
  let positionText = "";
  if (!position || position === "обычное") {
    positionText = "определяется в обычном положении";
  } else {
    positionText = `определяется: ${position}`;
  }
  infoParts.push(positionText);

  // Размеры
  const sizeParts: string[] = [];
  if (length?.trim()) sizeParts.push(`длина ${length} мм`);
  if (width?.trim()) sizeParts.push(`ширина ${width} мм`);
  if (apDimension?.trim())
    sizeParts.push(`передне-задний размер ${apDimension} мм`);
  if (volume?.trim()) sizeParts.push(`объем ${volume} см³`);

  if (sizeParts.length) {
    infoParts.push(`Размерами: ${sizeParts.join(", ")}`);
  }

  // Контур, симметричность, форма, эхогенность, эхоструктура
  const morphologyParts: string[] = [];

  if (contour?.trim()) {
    morphologyParts.push(`контур простаты ${contour.toLowerCase()}`);
  }
  if (symmetry?.trim()) {
    morphologyParts.push(`симметричность сохранена`.replace(
      "сохранена",
      symmetry.toLowerCase()
    ));
  }
  if (shape?.trim()) {
    morphologyParts.push(`форма овальная`.replace(
      "овальная",
      shape.toLowerCase()
    ));
  }
  if (echogenicity?.trim()) {
    morphologyParts.push(`эхогенность ${echogenicity.toLowerCase()}`);
  }
  if (echotexture?.trim()) {
    let base = `эхоструктура ${echotexture.toLowerCase()}`;
    if (
      (echotexture === "неоднородная" ||
        echotexture === "диффузно-неоднородная") &&
      echoTextureTextTrimmed
    ) {
      base += ` (${echoTextureTextTrimmed})`;
    }
    morphologyParts.push(base);
  }

  if (morphologyParts.length) {
    const txt = morphologyParts.join(", ");
    infoParts.push(txt.charAt(0).toUpperCase() + txt.slice(1));
  }

  // В просвет мочевого пузыря
  if (bladderProtrusion === "выступает") {
    let protr = "в просвет мочевого пузыря выступает";
    if (bladderProtrusionMm && bladderProtrusionMm.toString().trim()) {
      protr += ` на ${bladderProtrusionMm} мм`;
    }
    infoParts.push(protr.charAt(0).toUpperCase() + protr.slice(1));
  } else if (bladderProtrusion === "не выступает") {
    infoParts.push("В просвет мочевого пузыря не выступает.");
  }

  // Патологические образования
  if (pathologicLesions === "определяются" && lesionsTextTrimmed) {
    const t =
      lesionsTextTrimmed.charAt(0).toUpperCase() +
      lesionsTextTrimmed.slice(1);
    infoParts.push(t.endsWith(".") ? t : `${t}.`);
  } else if (pathologicLesions === "не определяются") {
    infoParts.push("Патологические объемные образования не определяются.");
  }

  if (additionalText && position !== "простатэктомия") {
    const t =
      additionalText.charAt(0).toUpperCase() + additionalText.slice(1);
    infoParts.push(t.endsWith(".") ? t : `${t}.`);
  }

  if (!infoParts.length) return null;

  const sentence =
    infoParts
      .map((s) => {
        const trimmed = s.trim();
        if (!trimmed) return "";
        return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
      })
      .filter(Boolean)
      .join(" ");

  return (
    <div
      style={{
        fontSize: "14px",
        lineHeight: 1.5,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Простата:</span>{" "}
        {sentence}
      </p>
    </div>
  );
};

export default ProstatePrint;
