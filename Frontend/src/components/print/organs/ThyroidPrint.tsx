import React from "react";
import type {
  ThyroidProtocol,
  ThyroidLobeProtocol,
  ThyroidNode,
} from "@types";

export interface ThyroidPrintProps {
  value: ThyroidProtocol;
}

const ensureSentence = (text: string): string => {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!??]$/.test(trimmed) ? trimmed : `${trimmed}.`;
};

const formatLobeHeader = (label: string, lobe: ThyroidLobeProtocol): string => {
  const sizeParts: string[] = [];
  if (lobe.length?.trim()) sizeParts.push(`\u0434\u043b\u0438\u043d\u0430 ${lobe.length} \u043c\u043c`);
  if (lobe.width?.trim()) sizeParts.push(`\u0448\u0438\u0440\u0438\u043d\u0430 ${lobe.width} \u043c\u043c`);
  if (lobe.depth?.trim()) sizeParts.push(`\u0433\u043b\u0443\u0431\u0438\u043d\u0430 ${lobe.depth} \u043c\u043c`);

  const hasSizes = sizeParts.length > 0;
  const hasVolume = !!lobe.volume?.trim();

  if (!hasSizes && !hasVolume) return "";

  const volumeLabel =
    label === "\u041f\u0440\u0430\u0432\u0430\u044f \u0434\u043e\u043b\u044f"
      ? "\u043e\u0431\u044a\u0435\u043c \u043f\u0440\u0430\u0432\u043e\u0439 \u0434\u043e\u043b\u0438"
      : "\u043e\u0431\u044a\u0435\u043c \u043b\u0435\u0432\u043e\u0439 \u0434\u043e\u043b\u0438";

  if (hasSizes && hasVolume) {
    return `${sizeParts.join(", ")}, ${volumeLabel} ${lobe.volume} \u043c\u043b.`;
  }

  if (hasSizes) {
    return `${sizeParts.join(", ")}.`;
  }

  return `${volumeLabel} ${lobe.volume} \u043c\u043b.`;
};

const formatLobeNodesIntro = (label: string, lobe: ThyroidLobeProtocol): string => {
  const lobeLoc =
    label === "\u041f\u0440\u0430\u0432\u0430\u044f \u0434\u043e\u043b\u044f"
      ? "\u0412 \u043f\u0440\u0430\u0432\u043e\u0439 \u0434\u043e\u043b\u0435"
      : "\u0412 \u043b\u0435\u0432\u043e\u0439 \u0434\u043e\u043b\u0435";

  if (lobe.volumeFormations === "\u043d\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u044e\u0442\u0441\u044f") {
    return `${lobeLoc} \u043e\u0431\u044a\u0435\u043c\u043d\u044b\u0435 \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u044f \u043d\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u044e\u0442\u0441\u044f.`;
  }

  if (lobe.volumeFormations !== "\u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u044e\u0442\u0441\u044f") {
    return "";
  }

  const nodes = lobe.nodesList || [];
  if (nodes.length === 0) {
    return `${lobeLoc} \u043e\u0431\u044a\u0435\u043c\u043d\u044b\u0435 \u043e\u0431\u0440\u0430\u0437\u043e\u0432\u0430\u043d\u0438\u044f \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u044e\u0442\u0441\u044f.`;
  }

  const count = nodes.length;
  const countText =
    count === 1
      ? "\u043e\u0434\u0438\u043d \u0443\u0437\u0435\u043b"
      : count >= 2 && count <= 4
        ? `${count} \u0443\u0437\u043b\u0430`
        : `${count} \u0443\u0437\u043b\u043e\u0432`;

  return `${lobeLoc} \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442\u0441\u044f ${countText}.`;
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
      const sizesText = sizes.join(" \u00d7 ");
      nodeParts.push(`\u0420\u0430\u0437\u043c\u0435\u0440\u0430\u043c\u0438 ${sizesText} \u043c\u043c`);
    }

    if (n.echogenicity?.trim()) {
      nodeParts.push(capitalizeFirst(n.echogenicity.trim()));
    }

    if (n.echostructure?.trim()) {
      const es = n.echostructure.trim();
      switch (es) {
        case "\u043a\u0438\u0441\u0442\u043e\u0437\u043d\u044b\u0439":
          nodeParts.push("\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u043e\u0434\u043d\u043e\u0440\u043e\u0434\u043d\u0430\u044f");
          break;
        case "\u0441\u043f\u043e\u043d\u0433\u0438\u043e\u0437\u043d\u044b\u0439":
          nodeParts.push("\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u0441\u043f\u043e\u043d\u0433\u0438\u043e\u0437\u043d\u0430\u044f");
          break;
        case "\u043a\u0438\u0441\u0442\u043e\u0437\u043d\u043e-\u0441\u043e\u043b\u0438\u0434\u043d\u0430\u044f":
          nodeParts.push("\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u043a\u0438\u0441\u0442\u043e\u0437\u043d\u043e-\u0441\u043e\u043b\u0438\u0434\u043d\u0430\u044f");
          break;
        case "\u043f\u0440\u0435\u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e \u0441\u043e\u043b\u0438\u0434\u043d\u044b\u0439":
          nodeParts.push("\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u043f\u0440\u0435\u0438\u043c\u0443\u0449\u0435\u0441\u0442\u0432\u0435\u043d\u043d\u043e \u0441\u043e\u043b\u0438\u0434\u043d\u0430\u044f");
          break;
        case "\u0441\u043e\u043b\u0438\u0434\u043d\u044b\u0439":
          nodeParts.push("\u0421\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 \u0441\u043e\u043b\u0438\u0434\u043d\u0430\u044f");
          break;
        default:
          nodeParts.push(`\u042d\u0445\u043e\u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 ${es.toLowerCase()}`);
      }
    }

    if (n.contour?.trim()) {
      const c = n.contour.trim();
      if (c === "\u0447\u0435\u0442\u043a\u0438\u0439 \u0440\u043e\u0432\u043d\u044b\u0439") {
        nodeParts.push("\u041a\u043e\u043d\u0442\u0443\u0440 \u0447\u0435\u0442\u043a\u0438\u0439, \u0440\u043e\u0432\u043d\u044b\u0439");
      } else if (c === "\u043d\u0435 \u0447\u0435\u0442\u043a\u0438\u0439") {
        nodeParts.push("\u041a\u043e\u043d\u0442\u0443\u0440 \u043d\u0435 \u0447\u0435\u0442\u043a\u0438\u0439");
      } else if (c === "\u043d\u0435 \u0440\u043e\u0432\u043d\u044b\u0439") {
        nodeParts.push("\u041a\u043e\u043d\u0442\u0443\u0440 \u043d\u0435 \u0440\u043e\u0432\u043d\u044b\u0439");
      } else if (c === "\u044d\u043a\u0441\u0442\u0440\u0430-\u0442\u0438\u0440\u0435\u043e\u0438\u0434\u0430\u043b\u044c\u043d\u043e\u0435 \u0440\u0430\u0441\u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0435\u043d\u0438\u0435") {
        nodeParts.push("\u041e\u0442\u043c\u0435\u0447\u0430\u0435\u0442\u0441\u044f \u044d\u043a\u0441\u0442\u0440\u0430\u0442\u0438\u0440\u0435\u043e\u0438\u0434\u0430\u043b\u044c\u043d\u043e\u0435 \u0440\u0430\u0441\u043f\u0440\u043e\u0441\u0442\u0440\u0430\u043d\u0435\u043d\u0438\u0435");
      } else {
        nodeParts.push(`\u041a\u043e\u043d\u0442\u0443\u0440 ${c.toLowerCase()}`);
      }
    }

    if (n.orientation?.trim()) {
      nodeParts.push(`\u041e\u0440\u0438\u0435\u043d\u0442\u0430\u0446\u0438\u044f ${n.orientation.toLowerCase()}`);
    }

    if (n.echogenicFoci?.trim()) {
      const f = n.echogenicFoci.trim();
      if (f === "\u0430\u0440\u0442\u0435\u0444\u0430\u043a\u0442 \u0445\u0432\u043e\u0441\u0442\u0430 \u043a\u043e\u043c\u0435\u0442\u044b") {
        nodeParts.push("\u0412 \u0443\u0437\u043b\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u044e\u0442\u0441\u044f \u0432\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u044f \u043f\u043e \u0442\u0438\u043f\u0443 \u0430\u0440\u0442\u0435\u0444\u0430\u043a\u0442\u043e\u0432 \u0445\u0432\u043e\u0441\u0442\u0430 \u043a\u043e\u043c\u0435\u0442\u044b");
      } else if (f === "\u043c\u0430\u043a\u0440\u043e\u043a\u0430\u043b\u044c\u0446\u0438\u043d\u0430\u0442\u044b") {
        nodeParts.push("\u0412 \u0443\u0437\u043b\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442\u0441\u044f \u043a\u0430\u043b\u044c\u0446\u0438\u043d\u0430\u0442 \u0441 \u0432\u044b\u0440\u0430\u0436\u0435\u043d\u043d\u043e\u0439 \u0430\u043a\u0443\u0441\u0442\u0438\u0447\u0435\u0441\u043a\u043e\u0439 \u0442\u0435\u043d\u044c\u044e");
      } else if (f === "\u043f\u0435\u0440\u0438\u0444\u0435\u0440\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u043a\u0430\u043b\u044c\u0446\u0438\u043d\u0430\u0442\u044b") {
        nodeParts.push("\u0412 \u0443\u0437\u043b\u0435 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u044e\u0442\u0441\u044f \u043f\u0435\u0440\u0438\u0444\u0435\u0440\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u043a\u0430\u043b\u044c\u0446\u0438\u043d\u0430\u0442\u044b");
      } else if (f === "\u043c\u0438\u043a\u0440\u043e\u043a\u0430\u043b\u044c\u0446\u0438\u043d\u0430\u0442\u044b") {
        nodeParts.push("\u0412 \u0442\u043e\u043b\u0449\u0435 \u0443\u0437\u043b\u0430 \u0438 \u043d\u0430 \u043f\u0435\u0440\u0438\u0444\u0435\u0440\u0438\u0438 \u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u044e\u0442\u0441\u044f \u043c\u0438\u043a\u0440\u043e\u043a\u0430\u043b\u044c\u0446\u0438\u043d\u0430\u0442\u044b");
      }
    }

    if (n.bloodFlow?.trim()) {
      nodeParts.push(`\u041a\u0440\u043e\u0432\u043e\u0442\u043e\u043a ${n.bloodFlow.toLowerCase()}`);
    }

    if (n.comment?.trim()) {
      nodeParts.push(n.comment.trim());
    }

    const nodeText = nodeParts.length > 0 ? nodeParts.join(". ") + "." : "";
    const tirads = n.tiradsCategory ? ` (\u0443\u0437\u0435\u043b \u0441\u043e\u043e\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u0443\u0435\u0442 ${n.tiradsCategory})` : "";

    return (
      <React.Fragment key={`node-${idx}`}>
        <br />
        {`\u0423\u0437\u0435\u043b \u2116${n.number}`}
        {nodeText ? `: ${nodeText}${tirads}` : `.${tirads}`}
      </React.Fragment>
    );
  });
};

const capitalizeFirst = (text: string): string => text.charAt(0).toUpperCase() + text.slice(1);

const renderLobeBlock = (
  label: "\u041f\u0440\u0430\u0432\u0430\u044f \u0434\u043e\u043b\u044f" | "\u041b\u0435\u0432\u0430\u044f \u0434\u043e\u043b\u044f",
  lobe?: ThyroidLobeProtocol,
) => {
  if (!lobe) return null;

  const headerRest = formatLobeHeader(label, lobe);
  const intro = formatLobeNodesIntro(label, lobe);
  const nodesList = formatLobeNodesList(lobe);
  const additional = ensureSentence(lobe.additional || "");

  if (!headerRest && !intro && nodesList.length === 0 && !additional) return null;

  return (
    <>
      {"\n"}
      <strong>{label}:</strong>{" "}
      {headerRest}
      {intro && ` ${intro}`}
      {nodesList}
      {additional && (
        <>
          <br />
          {additional}
        </>
      )}
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
    tailBlocks.push(`\u041f\u0435\u0440\u0435\u0448\u0435\u0435\u043a ${isthmusSize} \u043c\u043c.`);
  }
  if (totalVolume?.trim()) {
    tailBlocks.push(`\u041e\u0431\u0449\u0438\u0439 \u043e\u0431\u044a\u0435\u043c \u0436\u0435\u043b\u0435\u0437\u044b ${totalVolume} \u043c\u043b.`);
  }
  if (rightToLeftRatio?.trim()) {
    tailBlocks.push(`\u0421\u043e\u043e\u0442\u043d\u043e\u0448\u0435\u043d\u0438\u0435 \u043e\u0431\u044a\u0435\u043c\u0430 \u043f\u0440\u0430\u0432\u043e\u0439 \u0438 \u043b\u0435\u0432\u043e\u0439 \u0434\u043e\u043b\u0435\u0439 ${rightToLeftRatio}.`);
  }

  const commonParts: string[] = [];
  if (echogenicity?.trim()) {
    commonParts.push(`\u044d\u0445\u043e\u0433\u0435\u043d\u043d\u043e\u0441\u0442\u044c \u0436\u0435\u043b\u0435\u0437\u044b ${echogenicity.toLowerCase()}`);
  }
  if (echostructure?.trim()) {
    commonParts.push(`\u044d\u0445\u043e\u0441\u0442\u0440\u0443\u043a\u0442\u0443\u0440\u0430 ${echostructure.toLowerCase()}`);
  }
  if (contour?.trim()) {
    commonParts.push(`\u043a\u043e\u043d\u0442\u0443\u0440 ${contour.toLowerCase()}`);
  }
  if (symmetry?.trim()) {
    commonParts.push(`\u0441\u0438\u043c\u043c\u0435\u0442\u0440\u0438\u0447\u043d\u043e\u0441\u0442\u044c ${symmetry.toLowerCase()}`);
  }
  if (commonParts.length > 0) {
    const text = commonParts.join(", ");
    tailBlocks.push(`${text.charAt(0).toUpperCase()}${text.slice(1)}.`);
  }

  const hasAnyContent = position?.trim() || rightLobe || leftLobe || tailBlocks.some((b) => b && b.trim().length > 0);

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
          {"\u0429\u0438\u0442\u043e\u0432\u0438\u0434\u043d\u0430\u044f \u0436\u0435\u043b\u0435\u0437\u0430:"}
        </span>{" "}
        {position?.trim() && (
          position === "\u043e\u0431\u044b\u0447\u043d\u043e\u0435"
            ? "\u043e\u043f\u0440\u0435\u0434\u0435\u043b\u044f\u0435\u0442\u0441\u044f \u0432 \u043e\u0431\u044b\u0447\u043d\u043e\u043c \u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0438."
            : `\u043f\u043e\u043b\u043e\u0436\u0435\u043d\u0438\u0435 ${position.toLowerCase()}.`
        )}
        {renderLobeBlock("\u041f\u0440\u0430\u0432\u0430\u044f \u0434\u043e\u043b\u044f", rightLobe)}
        {renderLobeBlock("\u041b\u0435\u0432\u0430\u044f \u0434\u043e\u043b\u044f", leftLobe)}
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
