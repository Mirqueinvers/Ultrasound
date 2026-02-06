// /components/print/organs/PleuralPrint.tsx
import React from "react";
import type {
  PleuralProtocol,
  PleuralSideProtocol,
  PleuralFormation,
} from "@types";

export interface PleuralPrintProps {
  value: PleuralProtocol;
}

const formatSideContent = (
  side: "right" | "left",
  sideData?: PleuralSideProtocol
): React.ReactNode => {
  if (!sideData) return null;

  const sideLabel = side === "right" ? "Правая" : "Левая";
  const hasPresence = sideData.presence && sideData.presence !== "отсутствует";
  const hasFormations = sideData.formationsList && sideData.formationsList.length > 0;

  if (!hasPresence && !hasFormations) return null;

  return (
    <>
      <strong>{sideLabel} плевральная полость:</strong>{" "}
      {hasPresence && (
        <>
          содержимое {sideData.presence}
          {sideData.amount && ` в количестве ${sideData.amount}`}
          {sideData.character && `, характер ${sideData.character.toLowerCase()}`}
          .
        </>
      )}
      
      {hasFormations && (
        <>
          {hasPresence && " "}
          <strong>Образования:</strong>{" "}
          {sideData.formationsList.map((formation, index) => {
            const formationParts: string[] = [];
            
            // Размеры
            if (formation.size1 || formation.size2) {
              const sizes = [formation.size1, formation.size2].filter(Boolean).join(" × ");
              formationParts.push(`размерами ${sizes} мм`);
            }
            
            // Эхогенность
            if (formation.echogenicity) {
              formationParts.push(formation.echogenicity.toLowerCase());
            }
            
            // Локализация
            if (formation.location) {
              formationParts.push(`локализация: ${formation.location.toLowerCase()}`);
            }
            
            // Подвижность
            if (formation.mobility) {
              formationParts.push(`подвижность ${formation.mobility.toLowerCase()}`);
            }
            
            // Васкуляризация
            if (formation.vascularization) {
              formationParts.push(`васкуляризация ${formation.vascularization.toLowerCase()}`);
            }
            
            // Комментарий
            if (formation.comment) {
              formationParts.push(formation.comment);
            }
            
            const formationText = formationParts.length > 0 
              ? formationParts.join(", ") + "."
              : "";
              
            return (
              <React.Fragment key={`formation-${index}`}>
                <br />
                {`Образование №${formation.number}`}
                {formationText && `: ${formationText}`}
              </React.Fragment>
            );
          })}
        </>
      )}
      {"\n"}
    </>
  );
};

export const PleuralPrint: React.FC<PleuralPrintProps> = ({ value }) => {
  const {
    rightSide,
    leftSide,
    pleuralThickening,
    pleuralCalcification,
    adhesions,
    pneumothorax,
    diaphragmMobility,
    additionalFindings,
  } = value;

  const commonParts: string[] = [];

  if (pleuralThickening && pleuralThickening !== "не определяется") {
    commonParts.push(`утолщение плевры ${pleuralThickening.toLowerCase()}`);
  }

  if (pleuralCalcification && pleuralCalcification !== "не определяется") {
    commonParts.push(`кальцификация плевры ${pleuralCalcification.toLowerCase()}`);
  }

  if (adhesions && adhesions !== "не определяются") {
    commonParts.push(`спаечный процесс ${adhesions.toLowerCase()}`);
  }

  if (pneumothorax && pneumothorax !== "не определяется") {
    commonParts.push(`пневмоторакс ${pneumothorax.toLowerCase()}`);
  }

  if (diaphragmMobility && diaphragmMobility !== "сохранена") {
    commonParts.push(`подвижность диафрагмы ${diaphragmMobility.toLowerCase()}`);
  }

  const hasContent =
    rightSide ||
    leftSide ||
    commonParts.length > 0 ||
    (additionalFindings && additionalFindings.trim());

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
          Плевральные полости:
        </span>{" "}
        {formatSideContent("right", rightSide)}
        {formatSideContent("left", leftSide)}
        
        {commonParts.length > 0 && (
          <>
            <strong>Общие изменения плевры:</strong>{" "}
            {commonParts.join(", ")}.
            {"\n"}
          </>
        )}
        
        {additionalFindings && additionalFindings.trim() && (
          <>
            <strong>Дополнительные находки:</strong> {additionalFindings.trim()}
            {"\n"}
          </>
        )}
      </p>
    </div>
  );
};

export default PleuralPrint;