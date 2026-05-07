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

const renderRegionBlock = (
  regionKey: string,
  region?: LymphNodeRegionProtocol,
): string | null => {
  if (!region) return null;

  const regionName = REGION_NAMES[regionKey] || regionKey;

  if (region.detected === "not_detected") {
    return `${regionName}: лимфатические узлы не определяются.`;
  }

  if (!region.nodes || region.nodes.length === 0) {
    return `${regionName}: лимфатические узлы определяются.`;
  }

  const leftNodes = region.nodes.filter((node) => node.side === "left");
  const rightNodes = region.nodes.filter((node) => node.side === "right");
  const sideDescriptions: string[] = [];

  if (rightNodes.length > 0) {
    const nodeDescriptions = rightNodes
      .map((node, index) => `узел ${index + 1}: ${formatNodeDescription(node)}`)
      .filter((text) => text.trim().length > 0)
      .join(" ");

    sideDescriptions.push(
      `справа ${rightNodes.length} ${pluralize(
        rightNodes.length,
        "узел",
        "узла",
        "узлов",
      )}: ${nodeDescriptions}`,
    );
  }

  if (leftNodes.length > 0) {
    const nodeDescriptions = leftNodes
      .map((node, index) => `узел ${index + 1}: ${formatNodeDescription(node)}`)
      .filter((text) => text.trim().length > 0)
      .join(" ");

    sideDescriptions.push(
      `слева ${leftNodes.length} ${pluralize(
        leftNodes.length,
        "узел",
        "узла",
        "узлов",
      )}: ${nodeDescriptions}`,
    );
  }

  return `${regionName}: ${sideDescriptions.join(" ")}`;
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

  const text = regions
    .map((region) => renderRegionBlock(region.key, region.data))
    .filter((line): line is string => Boolean(line && line.trim().length > 0))
    .join("\n");

  if (!text.trim()) return null;

  return (
    <div
      style={{
        fontSize: "14px",
        lineHeight: 1.5,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <p style={{ margin: 0, whiteSpace: "pre-line" }}>{text}</p>
    </div>
  );
};

export default LymphNodesPrint;
