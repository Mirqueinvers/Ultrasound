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

const formatNodeDescription = (node: LymphNodeProtocol): string => {
  const parts: string[] = [];

  // Размеры
  const sizes: string[] = [];
  if (node.size1?.trim()) sizes.push(node.size1.trim());
  if (node.size2?.trim()) sizes.push(node.size2.trim());
  if (sizes.length > 0) {
    const sizesText = sizes.join(" × ");
    parts.push(`размерами ${sizesText} мм`);
  }

  // Эхогенность
  if (node.echogenicity?.trim()) {
    parts.push(`эхогенность ${node.echogenicity.toLowerCase()}`);
  }

  // Эхоструктура
  if (node.echostructure?.trim()) {
    parts.push(`эхоструктура ${node.echostructure.toLowerCase()}`);
  }

  // Форма
  if (node.shape?.trim()) {
    parts.push(`форма ${node.shape.toLowerCase()}`);
  }

  // Контур
  if (node.contour?.trim()) {
    const c = node.contour.trim();
    if (c === "четкий ровный") {
      parts.push("контур четкий, ровный");
    } else if (c === "четкий не ровный") {
      parts.push("контур четкий, не ровный");
    } else if (c === "не четкий") {
      parts.push("контур не четкий");
    } else {
      parts.push(`контур ${c.toLowerCase()}`);
    }
  }

  // Кровоток
  if (node.bloodFlow?.trim()) {
    parts.push(`кровоток ${node.bloodFlow.toLowerCase()}`);
  }

  return parts.length > 0 ? parts.join(", ") + "." : "";
};

const renderRegionBlock = (
  regionKey: string,
  region?: LymphNodeRegionProtocol,
) => {
  if (!region) return null;

  const regionName = REGION_NAMES[regionKey] || regionKey;

  // Если не определяются
  if (region.detected === "not_detected") {
    return (
      <React.Fragment key={regionKey}>
        {"\n"}
        <strong>{regionName}:</strong> лимфатические узлы не определяются.
      </React.Fragment>
    );
  }

  // Если определяются, но список пуст
  if (!region.nodes || region.nodes.length === 0) {
    return (
      <React.Fragment key={regionKey}>
        {"\n"}
        <strong>{regionName}:</strong> лимфатические узлы определяются.
      </React.Fragment>
    );
  }

  // Группируем узлы по сторонам
  const leftNodes = region.nodes.filter((n) => n.side === "left");
  const rightNodes = region.nodes.filter((n) => n.side === "right");

  const sideParts: React.ReactNode[] = []; // Изменено на React.ReactNode[]

  if (rightNodes.length > 0) {
    const countText =
      rightNodes.length === 1
        ? "лимфоузел"
        : rightNodes.length >= 2 && rightNodes.length <= 4
        ? "лимфоузла"
        : "лимфоузлов";

    const nodeDescriptions = rightNodes.map((node, idx) => {
      const desc = formatNodeDescription(node);
      return (
        <React.Fragment key={`right-${idx}`}>
          <br />
          {`№${idx + 1}: ${desc}`}
        </React.Fragment>
      );
    });

    sideParts.push(
      <React.Fragment key="right-group">
        {`Справа определяется ${rightNodes.length} ${countText}:`}
        {nodeDescriptions}
      </React.Fragment>,
    );
  }

  if (leftNodes.length > 0) {
    const countText =
      leftNodes.length === 1
        ? "лимфоузел"
        : leftNodes.length >= 2 && leftNodes.length <= 4
        ? "лимфоузла"
        : "лимфоузлов";

    const nodeDescriptions = leftNodes.map((node, idx) => {
      const desc = formatNodeDescription(node);
      return (
        <React.Fragment key={`left-${idx}`}>
          <br />
          {`№${idx + 1}: ${desc}`}
        </React.Fragment>
      );
    });

    sideParts.push(
      <React.Fragment key="left-group">
        {sideParts.length > 0 && <br />}
        {`Слева определяется ${leftNodes.length} ${countText}:`}
        {nodeDescriptions}
      </React.Fragment>,
    );
  }

  return (
    <React.Fragment key={regionKey}>
      {"\n"}
      <strong>{regionName}:</strong> {sideParts}
    </React.Fragment>
  );
};

export const LymphNodesPrint: React.FC<LymphNodesPrintProps> = ({ value }) => {
  const {
    submandibular,
    cervical,
    subclavian,
    supraclavicular,
    axillary,
    inguinal,
  } = value;

  const regions = [
    { key: "submandibular", data: submandibular },
    { key: "cervical", data: cervical },
    { key: "subclavian", data: subclavian },
    { key: "supraclavicular", data: supraclavicular },
    { key: "axillary", data: axillary },
    { key: "inguinal", data: inguinal },
  ];

  const hasAnyContent = regions.some((r) => {
    if (!r.data) return false;
    
    // Если регион не определяется, считаем что есть содержимое
    if (r.data.detected === "not_detected") return true;
    
    // Если есть узлы, считаем что есть содержимое
    if (r.data.nodes && r.data.nodes.length > 0) return true;
    
    return false;
  });

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
        {regions.map((r) => renderRegionBlock(r.key, r.data))}
      </p>
    </div>
  );
};

export default LymphNodesPrint;
