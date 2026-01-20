import React from "react";
import type {
  TestisProtocol,
  SingleTestisProtocol,
} from "@types";

export interface TestisPrintProps {
  value: TestisProtocol;
}

const formatSingleTestisHeader = (
  label: "Правое яичко" | "Левое яичко",
  t?: SingleTestisProtocol | null
): string => {
  if (!t) return "";

  const sizeParts: string[] = [];
  if (t.length?.trim()) sizeParts.push(`длина ${t.length} мм`);
  if (t.width?.trim()) sizeParts.push(`ширина ${t.width} мм`);
  if (t.depth?.trim()) sizeParts.push(`глубина ${t.depth} мм`);

  const hasSizes = sizeParts.length > 0;
  const hasVolume = !!t.volume?.trim();

  if (!hasSizes && !hasVolume) return "";

  const volumeLabel =
    label === "Правое яичко" ? "объем правого яичка" : "объем левого яичка";

  if (hasSizes && hasVolume) {
    return `Размерами: ${sizeParts.join(
      ", "
    )}, ${volumeLabel} ${t.volume} см³.`;
  }

  if (hasSizes) {
    return `Размерами: ${sizeParts.join(", ")}.`;
  }

  return `Размерами: ${volumeLabel} ${t.volume} см³.`;
};

const normalizeExtraText = (text?: string | null): string | null => {
  const trimmed = text?.trim();
  if (!trimmed) return null;
  return trimmed.charAt(0).toLowerCase() + trimmed.slice(1);
};

const formatSingleTestisTail = (t?: SingleTestisProtocol | null): string[] => {
  if (!t) return [];

  const parts: string[] = [];

  if (t.location?.trim()) {
    if (t.location === "в мошонке") {
      parts.push("определяется в мошонке.");
    } else {
      parts.push(`Расположение: ${t.location}.`);
    }
  }

  const tailCommonParts: string[] = [];

  // Контур
  if (t.contour?.trim()) {
    tailCommonParts.push(`контур яичка ${t.contour}`);
  }

  // Капсула
  if (t.capsule?.trim()) {
    const extra = normalizeExtraText(t.capsuleText);
    if (t.capsule === "не изменена") {
      tailCommonParts.push("капсула не изменена");
    } else if (t.capsule === "изменена") {
      if (extra) {
        tailCommonParts.push(extra);
      } else {
        tailCommonParts.push("капсула изменена");
      }
    }
  }

  // Эхогенность
  if (t.echogenicity?.trim()) {
    tailCommonParts.push(`эхогенность ${t.echogenicity}`);
  }

  // Эхоструктура
  if (t.echotexture?.trim()) {
    const extra = normalizeExtraText(t.echotextureText);
    if (t.echotexture === "однородная") {
      tailCommonParts.push("эхоструктура однородная");
    } else {
      if (extra) {
        tailCommonParts.push(extra);
      } else {
        tailCommonParts.push(`эхоструктура ${t.echotexture}`);
      }
    }
  }

  // Структура средостения
  if (t.mediastinum?.trim()) {
    const extra = normalizeExtraText(t.mediastinumText);
    if (t.mediastinum === "не изменена") {
      tailCommonParts.push("структура средостения не изменена");
    } else {
      if (extra) {
        tailCommonParts.push(extra);
      } else {
        tailCommonParts.push("структура средостения изменена");
      }
    }
  }

  // Кровоток
  if (t.bloodFlow?.trim()) {
    tailCommonParts.push(`кровоток в яичке ${t.bloodFlow}`);
  }

  // Придаток
  if (t.appendage?.trim()) {
    const extra = normalizeExtraText(t.appendageText);
    if (t.appendage === "не изменен") {
      tailCommonParts.push("придаток яичка не изменен");
    } else {
      if (extra) {
        tailCommonParts.push(extra);
      } else {
        tailCommonParts.push("придаток яичка изменен");
      }
    }
  }

  // Жидкость
  if (t.fluidAmount?.trim()) {
    const extra = normalizeExtraText(t.fluidAmountText);
    if (t.fluidAmount === "не изменено") {
      tailCommonParts.push(
        "количество жидкости в оболочках не изменено"
      );
    } else {
      if (extra) {
        tailCommonParts.push(extra);
      } else {
        tailCommonParts.push(
          "количество жидкости в оболочках увеличено"
        );
      }
    }
  }

  if (tailCommonParts.length > 0) {
    parts.push(
      `${tailCommonParts[0].charAt(0).toUpperCase()}${tailCommonParts
        .join(", ")
        .slice(1)}.`
    );
  }

  if (t.additional?.trim()) {
    const add = t.additional.trim();
    parts.push(add.endsWith(".") ? add : `${add}.`);
  }

  return parts;
};

const renderSingleTestisBlock = (
  label: "Правое яичко" | "Левое яичко",
  t?: SingleTestisProtocol | null
): React.ReactNode => {
  if (!t) return null;

  const header = formatSingleTestisHeader(label, t);
  const tailParts = formatSingleTestisTail(t);

  const hasAny =
    header ||
    tailParts.some((p) => p && p.trim().length > 0);

  if (!hasAny) return null;

  const locationSentence = tailParts.find(
    (p) =>
      p.startsWith("Определяется в мошонке") ||
      p.startsWith("Расположение:")
  );
  const otherTail = tailParts.filter((p) => p !== locationSentence);

  return (
    <>
      {"\n"}
      <strong>{label}:</strong>{" "}
      {locationSentence && `${locationSentence} `}
      {header && `${header} `}
      {otherTail.length > 0 && otherTail.join(" ")}
      {"\n"}
    </>
  );
};

export const TestisPrint: React.FC<TestisPrintProps> = ({ value }) => {
  const { rightTestis, leftTestis } = value;

  const hasAnyContent = rightTestis || leftTestis;

  if (!hasAnyContent) return null;

  return (
    <div
      style={{
        fontSize: "14px",
        lineHeight: 1.5,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <p style={{ margin: 0, whiteSpace: "pre-line" }}>
        {renderSingleTestisBlock("Правое яичко", rightTestis)}
        {renderSingleTestisBlock("Левое яичко", leftTestis)}
      </p>
    </div>
  );
};

export default TestisPrint;
