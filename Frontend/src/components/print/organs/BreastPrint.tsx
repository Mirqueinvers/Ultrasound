// /components/print/organs/BreastPrint.tsx
import React from "react";
import type {
  BreastProtocol,
  BreastSideProtocol,
  BreastNode,
} from "@types";

export interface BreastPrintProps {
  value: BreastProtocol;
}

const formatDate = (isoDate?: string): string => {
  if (!isoDate?.trim()) return "";
  const [year, month, day] = isoDate.split("-");
  if (!year || !month || !day) return isoDate;
  return `${day}.${month}.${year}`;
};

const formatSideHeader = (label: string, side: BreastSideProtocol): string => {
  const parts: string[] = [];

  // Кожа
  if (side.skin?.trim()) {
    if (side.skin === "изменена" && side.skinComment?.trim()) {
      // если «изменена» — берём только текст из поля
      parts.push(side.skinComment.trim());
    } else {
      // иначе стандартная фраза
      parts.push(
        `кожа ${side.skin.toLowerCase()}${
          side.skinComment?.trim() ? `: ${side.skinComment.trim()}` : ""
        }`
      );
    }
  }

  // Соски и ареолы
  if (side.nipples?.trim()) {
    if (side.nipples === "изменены" && side.nipplesComment?.trim()) {
      // если «изменены» — берём только текст из поля
      parts.push(side.nipplesComment.trim());
    } else {
      // иначе стандартная фраза
      parts.push(
        `соски и ареолы ${side.nipples.toLowerCase()}${
          side.nipplesComment?.trim() ? `: ${side.nipplesComment.trim()}` : ""
        }`
      );
    }
  }

  // Млечные протоки — как было
  if (side.milkDucts?.trim()) {
    parts.push(`млечные протоки ${side.milkDucts.toLowerCase()}`);
  }

  if (parts.length === 0) return "";

  const text = parts.join(", ");
  return `${text.charAt(0).toUpperCase()}${text.slice(1)}.`;
};



const formatSideNodesIntro = (
  label: string,
  side: BreastSideProtocol
): string => {
  const loc =
    label === "Правая молочная железа"
      ? "В правой молочной железе"
      : "В левой молочной железе";

  if (side.volumeFormations === "не определяются") {
    return `${loc} объемные образования не определяются.`;
  }

  if (side.volumeFormations !== "определяются") {
    return "";
  }

  const nodes = side.nodesList || [];
  if (nodes.length === 0) {
    return `${loc} объемные образования определяются.`;
  }

  const count = nodes.length;
  const countText =
    count === 1
      ? "один узел"
      : count >= 2 && count <= 4
      ? `${count} узла`
      : `${count} узлов`;

  return `${loc} определяется ${countText}.`;
};

const formatSideNodesList = (
  side: BreastSideProtocol
): React.ReactNode[] => {
  const nodes = side.nodesList || [];
  if (!nodes.length) return [];

  return nodes.map((n: BreastNode, idx: number) => {
    const parts: string[] = [];

    const sizes: string[] = [];
    if (n.size1?.trim()) sizes.push(n.size1.trim());
    if (n.size2?.trim()) sizes.push(n.size2.trim());
    if (sizes.length) {
      parts.push(`размерами ${sizes.join(" × ")} мм`);
    }

    if (n.depth?.trim()) {
      parts.push(`на глубине ${n.depth.trim()} мм`);
    }
    if (n.direction?.trim()) {
      parts.push(`направление на ${n.direction.toLowerCase()}ч`);
    }
    if (n.echogenicity?.trim()) {
      parts.push(`эхогенность ${n.echogenicity.toLowerCase()}`);
    }
    if (n.echostructure?.trim()) {
      parts.push(`эхоструктура ${n.echostructure.toLowerCase()}`);
    }
    if (n.contour?.trim()) {
      parts.push(`контур ${n.contour.toLowerCase()}`);
    }
    if (n.orientation?.trim()) {
      parts.push(`ориентация ${n.orientation.toLowerCase()}`);
    }
    if (n.bloodFlow?.trim()) {
      parts.push(`кровоток ${n.bloodFlow.toLowerCase()}`);
    }
    if (n.comment?.trim()) {
      parts.push(n.comment.trim());
    }

    const text = parts.length ? parts.join(", ") : "";

    return (
      <React.Fragment key={`node-${idx}`}>
        <br />
        {`Узел №${n.number}`}
        {text ? `: ${text}.` : "."}
      </React.Fragment>
    );
  });
};

const renderSideBlock = (
  label: "Правая молочная железа" | "Левая молочная железа",
  side?: BreastSideProtocol
) => {
  if (!side) return null;

  const header = formatSideHeader(label, side);
  const intro = formatSideNodesIntro(label, side);
  const nodesList = formatSideNodesList(side);

  if (!header && !intro && nodesList.length === 0) return null;

  return (
    <>
      <strong>{label}:</strong>{" "}
      {header}
      {intro && ` ${intro}`}
      {nodesList}
      {"\n"}
    </>
  );
};


export const BreastPrint: React.FC<BreastPrintProps> = ({ value }) => {
  const {
    lastMenstruationDate,
    cycleDay,
    structure,
    rightBreast,
    leftBreast,
  } = value;

  const infoLines: string[] = [];

  if (lastMenstruationDate?.trim()) {
    infoLines.push(
      `Дата последней менструации ${formatDate(lastMenstruationDate)}.`
    );
  }
  if (cycleDay?.trim()) {
    infoLines.push(`День менструального цикла ${cycleDay}.`);
  }
  if (structure?.trim()) {
    infoLines.push(
      `Структура молочных желез: ${structure.toLowerCase()}.`
    );
  }

  const hasAnyContent =
    rightBreast ||
    leftBreast ||
    infoLines.some((b) => b && b.trim().length > 0);

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
        {infoLines.map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            {"\n"}
          </React.Fragment>
        ))}
        {rightBreast || leftBreast ? "\n" : ""}
        {renderSideBlock("Правая молочная железа", rightBreast)}
        {renderSideBlock("Левая молочная железа", leftBreast)}
      </p>
    </div>
  );
};

export default BreastPrint;
