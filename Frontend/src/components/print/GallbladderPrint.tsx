// src/components/GallbladderPrint.tsx
import React from "react";
import type { GallbladderProtocol, Concretion, Polyp } from "@types";

export interface GallbladderPrintProps {
  value: GallbladderProtocol;
}

export const GallbladderPrint: React.FC<GallbladderPrintProps> = ({ value }) => {
  const {
    length,
    width,
    wallThickness,
    shape,
    constriction,
    contentType,
    concretions,
    concretionsList,
    polyps,
    polypsList,
    cysticDuct,
    commonBileDuct,
    additional,
  } = value;

  // Размеры
  const sizeParts: string[] = [];

  if (length?.trim()) {
    sizeParts.push(`длина ${length} мм`);
  }
  if (width?.trim()) {
    sizeParts.push(`ширина ${width} мм`);
  }
  if (wallThickness?.trim()) {
    sizeParts.push(`толщина стенки ${wallThickness} мм`);
  }

  // Форма
  const formParts: string[] = [];

  if (shape?.trim()) {
    formParts.push(`форма ${shape.toLowerCase()}`);
  }
  if (constriction?.trim()) {
    formParts.push(`определяется перетяжка в области ${constriction.toLowerCase()}`);
  }

  // Содержимое
  const contentParts: string[] = [];

  if (contentType?.trim()) {
    contentParts.push(`содержимое ${contentType.toLowerCase()}`);
  }

  // Конкременты — фраза по правилам
  const concretionsPhrase = (() => {
    if (concretions === "Не определяются") {
      return "конкременты не определяются";
    }

    if (concretions !== "Определяются") {
      return "";
    }

    if (!concretionsList || concretionsList.length === 0) {
      return "конкременты определяются";
    }

    const valid = concretionsList.filter(
      (c: Concretion) =>
        (c.size && c.size.toString().trim()) ||
        (c.position && c.position.trim())
    );

    if (valid.length === 0) {
      return "конкременты определяются";
    }

    const count = valid.length;

    // позиции: шейки, тела, дна
    const positions = Array.from(
      new Set(
        valid
          .map((c) => c.position?.trim())
          .filter((p): p is string => !!p)
      )
    );

    // формируем текст областей: "в области шейки и тела", "в области шейки, тела и дна"
    let posText = "";
    if (positions.length === 1) {
      posText = `В области ${positions[0]}`;
    } else if (positions.length === 2) {
      posText = `В области ${positions[0]} и ${positions[1]}`;
    } else if (positions.length >= 3) {
      const last = positions[positions.length - 1];
      const rest = positions.slice(0, -1);
      posText = `В области ${rest.join(", ")} и ${last}`;
    }

    // размеры
    const sizes = valid
      .map((c) => c.size?.toString().trim())
      .filter((s): s is string => !!s);

    let sizeText = "";
    if (sizes.length === 1) {
      sizeText = `размерами до ${sizes[0]} мм`;
    } else if (sizes.length > 1) {
      const last = sizes[sizes.length - 1];
      const rest = sizes.slice(0, -1);
      sizeText = `размерами до ${rest.join(" мм, ")} мм и ${last} мм`;
    }

    if (!posText && !sizeText) {
      return "конкременты определяются";
    }

    // склонение количества - БЕЗ числа если 1 камень
    const isSingle = count === 1;
    const isFew = count >= 2 && count <= 4;

    let countText = "";
    if (isSingle) {
      countText = "гиперэхогенное образование";
    } else if (isFew) {
      countText = `${count} гиперэхогенных образования`;
    } else {
      countText = `${count} гиперэхогенных образований`;
    }

    const verb = isSingle ? "определяется" : "определяются";

    return `${posText} ${verb} ${countText} с акустической тенью ${sizeText}`;
  })();

  // Полипы
  const polypsPhrase = (() => {
    if (polyps === "Не определяются") {
      return "полипы не определяются";
    }

    if (polyps !== "Определяются") {
      return "";
    }

    if (!polypsList || polypsList.length === 0) {
      return "полипы определяются";
    }

    const valid = polypsList.filter(
      (p: Polyp) =>
        (p.size && p.size.toString().trim()) ||
        (p.position && p.position.trim())
    );

    if (valid.length === 0) {
      return "полипы определяются";
    }

    const positions = Array.from(
      new Set(
        valid
          .map((p) => p.position?.trim())
          .filter((p): p is string => !!p)
      )
    );

    const sizes = valid
      .map((p) => p.size?.toString().trim())
      .filter((s): s is string => !!s);

    let posText = "";
    if (positions.length === 1) {
      posText = `В ${positions[0]}`;
    } else if (positions.length > 1) {
      const last = positions[positions.length - 1];
      const rest = positions.slice(0, -1);
      posText = `В ${rest.join(" и ")} и ${last}`;
    }

    let sizeText = "";
    if (sizes.length === 1) {
      sizeText = `размерами до ${sizes[0]} мм`;
    } else if (sizes.length > 1) {
      sizeText = `размерами до ${sizes.join(", ")} мм`;
    }

    if (!posText && !sizeText) {
      return "полипы определяются";
    }

    const isSingle = valid.length === 1;
    const noun = isSingle ? "полип" : "полипы";
    const verb = isSingle ? "определяется" : "определяются";

    return `${posText} ${verb} ${noun} ${sizeText}`;
  })();

  // Протоки
  const ductsParts: string[] = [];

  if (cysticDuct?.trim()) {
    ductsParts.push(`пузырный проток ${cysticDuct} мм`);
  }
  if (commonBileDuct?.trim()) {
    ductsParts.push(`общий желчный проток ${commonBileDuct} мм`);
  }

  const additionalText = additional?.trim();

  const hasAnyContent =
    sizeParts.length > 0 ||
    formParts.length > 0 ||
    contentParts.length > 0 ||
    !!concretionsPhrase ||
    !!polypsPhrase ||
    ductsParts.length > 0 ||
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
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Желчный пузырь:</span>{" "}
        {sizeParts.length > 0 && (
          <>
            {sizeParts.join(", ")}.
          </>
        )}
        {formParts.length > 0 && (
          <>
            {" "}
            {(() => {
              const text = formParts.join(", ");
              return text.charAt(0).toUpperCase() + text.slice(1) + ",";
            })()}
          </>
        )}
        {contentParts.length > 0 && (
          <>
            {" "}
            {contentParts.join(", ")}.
          </>
        )}
        {concretionsPhrase && (
          <>
            {" "}
            {concretionsPhrase}.
          </>
        )}
        {polypsPhrase && (
          <>
            {" "}
            {polypsPhrase}.
          </>
        )}
        {ductsParts.length > 0 && (
          <>
            {" "}
            {(() => {
              const text = ductsParts.join(", ");
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

export default GallbladderPrint;
