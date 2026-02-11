// /components/print/organs/SalivaryGlandsPrint.tsx
import React from "react";
import type { SalivaryGlandsProtocol, SalivaryGlandProtocol } from "@types";

export interface SalivaryGlandsPrintProps {
  value: SalivaryGlandsProtocol;
}

const glandTitleByKey: Record<string, string> = {
  parotidRight: "Правая околоушная железа",
  parotidLeft: "Левая околоушная железа",
  submandibularRight: "Правая подчелюстная железа",
  submandibularLeft: "Левая подчелюстная железа",
  sublingualRight: "Правая подъязычная железа",
  sublingualLeft: "Левая подъязычная железа",
};

const glandGenitiveByKey: Record<string, string> = {
  parotidRight: "правой околоушной железы",
  parotidLeft: "левой околоушной железы",
  submandibularRight: "правой подчелюстной железы",
  submandibularLeft: "левой подчелюстной железы",
  sublingualRight: "правой подъязычной железы",
  sublingualLeft: "левой подъязычной железы",
};

const ductNameByKey: Record<string, string> = {
  parotidRight: "Stensen duct",
  parotidLeft: "Stensen duct",
  submandibularRight: "Wharton duct",
  submandibularLeft: "Wharton duct",
  sublingualRight: "",
  sublingualLeft: "",
};

const hasRequiredSizes = (
  glandData: SalivaryGlandProtocol,
  showDepth: boolean
): boolean => {
  const hasLength = Boolean(glandData.length?.trim());
  const hasWidth = Boolean(glandData.width?.trim());
  const hasDepth = Boolean(glandData.depth?.trim());
  return showDepth ? hasLength && hasWidth && hasDepth : hasLength && hasWidth;
};

const withCapitalFirst = (text: string): string => {
  const normalized = text.trim();
  if (!normalized) return "";
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
};

const formatLymphNodes = (
  glandName: string,
  glandData: SalivaryGlandProtocol
): string | null => {
  if (glandData.lymphNodes?.detected !== "detected") return null;

  const nodesCount = glandData.lymphNodes.nodes.length;
  const verb = nodesCount === 1 ? "определяется" : "определяются";
  const noun =
    nodesCount % 10 === 1 && nodesCount % 100 !== 11
      ? "лимфоузел"
      : nodesCount % 10 >= 2 &&
          nodesCount % 10 <= 4 &&
          !(nodesCount % 100 >= 12 && nodesCount % 100 <= 14)
        ? "лимфоузла"
        : "лимфоузлов";

  if (nodesCount === 0) {
    return `В проекции ${glandGenitiveByKey[glandName] ?? glandName} определяются лимфоузлы`;
  }

  const nodesText = glandData.lymphNodes.nodes
    .map((node, index) => {
      const parts: string[] = [];
      const sizes = [node.size1, node.size2].filter(Boolean).join(" x ");
      if (sizes) parts.push(`Размеры ${sizes} мм`);
      if (node.echogenicity) parts.push(`Эхогенность ${node.echogenicity}`);
      if (node.echostructure) parts.push(`Эхоструктура ${node.echostructure}`);
      if (node.contour) parts.push(`Контур ${node.contour}`);
      if (node.bloodFlow) parts.push(`Кровоток ${node.bloodFlow}`);
      return `Узел №${index + 1}: ${parts.join(". ")}`;
    })
    .join("\n");

  return `В проекции ${glandGenitiveByKey[glandName] ?? glandName} ${verb} ${nodesCount} ${noun}:\n${nodesText}`;
};

const formatGlandContent = (
  glandName: string,
  glandData: SalivaryGlandProtocol,
  showDepth: boolean
): React.ReactNode => {
  if (!hasRequiredSizes(glandData, showDepth)) return null;

  const sizeParts = [
    glandData.length,
    glandData.width,
    showDepth ? glandData.depth : "",
  ].filter(Boolean);

  const glandParts: string[] = [];
  glandParts.push(`Размеры ${sizeParts.join(" x ")} мм`);
  if (showDepth && glandData.volume?.trim()) {
    glandParts.push(`Объем ${glandData.volume.trim()} мл`);
  }
  glandParts.push(`Эхогенность ${glandData.echogenicity}`);
  glandParts.push(`Эхоструктура ${glandData.echostructure}`);
  glandParts.push(`Контур ${glandData.contour}`);
  if (
    glandData.ducts === "расширены" &&
    glandData.ductDiameter?.trim() &&
    ductNameByKey[glandName]
  ) {
    glandParts.push(
      `Выводной проток (${ductNameByKey[glandName]}) расширен до ${glandData.ductDiameter.trim()} мм`
    );
  } else {
    glandParts.push(`Протоки ${glandData.ducts}`);
  }
  glandParts.push(`Кровоток ${glandData.bloodFlow}`);
  if (
    glandData.volumeFormations === "определяются" &&
    glandData.volumeFormationsDescription?.trim()
  ) {
    glandParts.push(withCapitalFirst(glandData.volumeFormationsDescription));
  }

  const lymphNodesText = formatLymphNodes(glandName, glandData);

  return (
    <>
      <strong>{glandTitleByKey[glandName] ?? glandName}:</strong> {glandParts.join(". ")}.
      {lymphNodesText && (
        <>
          {" "}
          {lymphNodesText}.
        </>
      )}
      {glandData.additionalFindings && glandData.additionalFindings.trim() && (
        <>
          {" "}
          <strong>Дополнительно:</strong> {glandData.additionalFindings.trim()}.
        </>
      )}
      {"\n"}
    </>
  );
};

export const SalivaryGlandsPrint: React.FC<SalivaryGlandsPrintProps> = ({
  value,
}) => {
  const {
    parotidRight,
    parotidLeft,
    submandibularRight,
    submandibularLeft,
    sublingualRight,
    sublingualLeft,
  } = value;

  const items = [
    { key: "parotidRight", node: formatGlandContent("parotidRight", parotidRight, true) },
    { key: "parotidLeft", node: formatGlandContent("parotidLeft", parotidLeft, true) },
    {
      key: "submandibularRight",
      node: formatGlandContent("submandibularRight", submandibularRight, true),
    },
    {
      key: "submandibularLeft",
      node: formatGlandContent("submandibularLeft", submandibularLeft, true),
    },
    {
      key: "sublingualRight",
      node: formatGlandContent("sublingualRight", sublingualRight, false),
    },
    {
      key: "sublingualLeft",
      node: formatGlandContent("sublingualLeft", sublingualLeft, false),
    },
  ].filter((item) => Boolean(item.node));

  if (items.length === 0) return null;

  return (
    <div
      style={{
        fontSize: "14px",
        lineHeight: 1.5,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <p style={{ margin: 0, whiteSpace: "pre-line" }}>
        {items.map((item) => (
          <React.Fragment key={item.key}>{item.node}</React.Fragment>
        ))}
      </p>
    </div>
  );
};

export default SalivaryGlandsPrint;
