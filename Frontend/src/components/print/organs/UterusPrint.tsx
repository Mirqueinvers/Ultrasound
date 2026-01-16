// src/print/UterusPrint.tsx
import React from "react";
import type { UterusProtocol } from "@types";

export interface UterusPrintProps {
  value: UterusProtocol;
}

export const UterusPrint: React.FC<UterusPrintProps> = ({ value }) => {
  const {
    uterusStatus,
    length,
    width,
    apDimension,
    volume,
    shape,
    position,
    myometriumStructure,
    myometriumStructureText,
    myometriumEchogenicity,
    uterineCavity,
    uterineCavityText,
    endometriumSize,
    endometriumStructure,
    cervixSize,
    cervixEchostructure,
    cervixEchostructureText,
    cervicalCanal,
    cervicalCanalText,
    freeFluid,
    freeFluidText,
    additional,
  } = value;

  const additionalText = additional?.trim();

  const infoParts: string[] = [];

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

  // Форма и положение
  const formPosParts: string[] = [];
  if (shape?.trim()) formPosParts.push(`форма матки ${shape.toLowerCase()}`);
  if (position?.trim()) formPosParts.push(`положение ${position}`);
  if (formPosParts.length) {
    const txt = formPosParts.join(", ");
    infoParts.push(txt.charAt(0).toUpperCase() + txt.slice(1));
  }

  // Миометрий
  const myometriumParts: string[] = [];
  if (myometriumStructure?.trim()) {
    let base = `структура миометрия ${myometriumStructure.toLowerCase()}`;
    if (
      myometriumStructure === "неоднородное" &&
      myometriumStructureText?.trim()
    ) {
      base += ` (${myometriumStructureText.trim()})`;
    }
    myometriumParts.push(base);
  }
  if (myometriumEchogenicity?.trim()) {
    myometriumParts.push(
      `эхогенность ${myometriumEchogenicity.toLowerCase()}`
    );
  }
  if (myometriumParts.length) {
    infoParts.push(
      myometriumParts
        .join(", ")
        .replace("Структура", "Структура")
        .replace("структура", "Структура")
    );
  }

  // Полость матки
  if (uterineCavity?.trim()) {
    let cav = `полость матки ${uterineCavity.toLowerCase()}`;
    if (uterineCavity === "расширена" && uterineCavityText?.trim()) {
      cav += `, ${uterineCavityText.trim()}`;
    }
    // добавляем в ту же часть, что и миометрий, если она есть
    if (infoParts.length && infoParts[infoParts.length - 1].startsWith("Структура миометрия")) {
      infoParts[infoParts.length - 1] =
        infoParts[infoParts.length - 1].replace(/\.$/, "") + `, ${cav}`;
    } else {
      infoParts.push(
        cav.charAt(0).toUpperCase() + cav.slice(1)
      );
    }
  }

  // Эндометрий
  const endoParts: string[] = [];
  if (endometriumSize?.trim()) {
    endoParts.push(`толщина эндометрия ${endometriumSize} мм`);
  }
  if (endometriumStructure?.trim()) {
    endoParts.push(
      `структура эндометрия ${endometriumStructure.toLowerCase()}`
    );
  }
  if (endoParts.length) {
    const txt = endoParts.join(", ");
    infoParts.push(txt.charAt(0).toUpperCase() + txt.slice(1));
  }

  // Шейка матки
  const cervixParts: string[] = [];
  if (cervixSize?.trim()) cervixParts.push(`шейка матки ${cervixSize} мм`);
  if (cervixEchostructure?.trim()) {
    let cerv = `эхоструктура шейки матки ${cervixEchostructure.toLowerCase()}`;
    if (
      cervixEchostructure === "неоднородная" &&
      cervixEchostructureText?.trim()
    ) {
      cerv += `, ${cervixEchostructureText.trim()}`;
    }
    cervixParts.push(cerv);
  }
  if (cervicalCanal?.trim()) {
    let canal = `цервикальный канал ${cervicalCanal.toLowerCase()}`;
    if (cervicalCanal === "расширен" && cervicalCanalText?.trim()) {
      canal += `, ${cervicalCanalText.trim()}`;
    }
    cervixParts.push(canal);
  }
  if (cervixParts.length) {
    const txt = cervixParts.join(", ");
    infoParts.push(txt.charAt(0).toUpperCase() + txt.slice(1));
  }

  // Свободная жидкость
  if (freeFluid?.trim()) {
    let fluid = `свободная жидкость в малом тазу ${freeFluid.toLowerCase()}`;
    if (freeFluid === "определяется" && freeFluidText?.trim()) {
      fluid += `, ${freeFluidText.trim()}`;
    }
    infoParts.push(
      fluid.charAt(0).toUpperCase() + fluid.slice(1)
    );
  }

  if (additionalText) {
    infoParts.push(
      additionalText.endsWith(".") ? additionalText : `${additionalText}.`
    );
  }

  if (!infoParts.length && !uterusStatus) return null;

  const sentence =
    infoParts.length > 0
      ? infoParts
          .map((s) => s.trim())
          .filter(Boolean)
          .join(". ") + "."
      : "";

  let statusText = "";
  if (!uterusStatus || uterusStatus === "обычное") {
    statusText = "определяется в обычном положении";
  } else {
    statusText = `определяется: ${uterusStatus}`;
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
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Матка:</span>{" "}
        {statusText}
        {sentence ? `. ${sentence}` : "."}
      </p>
    </div>
  );
};

export default UterusPrint;
