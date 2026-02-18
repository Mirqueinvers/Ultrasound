// /components/print/organs/BrachioCephalicArteriesPrint.tsx
import React from "react";
import type { BrachioCephalicProtocol, ArteryProtocol } from "@types";

export interface BrachioCephalicArteriesPrintProps {
  value: BrachioCephalicProtocol;
}

const withUnits = (value: string, units: string): string =>
  value && value.trim() ? `${value.trim()} ${units}` : "";

const getPlaquesCountLabel = (count: number): string => {
  if (count === 1) return "Определяется одна бляшка:";
  const mod10 = count % 10;
  const mod100 = count % 100;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return `Определяются ${count} бляшки:`;
  }
  return `Определяются ${count} бляшек:`;
};

const formatWall = (wall: string): string => {
  if (wall === "циркулярная") return "циркулярно";
  if (wall.startsWith("по ")) return `${wall} стенке`;
  return wall;
};

const formatLocalizationSegment = (segment: string): string => {
  if (segment === "проксимальный сегмент") return "в проксимальном сегменте";
  if (segment === "средний сегмент") return "в среднем сегменте";
  if (segment === "дистальный сегмент") return "в дистальном сегменте";
  return `в ${segment}`;
};

const formatStenosisDegree = (value: string): string => {
  return `степень стеноза ${value}% (по NASCET)`;
};

const formatPlaqueLine = (
  plaque: NonNullable<ArteryProtocol["plaquesList"]>[number],
  index: number
): string => {
  const number = plaque.number || index + 1;
  const parts: string[] = [];
  if (plaque.localizationSegment) parts.push(`определяется ${formatLocalizationSegment(plaque.localizationSegment)}`);
  if (plaque.wall) parts.push(formatWall(plaque.wall));
  if (plaque.thickness) parts.push(`толщина ${withUnits(plaque.thickness, "мм")}`);
  if (plaque.length) parts.push(`протяженность ${withUnits(plaque.length, "мм")}`);
  if (plaque.echostructure) parts.push(`эхоструктура ${plaque.echostructure}`);
  if (plaque.surface) parts.push(`поверхность ${plaque.surface}`);
  if (plaque.stenosisDegree) parts.push(formatStenosisDegree(plaque.stenosisDegree));
  if (plaque.velocityProximal) {
    parts.push(`ПСС проксимальнее стеноза ${withUnits(plaque.velocityProximal, "см/с")}`);
  }
  if (plaque.velocityStenosis) {
    parts.push(`ПСС в месте стеноза ${withUnits(plaque.velocityStenosis, "см/с")}`);
  }
  if (plaque.velocityDistal) {
    parts.push(`ПСС дистальнее стеноза ${withUnits(plaque.velocityDistal, "см/с")}`);
  }
  return `Бляшка №${number}: ${parts.join(", ")}.`;
};

const formatPlaques = (artery: ArteryProtocol): string => {
  const plaquesList = artery.plaquesList || [];
  if (plaquesList.length === 0) {
    return artery.plaques ? `бляшки: ${artery.plaques}` : "";
  }

  const header = getPlaquesCountLabel(plaquesList.length);
  const details = plaquesList.map((p, idx) => formatPlaqueLine(p, idx)).join("\n");
  return `${header}\n${details}`;
};

const formatSinusPlaques = (artery: ArteryProtocol): string => {
  const sinusPlaquesList = artery.sinusPlaquesList || [];
  if (sinusPlaquesList.length === 0) {
    return artery.sinusPlaques ? `бляшки ${artery.sinusPlaques}` : "";
  }

  const header = getPlaquesCountLabel(sinusPlaquesList.length);
  const details = sinusPlaquesList.map((p, idx) => formatPlaqueLine(p, idx)).join("\n");
  return `${header}\n${details}`;
};

const formatCommonCarotid = (artery: ArteryProtocol): string => {
  const parts: string[] = [];
  if (artery.vesselCourse) parts.push(`ход ${artery.vesselCourse}`);
  if (artery.diameter) parts.push(`диаметр ОСА: ${withUnits(artery.diameter, "мм")}`);
  if (artery.intimaMediaThickness) parts.push(`КИМ: ${withUnits(artery.intimaMediaThickness, "мм")}`);
  if (artery.peakSystolicVelocity) parts.push(`ПСС: ${withUnits(artery.peakSystolicVelocity, "см/с")}`);
  if (artery.endDiastolicVelocity) parts.push(`КДС: ${withUnits(artery.endDiastolicVelocity, "см/с")}`);
  if (artery.resistanceIndex) parts.push(`RI: ${artery.resistanceIndex}.`);
  const plaques = formatPlaques(artery);
  const base = parts.join(", ");
  return plaques ? (base ? `${base} ${plaques}` : plaques) : base;
};

const formatSinus = (artery: ArteryProtocol): string => {
  const parts: string[] = [];
  if (artery.sinusFlow) parts.push(`поток ${artery.sinusFlow}`);
  if (artery.sinusIntimaMediaThickness) {
    const suffix =
      artery.sinusIntimaMediaThickness === "утолщен" && artery.sinusIntimaMediaThicknessValue
        ? ` до ${withUnits(artery.sinusIntimaMediaThicknessValue, "мм")}`
        : "";
    parts.push(`КИМ ${artery.sinusIntimaMediaThickness}${suffix}`);
  }
  const sinusPlaques = formatSinusPlaques(artery);
  const base = parts.join(", ");
  const text = sinusPlaques
    ? base
      ? `${/[.!?]$/.test(base) ? base : `${base}.`} ${sinusPlaques}`
      : sinusPlaques
    : base;
  if (!text) return "";
  return /[.!?]$/.test(text) ? text : `${text}.`;
};

const formatInternalCarotid = (artery: ArteryProtocol): string => {
  const parts: string[] = [];
  if (artery.vesselCourse) parts.push(`ход ${artery.vesselCourse}`);
  if (artery.diameter) parts.push(`диаметр ВСА: ${withUnits(artery.diameter, "мм")}`);
  if (artery.peakSystolicVelocity) parts.push(`ПСС: ${withUnits(artery.peakSystolicVelocity, "см/с")}`);
  if (artery.endDiastolicVelocity) parts.push(`КДС: ${withUnits(artery.endDiastolicVelocity, "см/с")}`);
  if (artery.resistanceIndex) parts.push(`RI: ${artery.resistanceIndex}.`);
  if (artery.icaCcaRatio) parts.push(`ICA/CCA ratio: ${artery.icaCcaRatio}`);
  const plaques = formatPlaques(artery);
  const base = parts.join(", ");
  return plaques ? (base ? `${base} ${plaques}` : plaques) : base;
};

const formatExternalCarotid = (artery: ArteryProtocol): string => {
  const parts: string[] = [];
  if (artery.peakSystolicVelocity) parts.push(`ПСС: ${withUnits(artery.peakSystolicVelocity, "см/с")}`);
  if (artery.endDiastolicVelocity) parts.push(`КДС: ${withUnits(artery.endDiastolicVelocity, "см/с")}`);
  if (artery.resistanceIndex) parts.push(`RI: ${artery.resistanceIndex}.`);
  const plaques = formatPlaques(artery);
  const base = parts.join(", ");
  return plaques ? (base ? `${base} ${plaques}` : plaques) : base;
};

const formatVertebral = (artery: ArteryProtocol): string => {
  const parts: string[] = [];
  if (artery.flowDirection) parts.push(`кровоток ${artery.flowDirection}`);
  if (artery.diameter) parts.push(`диаметр ПА: ${artery.diameter.trim()}мм`);
  if (artery.peakSystolicVelocity) parts.push(`ПСС: ${withUnits(artery.peakSystolicVelocity, "см/с")}`);
  if (artery.endDiastolicVelocity) parts.push(`КДС: ${withUnits(artery.endDiastolicVelocity, "см/с")}`);
  if (artery.resistanceIndex) parts.push(`RI: ${artery.resistanceIndex}.`);
  const plaques = formatPlaques(artery);
  const base = parts.join(", ");
  return plaques ? (base ? `${base} ${plaques}` : plaques) : base;
};

const formatSubclavian = (artery: ArteryProtocol): string => {
  const parts: string[] = [];
  if (artery.vesselCourse) parts.push(`ход ${artery.vesselCourse}`);
  if (artery.flowType) parts.push(`поток ${artery.flowType}`);
  if (artery.intimaMediaThickness) {
    const kimSuffix =
      artery.intimaMediaThickness === "утолщен" && artery.intimaMediaThicknessValue
        ? ` до ${withUnits(artery.intimaMediaThicknessValue, "мм")}`
        : "";
    parts.push(`КИМ ${artery.intimaMediaThickness}${kimSuffix}`);
  }
  if (artery.peakSystolicVelocity) parts.push(`ПСС: ${withUnits(artery.peakSystolicVelocity, "см/с")}`);
  const plaques = formatPlaques(artery);
  const base = parts.join(", ");
  return plaques ? (base ? `${base}. ${plaques}` : plaques) : base;
};

type PrintRow = { title: string; body: string };

export const BrachioCephalicArteriesPrint: React.FC<BrachioCephalicArteriesPrintProps> = ({
  value,
}) => {
  const rows: PrintRow[] = [
    { title: "Правая ОСА", body: formatCommonCarotid(value.commonCarotidRight) },
    { title: "Каротидный синус справа", body: formatSinus(value.commonCarotidRight) },
    { title: "Правая ВСА", body: formatInternalCarotid(value.internalCarotidRight) },
    { title: "Правая НСА", body: formatExternalCarotid(value.externalCarotidRight) },
    { title: "Правая позвоночная артерия", body: formatVertebral(value.vertebralRight) },
    { title: "Правая подключичная артерия", body: formatSubclavian(value.subclavianRight) },
    { title: "Брахиоцефальный ствол справа", body: formatSinus(value.brachiocephalicTrunkRight) },
    { title: "Левая ОСА", body: formatCommonCarotid(value.commonCarotidLeft) },
    { title: "Каротидный синус слева", body: formatSinus(value.commonCarotidLeft) },
    { title: "Левая ВСА", body: formatInternalCarotid(value.internalCarotidLeft) },
    { title: "Левая НСА", body: formatExternalCarotid(value.externalCarotidLeft) },
    { title: "Левая позвоночная артерия", body: formatVertebral(value.vertebralLeft) },
    { title: "Левая подключичная артерия", body: formatSubclavian(value.subclavianLeft) },
    { title: "Брахиоцефальный ствол слева", body: formatSinus(value.brachiocephalicTrunkLeft) },
  ].filter((row) => row.body.trim().length > 0);

  if (value.overallFindings?.trim()) {
    rows.push({ title: "Общие находки", body: value.overallFindings.trim() });
  }

  if (rows.length === 0) return null;

  return (
    <div
      style={{
        fontSize: "14px",
        lineHeight: 1.5,
        fontFamily: '"Times New Roman", Times, serif',
      }}
    >
      <p style={{ margin: 0, whiteSpace: "pre-line" }}>
        {rows.map((row, idx) => (
          <React.Fragment key={`${row.title}-${idx}`}>
            <strong>{row.title}:</strong> {row.body}
            {idx < rows.length - 1 ? "\n" : ""}
          </React.Fragment>
        ))}
      </p>
    </div>
  );
};

export default BrachioCephalicArteriesPrint;
