import React from "react";
import type { GallbladderProtocol, Concretion, Polyp } from "@types";

export interface GallbladderPrintProps {
  value: GallbladderProtocol;
}

export const GallbladderPrint: React.FC<GallbladderPrintProps> = ({ value }) => {
  const {
    position,
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

  const additionalText = additional?.trim();

  // вариант для холецистэктомии
  if (position === "холецистэктомия") {
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
          <span style={{ fontWeight: 700, fontSize: "16px" }}>
            Желчный пузырь:
          </span>{" "}
          холецистэктомия{extra}.
        </p>
      </div>
    );
  }

  // Положение
  let positionTextPart = "";
  if (position === "обычное") {
    positionTextPart = "определяется в обычном положении";
  }

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
    formParts.push(`форма желчного пузыря ${shape.toLowerCase()}`);
  }
  if (constriction?.trim()) {
    formParts.push(
      `определяется перетяжка в области ${constriction.toLowerCase()}`
    );
  }

  // Содержимое
  const contentParts: string[] = [];

  if (contentType?.trim()) {
    contentParts.push(`содержимое ${contentType.toLowerCase()}`);
  }

  // Конкременты
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

    const positions = Array.from(
      new Set(
        valid
          .map((c) => c.position?.trim())
          .filter((p): p is string => !!p)
      )
    );

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

    const count = valid.length;

    const positions = Array.from(
      new Set(
        valid
          .map((p) => p.position?.trim())
          .filter((p): p is string => !!p)
      )
    );

    const walls = Array.from(
      new Set(
        valid
          .map((p) => p.wall?.trim())
          .filter((w): w is string => !!w)
      )
    );

    const sizes = valid
      .map((p) => p.size?.toString().trim())
      .filter((s): s is string => !!s);

    let posText = "";
    if (positions.length === 1) {
      posText = `В ${positions[0]}`;
    } else if (positions.length === 2) {
      posText = `В ${positions[0]} и ${positions[1]}`;
    } else if (positions.length > 2) {
      const last = positions[positions.length - 1];
      const rest = positions.slice(0, -1);
      posText = `В ${rest.join(", ")} и ${last}`;
    }

    let wallText = "";
    if (walls.length === 1) {
      wallText = `, ${walls[0]} стенке`;
    } else if (walls.length === 2) {
      wallText = `, по передней и задней стенкам`;
    }

    let sizeText = "";
    if (sizes.length === 1) {
      sizeText = `размерами до ${sizes[0]} мм`;
    } else if (sizes.length > 1) {
      const last = sizes[sizes.length - 1];
      const rest = sizes.slice(0, -1);
      sizeText = `размерами до ${rest.join(" мм, ")} мм и ${last} мм`;
    }

    if (!posText && !sizeText) {
      return "полипы определяются";
    }

    const isSingle = count === 1;
    const verb = isSingle ? "определяется" : "определяются";
    const countPart = isSingle
      ? "гиперэхогенное образование"
      : `${count} гиперэхогенных образования`;

    const participlePart = isSingle
      ? "выступающее из стенки органа в просвет, неподвижное при смене положения"
      : "выступающие из стенки органа в просвет, неподвижные при смене положения";

    return `${posText}${wallText}, ${verb} ${countPart} без акустической тени, ${participlePart}, ${sizeText}`;
  })();

  // Протоки
  const ductsParts: string[] = [];

  if (cysticDuct?.trim()) {
    ductsParts.push(`пузырный проток ${cysticDuct} мм`);
  }
  if (commonBileDuct?.trim()) {
    ductsParts.push(`общий желчный проток ${commonBileDuct} мм`);
  }

  const hasAnyContent =
    positionTextPart ||
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
        <span style={{ fontWeight: 700, fontSize: "16px" }}>
          Желчный пузырь:
        </span>{" "}
        {positionTextPart && (
          <>
            {positionTextPart}.
          </>
        )}
        {sizeParts.length > 0 && (
          <>
            {" "}
            Размерами: {sizeParts.join(", ")}.
          </>
        )}
        {formParts.length > 0 && (
          <>
            {" "}
            {(() => {
              const text = formParts.join(", ");
              return text.charAt(0).toUpperCase() + text.slice(1) + ",";
            })()}
            {contentParts.length > 0 && ` ${contentParts.join(", ")}.`}
            {contentParts.length === 0 && "."}
          </>
        )}
        {formParts.length === 0 && contentParts.length > 0 && (
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
