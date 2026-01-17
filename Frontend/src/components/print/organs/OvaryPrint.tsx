// src/print/OvaryPrint.tsx
import React from "react";
import type { OvaryProtocol, OvaryCyst } from "@types";

export interface OvaryPrintProps {
  value: OvaryProtocol;
  side: "left" | "right";
}

const formatSizeWithSpaces = (size: string): string =>
  size.replace(/x/gi, " x ");

export const OvaryPrint: React.FC<OvaryPrintProps> = ({ value, side }) => {
  const {
    position,
    length,
    width,
    thickness,
    volume,
    shape,
    contour,
    cysts,
    cystsList = [],
    formations,
    formationsText,
    additional,
  } = value;

  const additionalText = additional?.trim();
  const formationsTextTrimmed = formationsText?.trim();
  const organLabel = side === "left" ? "Левый яичник" : "Правый яичник";

  // Не визуализируется
  if (position === "не визуализируется") {
    let sentence = "не визуализируется";
    if (additionalText) {
      const t =
        additionalText.charAt(0).toUpperCase() + additionalText.slice(1);
      sentence += ". " + (t.endsWith(".") ? t : `${t}.`);
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
            {organLabel}:
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

  // Размеры
  const sizeParts: string[] = [];
  if (length?.trim()) sizeParts.push(`длина ${length} мм`);
  if (width?.trim()) sizeParts.push(`ширина ${width} мм`);
  if (thickness?.trim()) sizeParts.push(`толщина ${thickness} мм`);
  if (volume?.trim()) sizeParts.push(`объем ${volume} см³`);

  if (sizeParts.length) {
    infoParts.push(`Размерами: ${sizeParts.join(", ")}`);
  }

  // Форма + контур + кисты
  const formContourCystParts: string[] = [];

  if (shape?.trim()) {
    formContourCystParts.push(`форма ${shape.toLowerCase()}`);
  }

  if (contour?.trim()) {
    formContourCystParts.push(`контур ${contour.toLowerCase()}`);
  }

  if (cysts === "определяются") {
    const valid: OvaryCyst[] = (cystsList || []).filter(
      (c) => c.size && c.size.toString().trim()
    );

    if (valid.length > 0) {
      const rawSizes = valid
        .map((c) => c.size?.toString().trim())
        .filter((s): s is string => !!s);

      const sizes = rawSizes.map(formatSizeWithSpaces);
      const sideText =
        side === "right" ? "в правом яичнике" : "в левом яичнике";
      const count = valid.length;

      if (sizes.length === 1) {
        formContourCystParts.push(
          `${sideText} определяется анэхогенное образование размерами ${sizes[0]} мм`
        );
      } else if (sizes.length > 1) {
        const last = sizes[sizes.length - 1];
        const rest = sizes.slice(0, -1);
        formContourCystParts.push(
          `${sideText} определяется ${count} анэхогенных образования размерами ${rest.join(
            " мм, "
          )} мм и ${last} мм`
        );
      }
    }
    // если "определяются", но валидных нет — ничего не пишем
  }
  // если "не определяются" — вообще ничего про кисты не добавляем

  if (formContourCystParts.length) {
    const txt =
      "Форма " +
      formContourCystParts
        .join(", ")
        .replace(/^форма /, "")
        .replace(/^Форма форма /, "Форма ");
    infoParts.push(txt);
  }

  // Патологические образования: только текст, с заглавной буквы
  if (formations === "определяются" && formationsTextTrimmed) {
    const t =
      formationsTextTrimmed.charAt(0).toUpperCase() +
      formationsTextTrimmed.slice(1);
    infoParts.push(t.endsWith(".") ? t : `${t}.`);
  }

  if (additionalText) {
    const t =
      additionalText.charAt(0).toUpperCase() + additionalText.slice(1);
    infoParts.push(t.endsWith(".") ? t : `${t}.`);
  }

  const tail =
    infoParts.length > 0
      ? infoParts
          .map((s) => {
            const trimmed = s.trim();
            if (!trimmed) return "";
            return trimmed.endsWith(".") ? trimmed : `${trimmed}.`;
          })
          .filter(Boolean)
          .join(" ")
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
          {organLabel}:
        </span>{" "}
        {positionText}
        {tail ? `. ${tail}` : "."}
      </p>
    </div>
  );
};

export default OvaryPrint;
