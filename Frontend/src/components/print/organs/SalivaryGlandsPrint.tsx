// /components/print/organs/SalivaryGlandsPrint.tsx
import React from "react";
import type {
  SalivaryGlandsProtocol,
  SalivaryGlandProtocol,
  SalivaryGlandFormation,
} from "@types";

export interface SalivaryGlandsPrintProps {
  value: SalivaryGlandsProtocol;
}

const formatGlandContent = (
  glandName: string,
  glandData?: SalivaryGlandProtocol
): React.ReactNode => {
  if (!glandData) return null;

  const hasFormations = glandData.formationsList && glandData.formationsList.length > 0;
  const hasAdditionalFindings = glandData.additionalFindings && glandData.additionalFindings.trim();

  if (!hasFormations && !hasAdditionalFindings && 
      glandData.size === "обычных размеров" &&
      glandData.shape === "обычной формы" &&
      glandData.contour === "ровный, четкий" &&
      glandData.echogenicity === "обычная" &&
      glandData.echostructure === "однородная" &&
      glandData.vascularization === "обычная" &&
      glandData.ductSystem === "не расширен" &&
      glandData.stones === "не определяются") {
    return null;
  }

  const getGlandTitle = (name: string) => {
    switch (name) {
      case "parotidRight":
        return "Правая околоушная железа";
      case "parotidLeft":
        return "Левая околоушная железа";
      case "submandibularRight":
        return "Правая подчелюстная железа";
      case "submandibularLeft":
        return "Левая подчелюстная железа";
      default:
        return name;
    }
  };

  return (
    <>
      <strong>{getGlandTitle(glandName)}:</strong>{" "}
      {glandData.size !== "обычных размеров" && `${glandData.size}, `}
      {glandData.shape !== "обычной формы" && `${glandData.shape}, `}
      {glandData.contour !== "ровный, четкий" && `${glandData.contour}, `}
      {glandData.echogenicity !== "обычная" && `эхогенность ${glandData.echogenicity.toLowerCase()}, `}
      {glandData.echostructure !== "однородная" && `${glandData.echostructure.toLowerCase()}, `}
      {glandData.vascularization !== "обычная" && `васкуляризация ${glandData.vascularization.toLowerCase()}, `}
      {glandData.ductSystem !== "не расширен" && `проток ${glandData.ductSystem.toLowerCase()}, `}
      {glandData.stones !== "не определяются" && `${glandData.stones.toLowerCase()}. `}
      
      {hasFormations && (
        <>
          <strong>Образования:</strong>{" "}
          {glandData.formationsList.map((formation, index) => {
            const formationParts: string[] = [];
            
            // Размеры
            if (formation.size1 || formation.size2 || formation.size3) {
              const sizes = [formation.size1, formation.size2, formation.size3].filter(Boolean).join(" × ");
              formationParts.push(`размерами ${sizes} мм`);
            }
            
            // Эхогенность
            if (formation.echogenicity) {
              formationParts.push(formation.echogenicity.toLowerCase());
            }
            
            // Форма и контур
            if (formation.shape) {
              formationParts.push(formation.shape.toLowerCase());
            }
            if (formation.contour) {
              formationParts.push(`контур ${formation.contour.toLowerCase()}`);
            }
            
            // Локализация
            if (formation.location) {
              formationParts.push(`локализация: ${formation.location.toLowerCase()}`);
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
      
      {hasAdditionalFindings && (
        <>
          {hasFormations && " "}
          <strong>Дополнительные находки:</strong> {glandData.additionalFindings.trim()}
        </>
      )}
      {"\n"}
    </>
  );
};

export const SalivaryGlandsPrint: React.FC<SalivaryGlandsPrintProps> = ({ value }) => {
  const {
    parotidRight,
    parotidLeft,
    submandibularRight,
    submandibularLeft,
    sublingual,
    lymphNodes,
    overallFindings,
  } = value;

  const commonParts: string[] = [];

  if (sublingual && sublingual !== "обычных размеров, обычной структуры") {
    commonParts.push(`подъязычные железы ${sublingual.toLowerCase()}`);
  }

  if (lymphNodes && lymphNodes !== "не увеличены") {
    commonParts.push(`регионарные лимфоузлы ${lymphNodes.toLowerCase()}`);
  }

  const hasContent =
    parotidRight ||
    parotidLeft ||
    submandibularRight ||
    submandibularLeft ||
    commonParts.length > 0 ||
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
          Слюнные железы:
        </span>{" "}
        {formatGlandContent("parotidRight", parotidRight)}
        {formatGlandContent("parotidLeft", parotidLeft)}
        {formatGlandContent("submandibularRight", submandibularRight)}
        {formatGlandContent("submandibularLeft", submandibularLeft)}
        
        {commonParts.length > 0 && (
          <>
            <strong>Подъязычные железы и лимфоузлы:</strong> {commonParts.join(", ")}.
            {"\n"}
          </>
        )}
        
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

export default SalivaryGlandsPrint;