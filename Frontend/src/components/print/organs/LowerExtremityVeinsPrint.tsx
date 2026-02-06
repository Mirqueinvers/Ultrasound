// /components/print/organs/LowerExtremityVeinsPrint.tsx
import React from "react";
import type {
  LowerExtremityVeinsProtocol,
  DeepVeinProtocol,
  SuperficialVeinProtocol,
  VenousThrombus,
} from "@types";

export interface LowerExtremityVeinsPrintProps {
  value: LowerExtremityVeinsProtocol;
}

const formatDeepVeinContent = (
  veinName: string,
  veinData?: DeepVeinProtocol
): React.ReactNode => {
  if (!veinData) return null;

  const hasThrombus = veinData.thrombus;
  const hasAdditionalFindings = veinData.additionalFindings && veinData.additionalFindings.trim();

  // Проверяем, есть ли какие-либо отклонения от нормы
  const hasDeviations = 
    veinData.diameter !== "обычный" ||
    veinData.compressibility !== "полная" ||
    veinData.wall !== "обычная" ||
    veinData.lumen !== "свободен" ||
    veinData.flow !== "сохранен" ||
    veinData.respiratoryPhasing !== "сохранена" ||
    veinData.valves.insufficiency !== "не определяется" ||
    veinData.valves.reflux !== "не определяется";

  if (!hasDeviations && !hasThrombus && !hasAdditionalFindings) {
    return null;
  }

  const getVeinTitle = (name: string) => {
    switch (name) {
      case "femoral":
        return "бедренная вена";
      case "popliteal":
        return "подколенная вена";
      case "posteriorTibial":
        return "задняя большеберцовая вена";
      case "anteriorTibial":
        return "передняя большеберцовая вена";
      default:
        return name;
    }
  };

  return (
    <>
      <strong>{getVeinTitle(veinName)}:</strong>{" "}
      {veinData.diameter !== "обычный" && `${veinData.diameter}, `}
      {veinData.compressibility !== "полная" && `компрессируемость ${veinData.compressibility.toLowerCase()}, `}
      {veinData.wall !== "обычная" && `стенка ${veinData.wall.toLowerCase()}, `}
      {veinData.lumen !== "свободен" && `просвет ${veinData.lumen.toLowerCase()}, `}
      {veinData.flow !== "сохранен" && `кровоток ${veinData.flow.toLowerCase()}, `}
      {veinData.respiratoryPhasing !== "сохранена" && `дыхательная фазность ${veinData.respiratoryPhasing.toLowerCase()}. `}
      
      {(veinData.valves.insufficiency !== "не определяется" || veinData.valves.reflux !== "не определяется") && (
        <>
          <strong>Клапаны:</strong>{" "}
          {veinData.valves.insufficiency !== "не определяется" && `недостаточность ${veinData.valves.insufficiency.toLowerCase()}, `}
          {veinData.valves.reflux !== "не определяется" && `рефлюкс ${veinData.valves.reflux.toLowerCase()}`}
          {veinData.valves.duration && ` (${veinData.valves.duration} сек)`}
          .
        </>
      )}
      
      {hasThrombus && veinData.thrombus && (
        <>
          <strong>Тромб:</strong>{" "}
          {veinData.thrombus.size && `размер ${veinData.thrombus.size} мм, `}
          {veinData.thrombus.location && `локализация: ${veinData.thrombus.location.toLowerCase()}, `}
          {veinData.thrombus.type && `${veinData.thrombus.type.toLowerCase()}, `}
          {veinData.thrombus.age && `${veinData.thrombus.age.toLowerCase()}`}
          {veinData.thrombus.comment && ` - ${veinData.thrombus.comment.toLowerCase()}`}
          .
        </>
      )}
      
      {hasAdditionalFindings && (
        <>
          {hasThrombus && " "}
          <strong>Дополнительные находки:</strong> {veinData.additionalFindings.trim()}
        </>
      )}
      {"\n"}
    </>
  );
};

const formatSuperficialVeinContent = (
  veinName: string,
  veinData?: SuperficialVeinProtocol
): React.ReactNode => {
  if (!veinData) return null;

  const hasThrombus = veinData.thrombosis;
  const hasAdditionalFindings = veinData.additionalFindings && veinData.additionalFindings.trim();

  // Проверяем, есть ли какие-либо отклонения от нормы
  const hasDeviations = 
    veinData.diameter !== "обычный" ||
    veinData.wall !== "обычная" ||
    veinData.lumen !== "свободен" ||
    veinData.flow !== "сохранен" ||
    veinData.perforators !== "не изменены" ||
    veinData.valves.insufficiency !== "не определяется" ||
    veinData.valves.reflux !== "не определяется";

  if (!hasDeviations && !hasThrombus && !hasAdditionalFindings) {
    return null;
  }

  const getVeinTitle = (name: string) => {
    switch (name) {
      case "greatSaphenous":
        return "большая подкожная вена (БПВ)";
      case "smallSaphenous":
        return "малая подкожная вена (МПВ)";
      default:
        return name;
    }
  };

  return (
    <>
      <strong>{getVeinTitle(veinName)}:</strong>{" "}
      {veinData.diameter !== "обычный" && `${veinData.diameter}, `}
      {veinData.wall !== "обычная" && `стенка ${veinData.wall.toLowerCase()}, `}
      {veinData.lumen !== "свободен" && `просвет ${veinData.lumen.toLowerCase()}, `}
      {veinData.flow !== "сохранен" && `кровоток ${veinData.flow.toLowerCase()}, `}
      {veinData.perforators !== "не изменены" && `перфорантные вены ${veinData.perforators.toLowerCase()}. `}
      
      {(veinData.valves.insufficiency !== "не определяется" || veinData.valves.reflux !== "не определяется") && (
        <>
          <strong>Клапаны:</strong>{" "}
          {veinData.valves.insufficiency !== "не определяется" && `недостаточность ${veinData.valves.insufficiency.toLowerCase()}, `}
          {veinData.valves.reflux !== "не определяется" && `рефлюкс ${veinData.valves.reflux.toLowerCase()}`}
          {veinData.valves.duration && ` (${veinData.valves.duration} сек)`}
          .
        </>
      )}
      
      {hasThrombus && veinData.thrombosis && (
        <>
          <strong>Тромбоз:</strong>{" "}
          {veinData.thrombosis.size && `размер ${veinData.thrombosis.size} мм, `}
          {veinData.thrombosis.location && `локализация: ${veinData.thrombosis.location.toLowerCase()}, `}
          {veinData.thrombosis.type && `${veinData.thrombosis.type.toLowerCase()}, `}
          {veinData.thrombosis.age && `${veinData.thrombosis.age.toLowerCase()}`}
          {veinData.thrombosis.comment && ` - ${veinData.thrombosis.comment.toLowerCase()}`}
          .
        </>
      )}
      
      {hasAdditionalFindings && (
        <>
          {hasThrombus && " "}
          <strong>Дополнительные находки:</strong> {veinData.additionalFindings.trim()}
        </>
      )}
      {"\n"}
    </>
  );
};

export const LowerExtremityVeinsPrint: React.FC<LowerExtremityVeinsPrintProps> = ({ value }) => {
  const {
    rightDeepVeins,
    leftDeepVeins,
    rightSuperficialVeins,
    leftSuperficialVeins,
    overallFindings,
  } = value;

  const hasContent =
    rightDeepVeins ||
    leftDeepVeins ||
    rightSuperficialVeins ||
    leftSuperficialVeins ||
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
          Вены нижних конечностей:
        </span>{" "}
        
        <strong>Глубокие вены правой ноги:</strong>{" "}
        {formatDeepVeinContent("femoral", rightDeepVeins.femoral)}
        {formatDeepVeinContent("popliteal", rightDeepVeins.popliteal)}
        {formatDeepVeinContent("posteriorTibial", rightDeepVeins.posteriorTibial)}
        
        <strong>Глубокие вены левой ноги:</strong>{" "}
        {formatDeepVeinContent("femoral", leftDeepVeins.femoral)}
        {formatDeepVeinContent("popliteal", leftDeepVeins.popliteal)}
        {formatDeepVeinContent("posteriorTibial", leftDeepVeins.posteriorTibial)}
        
        <strong>Поверхностные вены правой ноги:</strong>{" "}
        {formatSuperficialVeinContent("greatSaphenous", rightSuperficialVeins.greatSaphenous)}
        {formatSuperficialVeinContent("smallSaphenous", rightSuperficialVeins.smallSaphenous)}
        
        <strong>Поверхностные вены левой ноги:</strong>{" "}
        {formatSuperficialVeinContent("greatSaphenous", leftSuperficialVeins.greatSaphenous)}
        {formatSuperficialVeinContent("smallSaphenous", leftSuperficialVeins.smallSaphenous)}
        
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

export default LowerExtremityVeinsPrint;