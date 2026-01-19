// /components/print/organs/ThyroidPrint.tsx
import React from "react";
import type {
  ThyroidProtocol,
  ThyroidLobeProtocol,
  ThyroidNode,
} from "@types";

export interface ThyroidPrintProps {
  value: ThyroidProtocol;
}

const formatLobeHeader = (label: string, lobe: ThyroidLobeProtocol): string => {
  const sizeParts: string[] = [];
  if (lobe.length?.trim()) sizeParts.push(`длина ${lobe.length} мм`);
  if (lobe.width?.trim()) sizeParts.push(`ширина ${lobe.width} мм`);
  if (lobe.depth?.trim()) sizeParts.push(`глубина ${lobe.depth} мм`);

  const hasSizes = sizeParts.length > 0;
  const hasVolume = !!lobe.volume?.trim();

  if (!hasSizes && !hasVolume) return "";

  const volumeLabel =
    label === "Правая доля" ? "объем правой доли" : "объем левой доли";

  if (hasSizes && hasVolume) {
    return `${sizeParts.join(", ")}, ${volumeLabel} ${lobe.volume} мл.`;
  }

  if (hasSizes) {
    return `${sizeParts.join(", ")}.`;
  }

  return `${volumeLabel} ${lobe.volume} мл.`;
};

const formatLobeNodesIntro = (label: string, lobe: ThyroidLobeProtocol): string => {
  const lobeLoc = label === "Правая доля" ? "В правой доле" : "В левой доле";

  if (lobe.volumeFormations === "не определяются") {
    return `${lobeLoc} объемные образования не определяются.`;
  }

  if (lobe.volumeFormations !== "определяются") {
    return "";
  }

  const nodes = lobe.nodesList || [];
  if (nodes.length === 0) {
    return `${lobeLoc} объемные образования определяются.`;
  }

  const count = nodes.length;
  const countText =
    count === 1
      ? "один узел"
      : count >= 2 && count <= 4
      ? `${count} узла`
      : `${count} узлов`;

  return `${lobeLoc} определяется ${countText}.`;
};

const formatLobeNodesList = (lobe: ThyroidLobeProtocol): React.ReactNode[] => {
  const nodes = lobe.nodesList || [];
  if (!nodes.length) return [];

  return nodes.map((n: ThyroidNode, idx: number) => {
    const nodeParts: string[] = [];

    const sizes: string[] = [];
    if (n.size1?.trim()) sizes.push(n.size1.trim());
    if (n.size2?.trim()) sizes.push(n.size2.trim());
    if (sizes.length > 0) {
      const sizesText = sizes.join(" × ");
      nodeParts.push(`размерами ${sizesText} мм`);
    }

    if (n.echogenicity?.trim()) {
      nodeParts.push(`эхогенность ${n.echogenicity.toLowerCase()}`);
    }
    if (n.echostructure?.trim()) {
      nodeParts.push(`эхоструктура ${n.echostructure.toLowerCase()}`);
    }
    if (n.contour?.trim()) {
      nodeParts.push(`контур ${n.contour.toLowerCase()}`);
    }
    if (n.orientation?.trim()) {
      nodeParts.push(`ориентация ${n.orientation.toLowerCase()}`);
    }
    if (n.bloodFlow?.trim()) {
      nodeParts.push(`кровоток ${n.bloodFlow.toLowerCase()}`);
    }
    if (n.comment?.trim()) {
      nodeParts.push(n.comment.trim());
    }

    const nodeText = nodeParts.length > 0 ? nodeParts.join(", ") : "";

    return (
      <React.Fragment key={`node-${idx}`}>
        <br />
        {`Узел №${n.number}`}
        {nodeText ? `: ${nodeText}.` : "."}
      </React.Fragment>
    );
  });
};

const renderLobeBlock = (
  label: "Правая доля" | "Левая доля",
  lobe?: ThyroidLobeProtocol
) => {
  if (!lobe) return null;

  const headerRest = formatLobeHeader(label, lobe);
  const intro = formatLobeNodesIntro(label, lobe);
  const nodesList = formatLobeNodesList(lobe);

  if (!headerRest && !intro && nodesList.length === 0) return null;

  return (
    <>
      {"\n"}
      <strong>{label}:</strong>{" "}
      {headerRest}
      {intro && ` ${intro}`}
      {nodesList}
      {"\n"}
    </>
  );
};

export const ThyroidPrint: React.FC<ThyroidPrintProps> = ({ value }) => {
  const {
    rightLobe,
    leftLobe,
    isthmusSize,
    totalVolume,
    rightToLeftRatio,
    echogenicity,
    echostructure,
    contour,
    symmetry,
    position,
  } = value;

  const tailBlocks: string[] = [];

  if (isthmusSize?.trim()) {
    tailBlocks.push(`Перешеек ${isthmusSize} мм.`);
  }
  if (totalVolume?.trim()) {
    tailBlocks.push(`Общий объем железы ${totalVolume} мл.`);
  }
  if (rightToLeftRatio?.trim()) {
    tailBlocks.push(`Соотношение объема правой и левой долей ${rightToLeftRatio}.`);
  }

  const commonParts: string[] = [];
  if (echogenicity?.trim()) {
    commonParts.push(`эхогенность железы ${echogenicity.toLowerCase()}`);
  }
  if (echostructure?.trim()) {
    commonParts.push(`эхоструктура ${echostructure.toLowerCase()}`);
  }
  if (contour?.trim()) {
    commonParts.push(`контур ${contour.toLowerCase()}`);
  }
  if (symmetry?.trim()) {
    commonParts.push(`симметричность ${symmetry.toLowerCase()}`);
  }
  if (commonParts.length > 0) {
    const text = commonParts.join(", ");
    tailBlocks.push(`${text.charAt(0).toUpperCase()}${text.slice(1)}.`);
  }

  const hasAnyContent =
    position?.trim() ||
    rightLobe ||
    leftLobe ||
    tailBlocks.some((b) => b && b.trim().length > 0);

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
        <span style={{ fontWeight: 700, fontSize: "16px" }}>
          Щитовидная железа:
        </span>{" "}
        {position?.trim() &&
          (position === "обычное"
            ? "определяется в обычном положении."
            : `положение ${position.toLowerCase()}.`)}
        {renderLobeBlock("Правая доля", rightLobe)}
        {renderLobeBlock("Левая доля", leftLobe)}
        {tailBlocks.length > 0 && (
          <>
            {"\n"}
            {tailBlocks.join(" ")}
          </>
        )}
      </p>
    </div>
  );
};

export default ThyroidPrint;
