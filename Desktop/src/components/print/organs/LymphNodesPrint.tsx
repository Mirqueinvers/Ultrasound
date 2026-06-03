// Frontend/src/components/print/organs/LymphNodesPrint.tsx
import React from "react";
import type {
  LymphNodesProtocol,
  LymphNodeRegionProtocol,
  LymphNodeProtocol,
} from "@types";

export interface LymphNodesPrintProps {
  value: LymphNodesProtocol;
}

const REGION_NAMES: Record<string, string> = {
  submandibular: "Поднижнечелюстные",
  cervical: "Шейные",
  subclavian: "Подключичные",
  supraclavicular: "Надключичные",
  axillary: "Подмышечные",
  inguinal: "Паховые",
};

function pluralize(count: number, one: string, few: string, many: string): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

const formatNodeDescription = (node: LymphNodeProtocol): string => {
  const parts: string[] = [];

  const sizes = [node.size1?.trim(), node.size2?.trim()].filter(Boolean) as string[];
  if (sizes.length > 0) {
    parts.push(`размер ${sizes.join(" x ")} мм`);
  }

  if (node.echogenicity?.trim()) {
    parts.push(`эхогенность ${node.echogenicity.toLowerCase()}`);
  }

  if (node.echostructure?.trim()) {
    parts.push(`эхоструктура ${node.echostructure.toLowerCase()}`);
  }

  if (node.shape?.trim()) {
    parts.push(`форма ${node.shape.toLowerCase()}`);
  }

  if (node.contour?.trim()) {
    parts.push(`контур ${node.contour.toLowerCase()}`);
  }

  if (node.bloodFlow?.trim()) {
    parts.push(`кровоток ${node.bloodFlow.toLowerCase()}`);
  }

  return parts.length > 0 ? `${parts.join(", ")}.` : "";
};

const renderSideBlock = (side: "Справа" | "Слева", nodes: LymphNodeProtocol[]): React.ReactNode | null => {
  if (nodes.length === 0) return null;

  if (nodes.length === 1) {
    const desc = formatNodeDescription(nodes[0]);
    return <>{side} определяется 1 лимфоузел: {desc}</>;
  }

  return (
    <>
      {side} определяются {nodes.length} {pluralize(nodes.length, "лимфоузел", "лимфоузла", "лимфоузлов")}:
      {nodes.map((node, index) => (
        <React.Fragment key={index}>
          <br />
          Узел №{index + 1}: {formatNodeDescription(node)}
        </React.Fragment>
      ))}
    </>
  );
};

const renderRegionBlock = (
  regionKey: string,
  region?: LymphNodeRegionProtocol,
): React.ReactNode | null => {
  if (!region) return null;

  const regionName = REGION_NAMES[regionKey] || regionKey;

  if (region.detected === "not_detected") {
    return (
      <>
        <strong>{regionName}</strong>
        {`: лимфатические узлы не определяются.`}
      </>
    );
  }

  if (!region.nodes || region.nodes.length === 0) {
    return (
      <>
        <strong>{regionName}</strong>
        {`: лимфатические узлы определяются.`}
      </>
    );
  }

  const leftNodes = region.nodes.filter((node) => node.side === "left");
  const rightNodes = region.nodes.filter((node) => node.side === "right");
  const sideBlocks: React.ReactNode[] = [];

  if (rightNodes.length > 0) {
    sideBlocks.push(renderSideBlock("Справа", rightNodes));
  }

  if (leftNodes.length > 0) {
    sideBlocks.push(renderSideBlock("Слева", leftNodes));
  }

  return (
    <>
      <strong>{regionName}</strong>
      {`: `}
      {sideBlocks.map((block, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {block}
        </React.Fragment>
      ))}
    </>
  );
};

export const LymphNodesPrint: React.FC<LymphNodesPrintProps> = ({ value }) => {
  const { submandibular, cervical, subclavian, supraclavicular, axillary, inguinal } = value;

  const regions = [
    { key: "submandibular", data: submandibular },
    { key: "cervical", data: cervical },
    { key: "subclavian", data: subclavian },
    { key: "supraclavicular", data: supraclavicular },
    { key: "axillary", data: axillary },
    { key: "inguinal", data: inguinal },
  ];

  const blocks = regions
    .map((region) => renderRegionBlock(region.key, region.data))
    .filter(Boolean);

  if (blocks.length === 0) return null;

  return (
    <div
      style={{
        fontSize: "14px",
        lineHeight: 1.5,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      {blocks.map((block, index) => (
        <p key={index} style={{ margin: "4px 0" }}>
          {block}
        </p>
      ))}
    </div>
  );
};

export default LymphNodesPrint;
