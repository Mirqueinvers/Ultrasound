// /components/print/organs/BrachioCephalicArteriesPrint.tsx
import React from "react";
import type {
  BrachioCephalicProtocol,
  ArteryProtocol,
  BrachioCephalicFormation,
} from "@types";

export interface BrachioCephalicArteriesPrintProps {
  value: BrachioCephalicProtocol;
}

const formatArteryContent = (
  arteryName: string,
  arteryData?: ArteryProtocol
): React.ReactNode => {
  if (!arteryData) return null;

  const hasPlaques = arteryData.plaquesList && arteryData.plaquesList.length > 0;
  const hasAdditionalFindings = arteryData.additionalFindings && arteryData.additionalFindings.trim();

  // Проверяем, есть ли какие-либо отклонения от нормы
  const hasDeviations = 
    arteryData.diameter !== "обычного диаметра" ||
    arteryData.wallThickness !== "обычная" ||
    arteryData.intimaMediaThickness !== "в пределах нормы" ||
    arteryData.bloodFlowVelocity !== "в пределах нормы" ||
    arteryData.resistanceIndex !== "в пределах нормы" ||
    arteryData.pulsatilityIndex !== "в пределах нормы" ||
    arteryData.stenosis !== "не определяется" ||
    arteryData.occlusion !== "не определяется";

  if (!hasDeviations && !hasPlaques && !hasAdditionalFindings) {
    return null;
  }

  const getArteryTitle = (name: string) => {
    switch (name) {
      case "commonCarotidRight":
        return "Правая ОСА";
      case "commonCarotidLeft":
        return "Левая ОСА";
      case "internalCarotidRight":
        return "Правая ВСА";
      case "internalCarotidLeft":
        return "Левая ВСА";
      case "externalCarotidRight":
        return "Правая НСА";
      case "externalCarotidLeft":
        return "Левая НСА";
      case "vertebralRight":
        return "Правая позвоночная";
      case "vertebralLeft":
        return "Левая позвоночная";
      case "subclavianRight":
        return "Правая подключичная";
      case "subclavianLeft":
        return "Левая подключичная";
      default:
        return name;
    }
  };

  return (
    <>
      <strong>{getArteryTitle(arteryName)}:</strong>{" "}
      {arteryData.diameter !== "обычного диаметра" && `${arteryData.diameter}, `}
      {arteryData.wallThickness !== "обычная" && `толщина стенки ${arteryData.wallThickness.toLowerCase()}, `}
      {arteryData.intimaMediaThickness !== "в пределах нормы" && `ИМТ ${arteryData.intimaMediaThickness.toLowerCase()}, `}
      {arteryData.bloodFlowVelocity !== "в пределах нормы" && `скорость кровотока ${arteryData.bloodFlowVelocity.toLowerCase()}, `}
      {arteryData.resistanceIndex !== "в пределах нормы" && `ИР ${arteryData.resistanceIndex.toLowerCase()}, `}
      {arteryData.pulsatilityIndex !== "в пределах нормы" && `ПИ ${arteryData.pulsatilityIndex.toLowerCase()}, `}
      {arteryData.stenosis !== "не определяется" && `стеноз ${arteryData.stenosis.toLowerCase()}, `}
      {arteryData.occlusion !== "не определяется" && `${arteryData.occlusion.toLowerCase()}. `}
      
      {hasPlaques && (
        <>
          <strong>Бляшки:</strong>{" "}
          {arteryData.plaquesList.map((plaque, index) => {
            const plaqueParts: string[] = [];
            
            if (plaque.size) {
              plaqueParts.push(`размер ${plaque.size} мм`);
            }
            if (plaque.location) {
              plaqueParts.push(`локализация: ${plaque.location.toLowerCase()}`);
            }
            if (plaque.type) {
              plaqueParts.push(plaque.type.toLowerCase());
            }
            if (plaque.stenosis) {
              plaqueParts.push(`стеноз ${plaque.stenosis.toLowerCase()}`);
            }
            
            const plaqueText = plaqueParts.length > 0 
              ? plaqueParts.join(", ") + "."
              : "";
              
            return (
              <React.Fragment key={`plaque-${index}`}>
                <br />
                {`Бляшка №${plaque.number}`}
                {plaqueText && `: ${plaqueText}`}
              </React.Fragment>
            );
          })}
        </>
      )}
      
      {hasAdditionalFindings && (
        <>
          {hasPlaques && " "}
          <strong>Дополнительные находки:</strong> {arteryData.additionalFindings.trim()}
        </>
      )}
      {"\n"}
    </>
  );
};

export const BrachioCephalicArteriesPrint: React.FC<BrachioCephalicArteriesPrintProps> = ({ value }) => {
  const {
    commonCarotidRight,
    commonCarotidLeft,
    internalCarotidRight,
    internalCarotidLeft,
    externalCarotidRight,
    externalCarotidLeft,
    vertebralRight,
    vertebralLeft,
    subclavianRight,
    subclavianLeft,
    overallFindings,
  } = value;

  const hasContent =
    commonCarotidRight ||
    commonCarotidLeft ||
    internalCarotidRight ||
    internalCarotidLeft ||
    externalCarotidRight ||
    externalCarotidLeft ||
    vertebralRight ||
    vertebralLeft ||
    subclavianRight ||
    subclavianLeft ||
    (overallFindings && overallFindings.trim());

  if (!hasContent) return null;

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
          Брахиоцефальные артерии:
        </span>{" "}
        {formatArteryContent("commonCarotidRight", commonCarotidRight)}
        {formatArteryContent("commonCarotidLeft", commonCarotidLeft)}
        {formatArteryContent("internalCarotidRight", internalCarotidRight)}
        {formatArteryContent("internalCarotidLeft", internalCarotidLeft)}
        {formatArteryContent("externalCarotidRight", externalCarotidRight)}
        {formatArteryContent("externalCarotidLeft", externalCarotidLeft)}
        {formatArteryContent("vertebralRight", vertebralRight)}
        {formatArteryContent("vertebralLeft", vertebralLeft)}
        {formatArteryContent("subclavianRight", subclavianRight)}
        {formatArteryContent("subclavianLeft", subclavianLeft)}
        
        {overallFindings && overallFindings.trim() && (
          <>
            <strong>Общие находки:</strong> {overallFindings.trim()}
            {"\n"}
          </>
        )}
      </p>
    </div>
  );
};

export default BrachioCephalicArteriesPrint;