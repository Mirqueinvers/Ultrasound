import React from "react";
import type { UterusNode, UterusProtocol } from "@types";

export interface UterusPrintProps {
  value: UterusProtocol;
}

const ensurePeriod = (text: string): string => {
  const trimmed = text.trim();
  if (!trimmed) return "";
  return /[.!?]$/u.test(trimmed) ? trimmed : `${trimmed}.`;
};

const formatWallLocation = (value: string): string => {
  switch (value) {
    case "передняя":
      return "по передней стенке матки";
    case "задняя":
      return "по задней стенке матки";
    case "правая боковая":
      return "по правой боковой стенке матки";
    case "левая боковая":
      return "по левой боковой стенке матки";
    case "дно":
      return "в области дна матки";
    default:
      return value;
  }
};

const formatLayerType = (value: string): string => {
  switch (value) {
    case "интрамуральная":
      return "интрамуральный";
    case "субсерозная":
      return "субсерозный";
    case "субмукозная":
      return "субмукозный";
    case "интралигаментарная":
      return "интралигаментарный";
    default:
      return value;
  }
};

const formatCavityImpact = (value: string): string => {
  switch (value) {
    case "не деформирует":
      return "полость матки не деформирует";
    case "деформирует полость":
      return "деформирует полость матки";
    default:
      return value;
  }
};

const normalizeBloodFlow = (value: string): string => {
  if (value === "не усилен") return "не изменен";
  return value;
};

const formatNodeDescription = (node: UterusNode): string => {
  const parts: string[] = [];

  if (node.wallLocation) parts.push(formatWallLocation(node.wallLocation));
  if (node.layerType) parts.push(formatLayerType(node.layerType));

  const sizes = [node.size1?.trim(), node.size2?.trim()].filter(
    (item): item is string => Boolean(item)
  );
  if (sizes.length > 0) {
    parts.push(`размерами ${sizes.join(" × ")} мм`);
  }

  const contourParts = [node.contourClarity?.trim(), node.contourEvenness?.trim()].filter(
    (item): item is string => Boolean(item)
  );
  if (contourParts.length > 0) {
    parts.push(`контуры ${contourParts.join(", ")}`);
  }

  if (node.echogenicity?.trim()) {
    parts.push(node.echogenicity.trim());
  }

  if (node.structure?.trim()) {
    parts.push(`структура ${node.structure.trim()}`);
  }

  if (node.cavityImpact?.trim()) {
    parts.push(formatCavityImpact(node.cavityImpact.trim()));
  }

  if (node.bloodFlow?.trim()) {
    const bloodFlow = normalizeBloodFlow(node.bloodFlow.trim()).toLowerCase();
    parts.push(`кровоток ${bloodFlow}`);
  }

  if (node.comment?.trim()) {
    parts.push(node.comment.trim());
  }

  return parts.join(", ");
};

const formatNodesSummary = (nodes: UterusNode[]): string => {
  if (nodes.length === 1) {
    return `Определяется одиночный узел ${formatNodeDescription(nodes[0])}`;
  }

  const countedForm = nodes.length >= 2 && nodes.length <= 4 ? "узла" : "узлов";
  const items = nodes
    .map((node) => `Узел №${node.number}: ${formatNodeDescription(node)}`)
    .join(". ");

  return `Определяются ${nodes.length} ${countedForm}: ${items}`;
};

export const UterusPrint: React.FC<UterusPrintProps> = ({ value }) => {
  const {
    uterusStatus,
    length,
    width,
    apDimension,
    volume,
    shape,
    position,
    myometriumStructure,
    myometriumStructureText,
    myometriumEchogenicity,
    myomaNodesPresence,
    myomaNodesList,
    uterineCavity,
    uterineCavityText,
    endometriumSize,
    endometriumStructure,
    cervixSize,
    cervixEchostructure,
    cervixEchostructureText,
    cervicalCanal,
    cervicalCanalText,
    freeFluid,
    freeFluidText,
    additional,
  } = value;

  const infoParts: string[] = [];

  const sizeParts: string[] = [];
  if (length?.trim()) sizeParts.push(`длина ${length} мм`);
  if (width?.trim()) sizeParts.push(`ширина ${width} мм`);
  if (apDimension?.trim()) sizeParts.push(`передне-задний размер ${apDimension} мм`);
  if (volume?.trim()) sizeParts.push(`объем ${volume} см3`);
  if (sizeParts.length) infoParts.push(`Размерами: ${sizeParts.join(", ")}`);

  const formPosParts: string[] = [];
  if (shape?.trim()) formPosParts.push(`форма матки ${shape.toLowerCase()}`);
  if (position?.trim()) formPosParts.push(`положение ${position}`);
  if (formPosParts.length) {
    const text = formPosParts.join(", ");
    infoParts.push(text.charAt(0).toUpperCase() + text.slice(1));
  }

  const myometriumParts: string[] = [];
  if (myometriumStructure?.trim()) {
    let base = `структура миометрия ${myometriumStructure.toLowerCase()}`;
    if (myometriumStructure === "неоднородная" && myometriumStructureText?.trim()) {
      base += ` (${myometriumStructureText.trim()})`;
    }
    myometriumParts.push(base);
  }
  if (myometriumEchogenicity?.trim()) {
    myometriumParts.push(`эхогенность ${myometriumEchogenicity.toLowerCase()}`);
  }
  if (uterineCavity?.trim()) {
    let cavity = `полость матки ${uterineCavity.toLowerCase()}`;
    if (uterineCavity === "расширена" && uterineCavityText?.trim()) {
      cavity += `, ${uterineCavityText.trim()}`;
    }
    myometriumParts.push(cavity);
  }
  if (myometriumParts.length) {
    const text = myometriumParts.join(", ");
    infoParts.push(text.charAt(0).toUpperCase() + text.slice(1));
  }

  if (myomaNodesPresence?.trim()) {
    if (myomaNodesPresence === "не определяются") {
      infoParts.push("Объемные образования не определяются");
    } else if (myomaNodesList?.length) {
      infoParts.push(formatNodesSummary(myomaNodesList));
    } else {
      infoParts.push("Определяются объемные образования");
    }
  }

  const endometriumParts: string[] = [];
  if (endometriumSize?.trim()) {
    endometriumParts.push(`толщина эндометрия ${endometriumSize} мм`);
  }
  if (endometriumStructure?.trim()) {
    endometriumParts.push(`структура эндометрия ${endometriumStructure.toLowerCase()}`);
  }
  if (endometriumParts.length) {
    const text = endometriumParts.join(", ");
    infoParts.push(text.charAt(0).toUpperCase() + text.slice(1));
  }

  const cervixParts: string[] = [];
  if (cervixSize?.trim()) cervixParts.push(`шейка матки ${cervixSize} мм`);
  if (cervixEchostructure?.trim()) {
    let cervix = `эхоструктура шейки матки ${cervixEchostructure.toLowerCase()}`;
    if (
      cervixEchostructure === "неоднородная" &&
      cervixEchostructureText?.trim()
    ) {
      cervix += `, ${cervixEchostructureText.trim()}`;
    }
    cervixParts.push(cervix);
  }
  if (cervicalCanal?.trim()) {
    let canal = `цервикальный канал ${cervicalCanal.toLowerCase()}`;
    if (cervicalCanal === "расширен" && cervicalCanalText?.trim()) {
      canal += `, ${cervicalCanalText.trim()}`;
    }
    cervixParts.push(canal);
  }
  if (cervixParts.length) {
    const text = cervixParts.join(", ");
    infoParts.push(text.charAt(0).toUpperCase() + text.slice(1));
  }

  if (freeFluid?.trim()) {
    let fluid = `свободная жидкость в малом тазу ${freeFluid.toLowerCase()}`;
    if (freeFluid === "определяется" && freeFluidText?.trim()) {
      fluid += `, ${freeFluidText.trim()}`;
    }
    infoParts.push(fluid.charAt(0).toUpperCase() + fluid.slice(1));
  }

  if (additional?.trim()) {
    infoParts.push(ensurePeriod(additional));
  }

  if (!infoParts.length && !uterusStatus) return null;

  const sentence =
    infoParts.length > 0
      ? `${infoParts
          .map((item) => item.trim().replace(/[.!?]+$/u, ""))
          .filter(Boolean)
          .join(". ")}.`
      : "";

  const statusText =
    !uterusStatus || uterusStatus === "обычное"
      ? "определяется в обычном положении"
      : `определяется: ${uterusStatus}`;

  return (
    <div
      style={{
        fontSize: "14px",
        lineHeight: 1.5,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Матка:</span>{" "}
        {statusText}
        {sentence ? `. ${sentence}` : "."}
      </p>
    </div>
  );
};

export default UterusPrint;
