import React from "react";

interface DynamicObpPrintProps {
  data: Record<string, any>;
}

// ---- Brain ────────────────────────────────────────

const buildLiverSection = (data: Record<string, any>) => {
  const rightParts: string[] = [];
  const leftParts: string[] = [];

  const rightLobeAP = data["liver.rightLobeAP"];
  const rightLobeCCR = data["liver.rightLobeCCR"];
  const rightLobeCVR = data["liver.rightLobeCVR"];
  const rightLobeTotal = data["liver.rightLobeTotal"];

  if (rightLobeAP?.trim()) rightParts.push(`ПЗР правой доли ${rightLobeAP} мм`);
  if (rightLobeCCR?.trim()) rightParts.push(`ККР правой доли ${rightLobeCCR} мм`);
  if (rightLobeCVR?.trim()) rightParts.push(`КВР правой доли ${rightLobeCVR} мм`);
  if (rightLobeTotal?.trim()) rightParts.push(`Сумма ККР + ПЗР ${rightLobeTotal} мм`);

  const leftLobeAP = data["liver.leftLobeAP"];
  const leftLobeCCR = data["liver.leftLobeCCR"];
  const leftLobeTotal = data["liver.leftLobeTotal"];

  if (leftLobeAP?.trim()) leftParts.push(`ПЗР левой доли ${leftLobeAP} мм`);
  if (leftLobeCCR?.trim()) leftParts.push(`ККР левой доли ${leftLobeCCR} мм`);
  if (leftLobeTotal?.trim()) leftParts.push(`Сумма ККР + ПЗР левой доли ${leftLobeTotal} мм`);

  const structParts: string[] = [];
  const focalLesionsParts: string[] = [];

  const echogenicity = data["liver.echogenicity"];
  const homogeneity = data["liver.homogeneity"];
  const contours = data["liver.contours"];
  const lowerEdgeAngle = data["liver.lowerEdgeAngle"];

  if (echogenicity?.trim()) structParts.push(`эхогенность печени ${echogenicity}`);
  if (homogeneity?.trim()) structParts.push(`эхоструктура ${homogeneity}`);
  if (contours?.trim()) structParts.push(`контур ${contours}`);
  if (lowerEdgeAngle?.trim()) structParts.push(`угол нижнего края ${lowerEdgeAngle}`);

  const focalLesionsPresence = data["liver.focalLesionsPresence"];
  const focalLesions = data["liver.focalLesions"];

  if (focalLesionsPresence?.trim()) {
    if (focalLesionsPresence === "не определяются") {
      focalLesionsParts.push("патологические очаговые образования не определяются");
    } else if (focalLesionsPresence === "определяются") {
      if (focalLesions?.trim()) {
        focalLesionsParts.push(focalLesions.trim());
      } else {
        focalLesionsParts.push("патологические очаговые образования определяются");
      }
    }
  }

  const vesselsParts: string[] = [];
  const vascularPattern = data["liver.vascularPattern"];
  const portalVeinDiameter = data["liver.portalVeinDiameter"];
  const ivc = data["liver.ivc"];

  if (vascularPattern?.trim()) vesselsParts.push(`сосудистый рисунок ${vascularPattern}`);
  if (portalVeinDiameter?.trim()) vesselsParts.push(`воротная вена ${portalVeinDiameter} мм`);
  if (ivc?.trim()) vesselsParts.push(`нижняя полая вена ${ivc} мм`);

  const additionalText = data["liver.additional"]?.trim() ?? "";

  const hasContent =
    rightParts.length > 0 ||
    leftParts.length > 0 ||
    structParts.length > 0 ||
    focalLesionsParts.length > 0 ||
    vesselsParts.length > 0 ||
    !!additionalText;

  if (!hasContent) return null;

  return (
    <div style={{ fontSize: "14px", lineHeight: 1.5, fontFamily: '"Times New Roman", Times, serif' }}>
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Печень:</span>{" "}
        {rightParts.length > 0 && <>{rightParts.join(", ")}.</>}
        {leftParts.length > 0 && (
          <>
            {rightParts.length > 0 && " "}
            {leftParts.join(", ")}.
          </>
        )}
        {structParts.length > 0 && (
          <> {(() => { const t = structParts.join(", "); return t.charAt(0).toUpperCase() + t.slice(1) + "."; })()}</>
        )}
        {focalLesionsParts.length > 0 && (
          <> {(() => { const t = focalLesionsParts.join(", "); return t.charAt(0).toUpperCase() + t.slice(1) + "."; })()}</>
        )}
        {vesselsParts.length > 0 && (
          <> {(() => { const t = vesselsParts.join(", "); return t.charAt(0).toUpperCase() + t.slice(1) + "."; })()}</>
        )}
        {additionalText && (
          <> {additionalText}{!additionalText.endsWith(".") && "."}</>
        )}
      </p>
    </div>
  );
};

// ---- Gallbladder ────────────────────────────────

const buildGallbladderSection = (data: Record<string, any>) => {
  const position = data["gb.position"];
  const additionalText = data["gb.additional"]?.trim() ?? "";

  // холецистэктомия
  if (position === "холецистэктомия") {
    const extra = additionalText
      ? `, ${additionalText.charAt(0).toLowerCase()}${additionalText.slice(1)}`
      : "";
    return (
      <div style={{ fontSize: "14px", lineHeight: 1.5, fontFamily: '"Times New Roman", Times, serif' }}>
        <p style={{ margin: 0 }}>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Желчный пузырь:</span>{" "}
          холецистэктомия{extra}.
        </p>
      </div>
    );
  }

  // Положение
  let positionTextPart = "";
  if (position === "обычное") {
    positionTextPart = "определяется в обычном положении";
  }

  // Размеры
  const sizeParts: string[] = [];
  const length = data["gb.length"];
  const width = data["gb.width"];
  const wallThickness = data["gb.wallThickness"];

  if (length?.trim()) sizeParts.push(`длина ${length} мм`);
  if (width?.trim()) sizeParts.push(`ширина ${width} мм`);
  if (wallThickness?.trim()) sizeParts.push(`толщина стенки ${wallThickness} мм`);

  // Форма
  const formParts: string[] = [];
  const shape = data["gb.shape"];
  const constriction = data["gb.constriction"];

  if (shape?.trim()) formParts.push(`форма желчного пузыря ${shape.toLowerCase()}`);
  if (constriction?.trim()) formParts.push(`определяется перетяжка в области ${constriction.toLowerCase()}`);

  // Содержимое
  const contentParts: string[] = [];
  const contentType = data["gb.contentType"];
  if (contentType?.trim()) contentParts.push(`содержимое ${contentType.toLowerCase()}`);

  // Конкременты
  const concretionsTrigger = data["gb.concretions"];
  const concretionsRawList = data["gb.concretionsList"];

  const concretionsPhrase = (() => {
    if (concretionsTrigger === "Не определяются") return "конкременты не определяются";
    if (concretionsTrigger !== "Определяются") return "";

    if (!Array.isArray(concretionsRawList) || concretionsRawList.length === 0) {
      return "конкременты определяются";
    }

    const valid = concretionsRawList.filter(
      (c: any) => (c["gb.concretionSize"]?.toString().trim()) || (c["gb.concretionPosition"]?.trim())
    );

    if (valid.length === 0) return "конкременты определяются";

    const count = valid.length;
    const positions = Array.from(
      new Set(valid.map((c) => c["gb.concretionPosition"]?.trim()).filter((p): p is string => !!p))
    );

    let posText = "";
    if (positions.length === 1) posText = `В области ${positions[0]}`;
    else if (positions.length === 2) posText = `В области ${positions[0]} и ${positions[1]}`;
    else if (positions.length >= 3) {
      const last = positions[positions.length - 1];
      const rest = positions.slice(0, -1);
      posText = `В области ${rest.join(", ")} и ${last}`;
    }

    const sizes = valid.map((c) => c["gb.concretionSize"]?.toString().trim()).filter((s): s is string => !!s);

    let sizeText = "";
    if (sizes.length === 1) sizeText = `размерами до ${sizes[0]} мм`;
    else if (sizes.length > 1) {
      const last = sizes[sizes.length - 1];
      const rest = sizes.slice(0, -1);
      sizeText = `размерами до ${rest.join(" мм, ")} мм и ${last} мм`;
    }

    if (!posText && !sizeText) return "конкременты определяются";

    const isSingle = count === 1;
    const isFew = count >= 2 && count <= 4;
    let countText = "";
    if (isSingle) countText = "гиперэхогенное образование";
    else if (isFew) countText = `${count} гиперэхогенных образования`;
    else countText = `${count} гиперэхогенных образований`;

    const verb = isSingle ? "определяется" : "определяются";
    return `${posText} ${verb} ${countText} с акустической тенью ${sizeText}`;
  })();

  // Полипы
  const polypsTrigger = data["gb.polyps"];
  const polypsRawList = data["gb.polypsList"];

  const polypsPhrase = (() => {
    if (polypsTrigger === "Не определяются") return "полипы не определяются";
    if (polypsTrigger !== "Определяются") return "";

    if (!Array.isArray(polypsRawList) || polypsRawList.length === 0) return "полипы определяются";

    const valid = polypsRawList.filter(
      (p: any) => (p["gb.polypSize"]?.toString().trim()) || (p["gb.polypPosition"]?.trim())
    );

    if (valid.length === 0) return "полипы определяются";

    const count = valid.length;

    const positions = Array.from(
      new Set(valid.map((p) => p["gb.polypPosition"]?.trim()).filter((p): p is string => !!p))
    );

    const walls = Array.from(
      new Set(valid.map((p) => p["gb.polypWall"]?.trim()).filter((w): w is string => !!w))
    );

    const sizes = valid.map((p) => p["gb.polypSize"]?.toString().trim()).filter((s): s is string => !!s);

    let posText = "";
    if (positions.length === 1) posText = `В ${positions[0]}`;
    else if (positions.length === 2) posText = `В ${positions[0]} и ${positions[1]}`;
    else if (positions.length > 2) {
      const last = positions[positions.length - 1];
      const rest = positions.slice(0, -1);
      posText = `В ${rest.join(", ")} и ${last}`;
    }

    let wallText = "";
    if (walls.length === 1) wallText = `, ${walls[0]} стенке`;
    else if (walls.length === 2) wallText = ", по передней и задней стенкам";

    let sizeText = "";
    if (sizes.length === 1) sizeText = `размерами до ${sizes[0]} мм`;
    else if (sizes.length > 1) {
      const last = sizes[sizes.length - 1];
      const rest = sizes.slice(0, -1);
      sizeText = `размерами до ${rest.join(" мм, ")} мм и ${last} мм`;
    }

    if (!posText && !sizeText) return "полипы определяются";

    const isSingle = count === 1;
    const verb = isSingle ? "определяется" : "определяются";
    const countPart = isSingle ? "гиперэхогенное образование" : `${count} гиперэхогенных образования`;
    const participlePart = isSingle
      ? "выступающее из стенки органа в просвет, неподвижное при смене положения"
      : "выступающие из стенки органа в просвет, неподвижные при смене положения";

    return `${posText}${wallText}, ${verb} ${countPart} без акустической тени, ${participlePart}, ${sizeText}`;
  })();

  // Протоки
  const ductsParts: string[] = [];
  const cysticDuct = data["gb.cysticDuct"];
  const commonBileDuct = data["gb.commonBileDuct"];

  if (cysticDuct?.trim()) ductsParts.push(`пузырный проток ${cysticDuct} мм`);
  if (commonBileDuct?.trim()) ductsParts.push(`общий желчный проток ${commonBileDuct} мм`);

  const hasAnyContent =
    !!positionTextPart ||
    sizeParts.length > 0 ||
    formParts.length > 0 ||
    contentParts.length > 0 ||
    !!concretionsPhrase ||
    !!polypsPhrase ||
    ductsParts.length > 0 ||
    !!additionalText;

  if (!hasAnyContent) return null;

  return (
    <div style={{ fontSize: "14px", lineHeight: 1.5, fontFamily: '"Times New Roman", Times, serif' }}>
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Желчный пузырь:</span>{" "}
        {positionTextPart && <>{positionTextPart}.</>}
        {sizeParts.length > 0 && <> Размерами: {sizeParts.join(", ")}.</>}
        {formParts.length > 0 && (
          <>
            {" "}
            {(() => { const t = formParts.join(", "); return t.charAt(0).toUpperCase() + t.slice(1) + ","; })()}
            {contentParts.length > 0 && ` ${contentParts.join(", ")}.`}
            {contentParts.length === 0 && "."}
          </>
        )}
        {formParts.length === 0 && contentParts.length > 0 && <> {contentParts.join(", ")}.</>}
        {concretionsPhrase && <> {concretionsPhrase}.</>}
        {polypsPhrase && <> {polypsPhrase}.</>}
        {ductsParts.length > 0 && (
          <> {(() => { const t = ductsParts.join(", "); return t.charAt(0).toUpperCase() + t.slice(1) + "."; })()}</>
        )}
        {additionalText && <> {additionalText}{!additionalText.endsWith(".") && "."}</>}
      </p>
    </div>
  );
};

// ---- Pancreas ────────────────────────────────────

const buildPancreasSection = (data: Record<string, any>) => {
  const head = data["pancreas.head"];
  const body = data["pancreas.body"];
  const tail = data["pancreas.tail"];

  const sizeParts: string[] = [];
  const notVisualizedParts: string[] = [];

  if (head?.trim()) sizeParts.push(`головка ${head} мм`);
  else notVisualizedParts.push("головки");

  if (body?.trim()) sizeParts.push(`тело ${body} мм`);
  else notVisualizedParts.push("тела");

  if (tail?.trim()) sizeParts.push(`хвост ${tail} мм`);
  else notVisualizedParts.push("хвоста");

  let visualizationPhrase = "";
  if (notVisualizedParts.length > 0) {
    if (notVisualizedParts.length === 1) {
      visualizationPhrase = `визуализация ${notVisualizedParts[0]} затруднена`;
    } else if (notVisualizedParts.length === 2) {
      visualizationPhrase = `визуализация ${notVisualizedParts[0]} и ${notVisualizedParts[1]} затруднена`;
    } else {
      const last = notVisualizedParts[notVisualizedParts.length - 1];
      const rest = notVisualizedParts.slice(0, -1);
      visualizationPhrase = `визуализация ${rest.join(", ")} и ${last} затруднена`;
    }
  }

  const structParts: string[] = [];
  const echogenicity = data["pancreas.echogenicity"];
  const echostructure = data["pancreas.echostructure"];
  const contour = data["pancreas.contour"];

  if (echogenicity?.trim()) structParts.push(`эхогенность железы ${echogenicity}`);
  if (echostructure?.trim()) structParts.push(`эхоструктура ${echostructure}`);
  if (contour?.trim()) structParts.push(`контур ${contour}`);

  const pathologicalFormations = data["pancreas.pathologicalFormations"];
  const pathologicalFormationsText = data["pancreas.pathologicalFormationsText"];

  if (pathologicalFormations?.trim()) {
    if (pathologicalFormations === "Не определяются") {
      structParts.push("патологические объемные образования не определяются");
    } else if (pathologicalFormations === "Определяются") {
      if (pathologicalFormationsText?.trim()) {
        structParts.push(pathologicalFormationsText.trim());
      } else {
        structParts.push("патологические образования определяются");
      }
    }
  }

  const wirsungParts: string[] = [];
  const wirsungDuct = data["pancreas.wirsungDuct"];
  if (wirsungDuct?.trim()) wirsungParts.push(`вирсунгов проток ${wirsungDuct} мм`);

  const additionalText = data["pancreas.additional"]?.trim() ?? "";

  const hasContent = sizeParts.length > 0 || !!visualizationPhrase || structParts.length > 0 || wirsungParts.length > 0 || !!additionalText;
  if (!hasContent) return null;

  return (
    <div style={{ fontSize: "14px", lineHeight: 1.5, fontFamily: '"Times New Roman", Times, serif' }}>
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Поджелудочная железа:</span>{" "}
        {(sizeParts.length > 0 || wirsungParts.length > 0) && (
          <>
            {sizeParts.join(", ")}
            {wirsungParts.length > 0 && `${sizeParts.length > 0 ? ", " : ""}${wirsungParts.join(", ")}`}
            {visualizationPhrase && `, ${visualizationPhrase}`}.
          </>
        )}
        {sizeParts.length === 0 && wirsungParts.length === 0 && visualizationPhrase && (
          <>{visualizationPhrase}.</>
        )}
        {structParts.length > 0 && (
          <> {(() => { const t = structParts.join(", "); return t.charAt(0).toUpperCase() + t.slice(1) + "."; })()}</>
        )}
        {additionalText && <> {additionalText}{!additionalText.endsWith(".") && "."}</>}
      </p>
    </div>
  );
};

// ---- Spleen ──────────────────────────────────────

const buildSpleenSection = (data: Record<string, any>) => {
  const position = data["spleen.position"];
  const additionalText = data["spleen.additional"]?.trim() ?? "";

  // Спленэктомия
  if (position === "спленэктомия") {
    const extra = additionalText
      ? `, ${additionalText.charAt(0).toLowerCase()}${additionalText.slice(1)}`
      : "";
    return (
      <div style={{ fontSize: "14px", lineHeight: 1.5, fontFamily: '"Times New Roman", Times, serif' }}>
        <p style={{ margin: 0 }}>
          <span style={{ fontWeight: 700, fontSize: "16px" }}>Селезенка:</span>{" "}
          спленэктомия{extra}.
        </p>
      </div>
    );
  }

  let positionTextPart = "";
  if (position === "обычное") positionTextPart = "определяется в обычном положении";

  const sizeParts: string[] = [];
  const length = data["spleen.length"];
  const width = data["spleen.width"];
  if (length?.trim()) sizeParts.push(`длина ${length} мм`);
  if (width?.trim()) sizeParts.push(`ширина ${width} мм`);

  const structParts: string[] = [];
  const echogenicity = data["spleen.echogenicity"];
  const echostructure = data["spleen.echostructure"];
  const contours = data["spleen.contours"];

  if (echogenicity?.trim()) structParts.push(`эхогенность селезенки ${echogenicity}`);
  if (echostructure?.trim()) structParts.push(`эхоструктура ${echostructure}`);
  if (contours?.trim()) structParts.push(`контуры ${contours}`);

  const pathologicalFormations = data["spleen.pathologicalFormations"];
  const pathologicalFormationsText = data["spleen.pathologicalFormationsText"];

  if (pathologicalFormations?.trim()) {
    if (pathologicalFormations === "Не определяются") {
      structParts.push("патологические объемные образования не определяются");
    } else if (pathologicalFormations === "Определяются") {
      if (pathologicalFormationsText?.trim()) {
        structParts.push(pathologicalFormationsText.trim());
      } else {
        structParts.push("патологические объемные образования определяются");
      }
    }
  }

  const vesselsParts: string[] = [];
  const splenicVein = data["spleen.splenicVein"];
  const splenicArtery = data["spleen.splenicArtery"];
  if (splenicVein?.trim()) vesselsParts.push(`селезеночная вена ${splenicVein} мм`);
  if (splenicArtery?.trim()) vesselsParts.push(`селезеночная артерия ${splenicArtery} мм`);

  const hasContent = !!positionTextPart || sizeParts.length > 0 || structParts.length > 0 || vesselsParts.length > 0 || !!additionalText;
  if (!hasContent) return null;

  return (
    <div style={{ fontSize: "14px", lineHeight: 1.5, fontFamily: '"Times New Roman", Times, serif' }}>
      <p style={{ margin: 0 }}>
        <span style={{ fontWeight: 700, fontSize: "16px" }}>Селезенка:</span>{" "}
        {positionTextPart && <>{positionTextPart}.</>}
        {sizeParts.length > 0 && <> Размерами: {sizeParts.join(", ")}.</>}
        {structParts.length > 0 && (
          <> {(() => { const t = structParts.join(", "); return t.charAt(0).toUpperCase() + t.slice(1) + "."; })()}</>
        )}
        {vesselsParts.length > 0 && (
          <> {(() => { const t = vesselsParts.join(", "); return t.charAt(0).toUpperCase() + t.slice(1) + "."; })()}</>
        )}
        {additionalText && <> {additionalText}{!additionalText.endsWith(".") && "."}</>}
      </p>
    </div>
  );
};

// ---- Free Fluid ──────────────────────────────────

const buildFreeFluidText = (data: Record<string, any>): string | null => {
  const freeFluid = data["freeFluid.freeFluid"] ?? "";
  const freeFluidDetails = data["freeFluid.freeFluidDetails"] ?? "";

  if (freeFluid === "") return null;

  let line: string;
  if (freeFluid === "определяется" && freeFluidDetails.trim().length > 0) {
    line = freeFluidDetails.trim();
  } else if (freeFluid === "определяется") {
    line = "Определяется свободная жидкость в брюшной полости.";
  } else {
    line = "Свободная жидкость в брюшной полости не определяется.";
  }

  return line;
};

// ---- Component ───────────────────────────────────

export const DynamicObpPrint: React.FC<DynamicObpPrintProps> = ({ data }) => {
  const hasData = Object.keys(data ?? {}).some((key) => {
    const val = data[key];
    if (Array.isArray(val)) return val.length > 0;
    if (typeof val === "string") return val.trim().length > 0;
    return val != null;
  });

  if (!hasData) return null;

  const liver = buildLiverSection(data);
  const gallbladder = buildGallbladderSection(data);
  const pancreas = buildPancreasSection(data);
  const spleen = buildSpleenSection(data);
  const freeFluidText = buildFreeFluidText(data);

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование органов брюшной полости
      </p>

      {liver}
      {gallbladder}
      {pancreas}
      {spleen}

      {freeFluidText && (
        <div className="mt-3">
          <span
            className="text-sm text-slate-900 whitespace-pre-wrap"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {freeFluidText}
          </span>
        </div>
      )}
    </>
  );
};

export default DynamicObpPrint;