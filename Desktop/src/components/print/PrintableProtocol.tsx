import React from "react";
import { useResearch } from "@contexts";
import { useAuth } from "@/contexts/useAuth";
import { usePrintableOverrides } from "@/hooks";
import ResearchPrintHeader from "@components/print/ResearchPrintHeader";
import ObpPrint from "@/components/print/researches/ObpPrint";
import KidneysPrint from "@/components/print/researches/KidneysPrint";
import UrinaryBladderStudyPrint from "@/components/print/researches/UrinaryBladderStudyPrint";
import ConclusionPrint from "@/components/print/ConclusionPrint";
import OmtFemalePrint from "@/components/print/researches/OmtFemalePrint";
import OmtMalePrint from "@/components/print/researches/OmtMalePrint";
import ThyroidResearchPrint from "@/components/print/researches/ThyroidPrint";
import BreastResearchPrint from "@/components/print/researches/BreastPrint";
import ScrotumResearchPrint from "@/components/print/researches/ScrotumPrint";
import ChildDispensaryPrint from "@/components/print/researches/ChildDispensaryPrint";
import SoftTissuePrint from "@/components/print/researches/SoftTissuePrint";
import LymphNodesResearchPrint from "@/components/print/researches/LymphNodesPrint";
import PleuralResearchPrint from "@/components/print/researches/PleuralPrint";
import SalivaryGlandsResearchPrint from "@/components/print/researches/SalivaryGlandsPrint";
import BrachioCephalicArteriesResearchPrint from "@/components/print/researches/BrachioCephalicArteriesPrint";
import LowerExtremityVeinsResearchPrint from "@/components/print/researches/LowerExtremityVeinsPrint";
import { STUDY_KEYS } from "@/domain/studyKeys";
import {
  normalizeEditableText,
  hasVisibleHtmlContent,
  bodyOverrideKey,
  conclusionOverrideKey,
  recommendationOverrideKey,
  type PrintOverrideMap,
} from "@/utils/printHelpers";
import type {
  ObpProtocol,
  KidneyStudyProtocol,
  UrinaryBladderStudyProtocol,
  OmtFemaleProtocol,
  OmtMaleProtocol,
  ThyroidStudyProtocol,
  PleuralStudyProtocol,
  SalivaryGlandsStudyProtocol,
  BrachioCephalicArteriesStudyProtocol,
  LowerExtremityVeinsStudyProtocol,
  BreastStudyProtocol,
  ScrotumProtocol,
  ChildDispensaryProtocol,
  SoftTissueProtocol,
  LymphNodesStudyProtocol,
} from "@types";

type BlockId =
  | "header"
  | "obp"
  | "thyroid"
  | "pleural"
  | "salivaryGlands"
  | "brachioCephalicArteries"
  | "lowerExtremityVeins"
  | "breast"
  | "scrotum"
  | "omtFemale"
  | "omtMale"
  | "kidneys"
  | "bladder"
  | "childDispensary"
  | "softTissue"
  | "lymphNodes"
  | "conclusion";

interface ResearchBlock {
  id: BlockId;
  element: React.ReactNode;
}

interface StudyDefinition {
  id: Exclude<BlockId, "header" | "conclusion">;
  key: string;
  label: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- данные исследования на печати динамические (любой протокол)
  studyData: any;
  conclusion: string;
  recommendations: string;
  element: React.ReactNode;
}

interface StudyConclusionSection {
  key: string;
  label: string;
  conclusion: string;
  recommendations: string;
}


export interface PrintableProtocolHandle {
  saveOverrides: () => void;
  getPrintRoot: () => HTMLElement | null;
}

interface PrintableProtocolProps {
  editMode?: boolean;
  onSave?: () => void;
  onReady?: () => void;
  researchId?: string | null;
}

const PrintableProtocol = React.forwardRef<PrintableProtocolHandle, PrintableProtocolProps>((props, ref) => {
  const { editMode } = props;
  const { studiesData } = useResearch();
  const { user } = useAuth();

  const [sourceBlockHtml, setSourceBlockHtml] = React.useState<Record<string, string>>({});
  const lastCapturedHtmlRef = React.useRef<string>("");
  
  const [appliedOverrides, setAppliedOverrides] = React.useState<PrintOverrideMap>({});

  const obpData = studiesData[STUDY_KEYS.OBP];
  const kidneysData = studiesData[STUDY_KEYS.KIDNEYS];
  const bladderStudyData = studiesData[STUDY_KEYS.URINARY_BLADDER];
  const omtFemaleData = studiesData[STUDY_KEYS.OMT_FEMALE];
  const omtMaleData = studiesData[STUDY_KEYS.OMT_MALE];
  const thyroidData = studiesData[STUDY_KEYS.THYROID];
  const pleuralData = studiesData[STUDY_KEYS.PLEURAL];
  const salivaryData = studiesData[STUDY_KEYS.SALIVARY_GLANDS];
  const brachioData = studiesData[STUDY_KEYS.BCA];
  const lowerExtremityVeinsData = studiesData[STUDY_KEYS.LOWER_EXTREMITY_VEINS];
  const breastData = studiesData[STUDY_KEYS.BREAST];
  const scrotumData = studiesData[STUDY_KEYS.SCROTUM];
  const childDispensaryData = studiesData[STUDY_KEYS.CHILD_DISPENSARY];
  const softTissueData = studiesData[STUDY_KEYS.SOFT_TISSUE];
  const lymphNodesData =
    studiesData[STUDY_KEYS.LYMPH_NODES] ||
    // legacy-алиасы: совместимость со старыми сохранёнными протоколами
    studiesData[STUDY_KEYS.LYMPH_NODES_ALT] ||
    studiesData["lymphNodes"];

  const obpProtocol = obpData as ObpProtocol | undefined;
  const kidneysProtocol = kidneysData as KidneyStudyProtocol | undefined;
  const bladderStudyProtocol = bladderStudyData as UrinaryBladderStudyProtocol | undefined;
  const omtFemaleProtocol = omtFemaleData as OmtFemaleProtocol | undefined;
  const omtMaleProtocol = omtMaleData as OmtMaleProtocol | undefined;
  const thyroidProtocol = thyroidData as ThyroidStudyProtocol | undefined;
  const pleuralProtocol = pleuralData as PleuralStudyProtocol | undefined;
  const salivaryProtocol = salivaryData as SalivaryGlandsStudyProtocol | undefined;
  const brachioProtocol = brachioData as BrachioCephalicArteriesStudyProtocol | undefined;
  const lowerExtremityVeinsProtocol =
    lowerExtremityVeinsData as LowerExtremityVeinsStudyProtocol | undefined;
  const breastProtocol = breastData as BreastStudyProtocol | undefined;
  const scrotumProtocol = scrotumData as ScrotumProtocol | undefined;
  const childDispensaryProtocol = childDispensaryData as ChildDispensaryProtocol | undefined;
  const softTissueProtocol = softTissueData as SoftTissueProtocol | undefined;
  const lymphNodesProtocol = lymphNodesData as LymphNodesStudyProtocol | undefined;

  const studyDefinitions = React.useMemo<StudyDefinition[]>(
    () =>
      [
        {
          id: "obp",
          key: "obp",
          label: "ОБП",
          studyData: obpProtocol,
          conclusion: obpProtocol?.conclusion || "",
          recommendations: obpProtocol?.recommendations || "",
          element: <ObpPrint obpData={obpProtocol} />,
        },
        {
          id: "kidneys",
          key: "kidneys",
          label: "Почки",
          studyData: kidneysProtocol,
          conclusion: kidneysProtocol?.conclusion || "",
          recommendations: kidneysProtocol?.recommendations || "",
          element: <KidneysPrint />,
        },
        {
          id: "bladder",
          key: "bladder",
          label: "Мочевой пузырь",
          studyData: bladderStudyProtocol,
          conclusion: bladderStudyProtocol?.conclusion || "",
          recommendations: bladderStudyProtocol?.recommendations || "",
          element: <UrinaryBladderStudyPrint />,
        },
        {
          id: "omtFemale",
          key: "omt-female",
          label: "ОМТ (Ж)",
          studyData: omtFemaleProtocol,
          conclusion: omtFemaleProtocol?.conclusion || "",
          recommendations: omtFemaleProtocol?.recommendations || "",
          element: <OmtFemalePrint />,
        },
        {
          id: "omtMale",
          key: "omt-male",
          label: "ОМТ (М)",
          studyData: omtMaleProtocol,
          conclusion: omtMaleProtocol?.conclusion || "",
          recommendations: omtMaleProtocol?.recommendations || "",
          element: <OmtMalePrint />,
        },
        {
          id: "thyroid",
          key: "thyroid",
          label: "Щитовидная железа",
          studyData: thyroidProtocol,
          conclusion: thyroidProtocol?.conclusion || "",
          recommendations: thyroidProtocol?.recommendations || "",
          element: <ThyroidResearchPrint />,
        },
        {
          id: "pleural",
          key: "pleural",
          label: "Плевральные полости",
          studyData: pleuralProtocol,
          conclusion: pleuralProtocol?.conclusion || "",
          recommendations: pleuralProtocol?.recommendations || "",
          element: <PleuralResearchPrint />,
        },
        {
          id: "salivaryGlands",
          key: "salivary-glands",
          label: "Слюнные железы",
          studyData: salivaryProtocol,
          conclusion: salivaryProtocol?.conclusion || "",
          recommendations: salivaryProtocol?.recommendations || "",
          element: <SalivaryGlandsResearchPrint />,
        },
        {
          id: "brachioCephalicArteries",
          key: "brachio-cephalic-arteries",
          label: "БЦА",
          studyData: brachioProtocol,
          conclusion: brachioProtocol?.conclusion || "",
          recommendations: brachioProtocol?.recommendations || "",
          element: <BrachioCephalicArteriesResearchPrint />,
        },
        {
          id: "lowerExtremityVeins",
          key: "lower-extremity-veins",
          label: "УВНК",
          studyData: lowerExtremityVeinsProtocol,
          conclusion: lowerExtremityVeinsProtocol?.conclusion || "",
          recommendations: lowerExtremityVeinsProtocol?.recommendations || "",
          element: <LowerExtremityVeinsResearchPrint />,
        },
        {
          id: "lymphNodes",
          key: "lymph-nodes",
          label: "Лимфатические узлы",
          studyData: lymphNodesProtocol,
          conclusion: lymphNodesProtocol?.conclusion || "",
          recommendations: lymphNodesProtocol?.recommendations || "",
          element: <LymphNodesResearchPrint />,
        },
        {
          id: "breast",
          key: "breast",
          label: "Молочные железы",
          studyData: breastProtocol,
          conclusion: breastProtocol?.conclusion || "",
          recommendations: breastProtocol?.recommendations || "",
          element: <BreastResearchPrint />,
        },
        {
          id: "scrotum",
          key: "scrotum",
          label: "Органы мошонки",
          studyData: scrotumProtocol,
          conclusion: scrotumProtocol?.conclusion || "",
          recommendations: scrotumProtocol?.recommendations || "",
          element: <ScrotumResearchPrint />,
        },
        {
          id: "childDispensary",
          key: "child-dispensary",
          label: "Детская диспансеризация",
          studyData: childDispensaryProtocol,
          conclusion: childDispensaryProtocol?.conclusion || "",
          recommendations: childDispensaryProtocol?.recommendations || "",
          element: <ChildDispensaryPrint />,
        },
        {
          id: "softTissue",
          key: "soft-tissue",
          label: "Мягких тканей",
          studyData: softTissueProtocol,
          conclusion: softTissueProtocol?.conclusion || "",
          recommendations: softTissueProtocol?.recommendations || "",
          element: <SoftTissuePrint />,
        },
      ].filter((definition) => Boolean(definition.studyData)) as StudyDefinition[],
    [
      obpProtocol,
      kidneysProtocol,
      bladderStudyProtocol,
      omtFemaleProtocol,
      omtMaleProtocol,
      thyroidProtocol,
      pleuralProtocol,
      salivaryProtocol,
      brachioProtocol,
      lowerExtremityVeinsProtocol,
      lymphNodesProtocol,
      breastProtocol,
      scrotumProtocol,
      childDispensaryProtocol,
      softTissueProtocol,
    ],
  );

  const appliedConclusionSections = React.useMemo<StudyConclusionSection[]>(
    () =>
      studyDefinitions.map((definition) => ({
        key: definition.key,
        label: definition.label,
        conclusion:
          appliedOverrides[conclusionOverrideKey(definition.key)] ??
          definition.conclusion ??
          "",
        recommendations:
          appliedOverrides[recommendationOverrideKey(definition.key)] ??
          definition.recommendations ??
          "",
      })),
    [appliedOverrides, studyDefinitions],
  );

  const doctorName = user?.name || "";

  const buildDraftOverrides = React.useCallback(
    (baseOverrides: PrintOverrideMap) => {
      const next: PrintOverrideMap = {};

      studyDefinitions.forEach((definition) => {
        const bodyKey = bodyOverrideKey(definition.id);
        next[bodyKey] = baseOverrides[bodyKey] ?? sourceBlockHtml[bodyKey] ?? "";
        next[conclusionOverrideKey(definition.key)] =
          baseOverrides[conclusionOverrideKey(definition.key)] ??
          normalizeEditableText(definition.conclusion);
        next[recommendationOverrideKey(definition.key)] =
          baseOverrides[recommendationOverrideKey(definition.key)] ??
          normalizeEditableText(definition.recommendations);
      });

      return next;
    },
    [sourceBlockHtml, studyDefinitions],
  );

  const { researchId: propsResearchId, onSave: propsOnSave, onReady: propsOnReady } = props;

  const {
    draftOverrides,
    setDraftOverrides,
    isEditMode,
    setIsEditMode,
    handleStartEditing,
    handleSaveOverrides,
    printRootRef,
  } = usePrintableOverrides({
    sourceOverrides: appliedOverrides,
    setSourceOverrides: setAppliedOverrides,
    buildDraftOverrides,
    studyDefinitions,
    researchId: propsResearchId,
    onSave: propsOnSave,
    initialEditMode: editMode ?? false,
  });

  // Храним актуальную версию handleStartEditing в ref, чтобы не добавлять
  // нестабильную функцию в зависимости эффекта (иначе ломается мемоизация).
  const handleStartEditingRef = React.useRef(handleStartEditing);

  // onReady тоже храним в ref: эффект срабатывает только по studyPages,
  // не вызывая onReady повторно при пересоздании колбэка родителем.
  const onReadyRef = React.useRef<(() => void) | undefined>(propsOnReady);
  React.useEffect(() => {
    onReadyRef.current = propsOnReady;
  });

  React.useEffect(() => {
    handleStartEditingRef.current = handleStartEditing;
  });

  const previewOverrides = isEditMode ? draftOverrides : appliedOverrides;

  React.useEffect(() => {
    if (editMode && !isEditMode) {
      handleStartEditingRef.current();
    } else if (editMode === false && isEditMode) {
      setIsEditMode(false);
    }
  }, [editMode, isEditMode, setIsEditMode]);

  /**
   * Захватывает innerHTML из скрытого source-контейнера.
   * Срабатывает на каждый рендер — это гарантирует, что после мержа данных
   * (например, импорт с флешки) превью печати получит актуальный HTML.
   * Guard через JSON.stringify предотвращает бесконечный цикл.
   * Дополнительно — отложенный захват через requestAnimationFrame и setTimeout,
   * чтобы подхватить дочерние компоненты, которые рендерятся асинхронно.
   */
  const captureSourceHtml = React.useCallback(() => {
    if (!sourceContainerRef.current) {
      return;
    }
    const sourceElements = sourceContainerRef.current.querySelectorAll<HTMLElement>(
      "[data-source-block-id]",
    );
    if (sourceElements.length === 0) {
      return;
    }
    const nextHtml: Record<string, string> = {};
    sourceElements.forEach((element) => {
      const blockId = element.dataset.sourceBlockId;
      if (!blockId) return;
      nextHtml[blockId] = element.innerHTML.trim();
    });
    const snapshot = JSON.stringify(nextHtml);
    if (snapshot !== lastCapturedHtmlRef.current) {
      lastCapturedHtmlRef.current = snapshot;
      setSourceBlockHtml(nextHtml);
    }
  }, []);

  // Синхронный захват после каждого рендера DOM
  React.useLayoutEffect(() => {
    captureSourceHtml();
  });

  // Отложенный захват после того, как браузер отрисовал кадр
  // Нужно для случаев, когда дочерние компоненты рендерятся асинхронно
  React.useEffect(() => {
    const rafId = requestAnimationFrame(() => {
      captureSourceHtml();
    });
    return () => cancelAnimationFrame(rafId);
  });

  React.useEffect(() => {
    if (Object.keys(sourceBlockHtml).length === 0) {
      return;
    }

    setDraftOverrides(buildDraftOverrides(appliedOverrides));
  }, [appliedOverrides, buildDraftOverrides, setDraftOverrides, sourceBlockHtml]);

  const studyPages = React.useMemo<ResearchBlock[][]>(() => {
    const obpDef = studyDefinitions.find((d) => d.id === "obp");
    const kidneysDef = studyDefinitions.find((d) => d.id === "kidneys");
    const otherDefs = studyDefinitions.filter((d) => d.id !== "obp" && d.id !== "kidneys");

    const pages: ResearchBlock[][] = [];

    // Если есть и ОБП, и Почки — объединяем в одну страницу
    if (obpDef && kidneysDef) {
      const obpOverrideKey = bodyOverrideKey(obpDef.id);
      const obpEditedValue = previewOverrides[obpOverrideKey];
      const obpHasOverride = Object.prototype.hasOwnProperty.call(previewOverrides, obpOverrideKey);
      const obpBody = obpHasOverride && hasVisibleHtmlContent(obpEditedValue)
        ? <div dangerouslySetInnerHTML={{ __html: obpEditedValue ?? "" }} />
        : obpDef.element;

      const kidneysOverrideKey = bodyOverrideKey(kidneysDef.id);
      const kidneysEditedValue = previewOverrides[kidneysOverrideKey];
      const kidneysHasOverride = Object.prototype.hasOwnProperty.call(previewOverrides, kidneysOverrideKey);
      const kidneysBody = kidneysHasOverride && hasVisibleHtmlContent(kidneysEditedValue)
        ? <div dangerouslySetInnerHTML={{ __html: kidneysEditedValue ?? "" }} />
        : kidneysDef.element;

      const obpSection = appliedConclusionSections.find((s) => s.key === obpDef.key);
      const kidneysSection = appliedConclusionSections.find((s) => s.key === kidneysDef.key);
      const combinedSections = [obpSection, kidneysSection].filter(Boolean) as StudyConclusionSection[];

      pages.push([
        { id: "header" as BlockId, element: <ResearchPrintHeader /> },
        { id: "obp" as BlockId, element: obpBody },
        { id: "kidneys" as BlockId, element: kidneysBody },
        {
          id: "conclusion" as BlockId,
          element: (
            <div className="print-conclusion">
              <ConclusionPrint
                value={{
                  conclusion: combinedSections.map((s) => s.conclusion).filter(Boolean).join("\n"),
                  recommendations: combinedSections.map((s) => s.recommendations).filter(Boolean).join("\n"),
                  sections: combinedSections,
                }}
              />
              {doctorName && (
                <div
                  style={{
                    marginTop: "10mm",
                    textAlign: "right",
                    fontSize: "14px",
                  }}
                >
                  Исследование проводил врач {doctorName}
                </div>
              )}
            </div>
          ),
        },
      ]);
    } else {
      // Если есть только одно из них — отдельная страница
      [obpDef, kidneysDef].filter(Boolean).forEach((def) => {
        const overrideKey = bodyOverrideKey(def!.id);
        const editedValue = previewOverrides[overrideKey];
        const hasOverride = Object.prototype.hasOwnProperty.call(previewOverrides, overrideKey);

        const bodyElement = hasOverride && hasVisibleHtmlContent(editedValue)
          ? <div dangerouslySetInnerHTML={{ __html: editedValue ?? "" }} />
          : def!.element;

        const section = appliedConclusionSections.find((s) => s.key === def!.key);

        pages.push([
          { id: "header" as BlockId, element: <ResearchPrintHeader /> },
          { id: def!.id, element: bodyElement },
          {
            id: "conclusion" as BlockId,
            element: (
              <div className="print-conclusion">
                <ConclusionPrint
                  value={{
                    conclusion: section?.conclusion || "",
                    recommendations: section?.recommendations || "",
                    sections: section ? [section] : [],
                  }}
                />
                {doctorName && (
                  <div
                    style={{
                      marginTop: "10mm",
                      textAlign: "right",
                      fontSize: "14px",
                    }}
                  >
                    Исследование проводил врач {doctorName}
                  </div>
                )}
              </div>
            ),
          },
        ]);
      });
    }

    // Остальные исследования — каждое на отдельной странице
    otherDefs.forEach((definition) => {
      const overrideKey = bodyOverrideKey(definition.id);
      const editedValue = previewOverrides[overrideKey];
      const hasOverride = Object.prototype.hasOwnProperty.call(previewOverrides, overrideKey);

      const bodyElement = hasOverride && hasVisibleHtmlContent(editedValue)
        ? <div dangerouslySetInnerHTML={{ __html: editedValue ?? "" }} />
        : definition.element;

      const section = appliedConclusionSections.find((s) => s.key === definition.key);

      pages.push([
        { id: "header" as BlockId, element: <ResearchPrintHeader /> },
        { id: definition.id, element: bodyElement },
        {
          id: "conclusion" as BlockId,
          element: (
            <div className="print-conclusion">
              <ConclusionPrint
                value={{
                  conclusion: section?.conclusion || "",
                  recommendations: section?.recommendations || "",
                  sections: section ? [section] : [],
                }}
              />
              {doctorName && (
                <div
                  style={{
                    marginTop: "10mm",
                    textAlign: "right",
                    fontSize: "14px",
                  }}
                >
                  Исследование проводил врач {doctorName}
                </div>
              )}
            </div>
          ),
        },
      ]);
    });

    return pages;
  }, [appliedConclusionSections, doctorName, previewOverrides, studyDefinitions]);

  const sourceContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (studyPages.length > 0) {
      onReadyRef.current?.();
    }
  }, [studyPages]);

  React.useImperativeHandle(ref, () => ({
    saveOverrides: handleSaveOverrides,
    getPrintRoot: () => printRootRef.current,
  }));

  return (
    <div>
      <div
        ref={sourceContainerRef}
        data-print-source
        hidden
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "210mm",
          pointerEvents: "none",
        }}
      >
        {studyDefinitions.map((definition) => (
          <div key={definition.id} data-source-block-id={bodyOverrideKey(definition.id)}>
            {definition.element}
          </div>
        ))}
      </div>
      <div
        ref={printRootRef}
        id="print-root"
        contentEditable={isEditMode}
        suppressContentEditableWarning
        className="w-full outline-none"
        style={{ width: "210mm", fontSize: "12pt", lineHeight: 1.4 }}
      >
        {studyPages.map((pageBlocks, pageIndex) => (
          <div
            key={pageIndex}
            className="print-page"
            style={{
              pageBreakAfter: "always",
              breakAfter: "page",
            }}
          >
            <div className="print-page-inner">
              {pageBlocks.filter(Boolean).map((block) => (
                <div
                  key={block.id}
                  data-block-id={`block:${block.id}`}
                  className="no-break"
                  style={{ marginTop: block.id === "header" ? 0 : "10mm" }}
                >
                  {block.element}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

PrintableProtocol.displayName = "PrintableProtocol";

export default PrintableProtocol;
