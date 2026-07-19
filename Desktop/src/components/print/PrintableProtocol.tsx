import React from "react";
import { useResearch } from "@contexts";
import { useAuth } from "@/contexts/AuthContext";
import ResearchPrintHeader from "@components/print/ResearchPrintHeader";
import ObpPrint from "@/components/print/researches/ObpPrint";
import DynamicPrint from "@/components/print/researches/DynamicPrint";
import obpSchema from "@/constructor/definitions/obp.json";
import kidneySchema from "@/constructor/definitions/kidney.json";
import type { PrintTemplate, ProtocolSchema } from "@/constructor/schema";
import { getCustomSchemas } from "@/constructor/utils/protocolRegistry";
import KidneysPrint from "@/components/print/researches/KidneysPrint";
import RightKidneyPrint from "@/components/print/organs/Kidney/RightKidneyPrint";
import LeftKidneyPrint from "@/components/print/organs/Kidney/LeftKidneyPrint";
import type { KidneyProtocol } from "@/types/organs/kidney";
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

type PrintOverrideMap = Record<string, string>;

interface StudyDefinition {
  id: Exclude<BlockId, "header" | "conclusion">;
  key: string;
  label: string;
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

const normalizeEditableText = (value?: string) =>
  (value ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const normalizeEditableHtml = (value?: string) => (value ?? "").replace(/\r\n/g, "\n").trim();

const hasVisibleHtmlContent = (value?: string) => {
  const html = (value ?? "").trim();
  if (!html) {
    return false;
  }

  if (typeof document === "undefined") {
    return html.replace(/<[^>]+>/g, "").trim().length > 0;
  }

  const template = document.createElement("template");
  template.innerHTML = html;
  return (template.content.textContent ?? "").trim().length > 0;
};

const bodyOverrideKey = (id: StudyDefinition["id"]) => `block:${id}`;
const conclusionOverrideKey = (key: string) => `conclusion:${key}`;
const recommendationOverrideKey = (key: string) => `recommendation:${key}`;

export interface PrintableProtocolHandle {
  saveOverrides: () => void;
  getPrintRoot: () => HTMLElement | null;
}

interface PrintableProtocolProps {
  editMode?: boolean;
  onSave?: () => void;
  onReady?: () => void;
  researchId?: number | null;
}

const PrintableProtocol = React.forwardRef<PrintableProtocolHandle, PrintableProtocolProps>((props, ref) => {
  const { editMode } = props;
  const { studiesData } = useResearch();
  const { user } = useAuth();

  const [sourceBlockHtml, setSourceBlockHtml] = React.useState<Record<string, string>>({});
  const lastCapturedHtmlRef = React.useRef<string>("");
  
  const [appliedOverrides, setAppliedOverrides] = React.useState<PrintOverrideMap>({});
  const [draftOverrides, setDraftOverrides] = React.useState<PrintOverrideMap>({});
  const [isEditMode, setIsEditMode] = React.useState(editMode ?? false);

  React.useEffect(() => {
    if (editMode && !isEditMode) {
      handleStartEditing();
    } else if (editMode === false && isEditMode) {
      setIsEditMode(false);
    }
  }, [editMode]);

  // Получаем все кастомные схемы для динамической печати
  const customSchemas = React.useMemo(() => getCustomSchemas(), []);

  const obpData = studiesData["ОБП"] || studiesData["ОБП (v2)"];
  const kidneysData = studiesData["Почки"] || studiesData["Почки (v2)"];
  const bladderStudyData = studiesData["Мочевой пузырь"];
  const omtFemaleData = studiesData["ОМТ (Ж)"];
  const omtMaleData = studiesData["ОМТ (М)"];
  const thyroidData = studiesData["Щитовидная железа"];
  const pleuralData = studiesData["Плевральные полости"];
  const salivaryData = studiesData["Слюнные железы"];
  const brachioData = studiesData["БЦА"];
  const lowerExtremityVeinsData = studiesData["УВНК"];
  const breastData = studiesData["Молочные железы"];
  const scrotumData = studiesData["Органы мошонки"];
  const childDispensaryData = studiesData["Детская диспансеризация"];
  const softTissueData = studiesData["Мягких тканей"];
  const lymphNodesData =
    studiesData["Лимфоузлы"] ||
    studiesData["Лимфатические узлы"] ||
    studiesData["lymphNodes"];

  const obpProtocol = obpData as ObpProtocol | undefined;

  // Определяем динамический формат OBP (v2) по наличию точечных ключей
  const isDynamicObp = (data: any): boolean => {
    return typeof data === "object" && data !== null && "liver.rightLobeAP" in data;
  };

  const obpIsDynamic = isDynamicObp(obpData);
  const dynamicObpData = obpIsDynamic ? (obpData as Record<string, any>) : undefined;
  const isDynamicKidney = (data: any): boolean => {
    return typeof data === "object" && data !== null && "right.position" in data;
  };

  // Преобразование плоского динамического формата в структуру KidneyProtocol
  const convertFlatToKidneyProtocol = (flat: Record<string, any>, side: 'right' | 'left'): KidneyProtocol => {
    const prefix = side === 'right' ? 'right' : 'left';
    const concrementsList = (flat[`${prefix}.parenchymaConcrementsList`] ?? []).map((item: Record<string, string>) => ({
      size: item.size ?? '',
      location: item.location ?? '',
    }));
    const cystsList = (flat[`${prefix}.parenchymaCystsList`] ?? []).map((item: Record<string, string>) => ({
      size: item.size ?? '',
      location: item.location ?? '',
    }));
    const pcsConcrementsList = (flat[`${prefix}.pcsConcrementsList`] ?? []).map((item: Record<string, string>) => ({
      size: item.size ?? '',
      location: item.location ?? '',
    }));
    const pcsCystsList = (flat[`${prefix}.pcsCystsList`] ?? []).map((item: Record<string, string>) => ({
      size: item.size ?? '',
      location: item.location ?? '',
    }));
    return {
      position: flat[`${prefix}.position`] ?? '',
      positionText: flat[`${prefix}.positionText`] ?? '',
      length: flat[`${prefix}.length`] ?? '',
      width: flat[`${prefix}.width`] ?? '',
      thickness: flat[`${prefix}.thickness`] ?? '',
      parenchymaSize: flat[`${prefix}.parenchymaSize`] ?? '',
      parenchymaEchogenicity: flat[`${prefix}.parenchymaEchogenicity`] ?? '',
      parenchymaStructure: flat[`${prefix}.parenchymaStructure`] ?? '',
      parenchymaConcrements: flat[`${prefix}.parenchymaConcrements`] ?? '',
      parenchymaConcrementslist: concrementsList,
      parenchymaCysts: flat[`${prefix}.parenchymaCysts`] ?? '',
      parenchymaCystslist: cystsList,
      parenchymaMultipleCysts: flat[`${prefix}.parenchymaMultipleCysts`] === 'да',
      parenchymaMultipleCystsSize: flat[`${prefix}.parenchymaMultipleCystsSize`] ?? '',
      parenchymaPathologicalFormations: flat[`${prefix}.parenchymaPathologicalFormations`] ?? '',
      parenchymaPathologicalFormationsText: flat[`${prefix}.parenchymaPathologicalFormationsText`] ?? '',
      pcsSize: flat[`${prefix}.pcsSize`] ?? '',
      pcsMicroliths: flat[`${prefix}.pcsMicroliths`] ?? '',
      pcsMicrolithsSize: flat[`${prefix}.pcsMicrolithsSize`] ?? '',
      pcsConcrements: flat[`${prefix}.pcsConcrements`] ?? '',
      pcsConcrementslist: pcsConcrementsList,
      pcsCysts: flat[`${prefix}.pcsCysts`] ?? '',
      pcsCystslist: pcsCystsList,
      pcsMultipleCysts: flat[`${prefix}.pcsMultipleCysts`] === 'да',
      pcsMultipleCystsSize: flat[`${prefix}.pcsMultipleCystsSize`] ?? '',
      pcsPathologicalFormations: flat[`${prefix}.pcsPathologicalFormations`] ?? '',
      pcsPathologicalFormationsText: flat[`${prefix}.pcsPathologicalFormationsText`] ?? '',
      sinus: flat[`${prefix}.sinus`] ?? '',
      adrenalArea: flat[`${prefix}.adrenalArea`] ?? '',
      adrenalAreaText: flat[`${prefix}.adrenalAreaText`] ?? '',
      contour: flat[`${prefix}.contour`] ?? '',
      additional: flat[`${prefix}.additional`] ?? '',
    };
  };

  const kidneysIsDynamic = isDynamicKidney(kidneysData);
  const dynamicKidneyData = kidneysIsDynamic ? (kidneysData as Record<string, any>) : undefined;
  const kidneysProtocol = kidneysData as KidneyStudyProtocol | undefined;

  // Для динамического формата конвертируем данные и используем кастомные print-компоненты
  const dynamicKidneysPrintElement = kidneysIsDynamic && dynamicKidneyData ? (
    <>
      {dynamicKidneyData['right.position'] !== 'нефрэктомия' && (
        <RightKidneyPrint value={convertFlatToKidneyProtocol(dynamicKidneyData, 'right')} />
      )}
      {dynamicKidneyData['left.position'] !== 'нефрэктомия' && (
        <LeftKidneyPrint value={convertFlatToKidneyProtocol(dynamicKidneyData, 'left')} />
      )}
    </>
  ) : undefined;
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
          studyData: obpIsDynamic ? dynamicObpData : obpProtocol,
          conclusion: obpIsDynamic ? (dynamicObpData?.["conclusion.conclusion"] ?? "") : (obpProtocol?.conclusion || ""),
          recommendations: obpIsDynamic ? (dynamicObpData?.["conclusion.recommendations"] ?? "") : (obpProtocol?.recommendations || ""),
          element: obpIsDynamic
            ? <DynamicPrint template={(obpSchema as any).printTemplate as PrintTemplate} data={dynamicObpData ?? {}} />
            : <ObpPrint obpData={obpProtocol} />,
        },
        {
          id: "kidneys",
          key: "kidneys",
          label: "Почки",
          studyData: kidneysIsDynamic ? dynamicKidneyData : kidneysProtocol,
          conclusion: kidneysIsDynamic ? (dynamicKidneyData?.["conclusion.conclusion"] ?? "") : (kidneysProtocol?.conclusion || ""),
          recommendations: kidneysIsDynamic ? (dynamicKidneyData?.["conclusion.recommendations"] ?? "") : (kidneysProtocol?.recommendations || ""),
          element: kidneysIsDynamic && dynamicKidneysPrintElement
            ? dynamicKidneysPrintElement
            : <KidneysPrint />,
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
        // Определяем динамические протоколы из studiesData, которых нет в явном списке
        ...(() => {
          // Собираем ключи всех исследований, которые уже обработаны
          const handledKeys = new Set([
            "ОБП", "ОБП (v2)", "Почки", "Почки (v2)",
            "Мочевой пузырь", "ОМТ (Ж)", "ОМТ (М)",
            "Щитовидная железа", "Плевральные полости", "Слюнные железы",
            "БЦА", "УВНК", "Лимфоузлы", "Лимфатические узлы", "lymphNodes",
            "Молочные железы", "Органы мошонки", "Детская диспансеризация", "Мягких тканей",
          ]);
          const entries: StudyDefinition[] = [];
          for (const studyKey of Object.keys(studiesData)) {
            if (handledKeys.has(studyKey)) continue;
            const studyData = studiesData[studyKey];
            if (!studyData) continue;
            // Пытаемся найти схему среди кастомных
            const schema = customSchemas.find((s: ProtocolSchema) => s.selectionLabel === studyKey);
            if (schema && schema.printTemplate) {
              entries.push({
                id: studyKey.replace(/[^a-zA-Z0-9_-]/g, '_') as any,
                key: studyKey,
                label: studyKey,
                studyData,
                conclusion: (studyData as Record<string, any>)?.["conclusion.conclusion"] ?? "",
                recommendations: (studyData as Record<string, any>)?.["conclusion.recommendations"] ?? "",
                element: (
                  <DynamicPrint
                    template={schema.printTemplate as PrintTemplate}
                    data={studyData as Record<string, any>}
                  />
                ),
              });
            }
          }
          return entries;
        })(),
      ].filter((definition) => Boolean(definition.studyData)) as StudyDefinition[],
    [
      obpData,
      kidneysData,
      bladderStudyData,
      omtFemaleData,
      omtMaleData,
      thyroidData,
      pleuralData,
      salivaryData,
      brachioData,
      lowerExtremityVeinsData,
      lymphNodesData,
      breastData,
      scrotumData,
      childDispensaryData,
      softTissueData,
      studiesData,
      customSchemas,
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
  const previewOverrides = isEditMode ? draftOverrides : appliedOverrides;

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
  }, [appliedOverrides, buildDraftOverrides, sourceBlockHtml]);

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

  const printRootRef = React.useRef<HTMLDivElement | null>(null);
  const editContentRef = React.useRef<HTMLDivElement | null>(null);
  const sourceContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (studyPages.length > 0) {
      props.onReady?.();
    }
  }, [studyPages]);

  const handleStartEditing = React.useCallback(() => {
    setDraftOverrides(buildDraftOverrides(appliedOverrides));
    setIsEditMode(true);
  }, [appliedOverrides, buildDraftOverrides]);

  const handleSaveOverrides = React.useCallback(async () => {
    // Сначала читаем актуальный HTML из contentEditable блока
    const editRoot = editContentRef.current;
    const editHtml = editRoot?.innerHTML ?? "";

    // Парсим HTML, чтобы извлечь блоки по их id
    const nextOverrides: PrintOverrideMap = {};

    if (editHtml) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(editHtml, "text/html");
      const pageBlocks = doc.querySelectorAll("[data-block-id]");
      pageBlocks.forEach((el) => {
        const blockId = el.getAttribute("data-block-id");
        if (blockId) {
          nextOverrides[blockId] = normalizeEditableHtml(el.innerHTML);
        }
      });
    }

    // Для блоков, которые не удалось распарсить, используем draftOverrides
    studyDefinitions.forEach((definition) => {
      const bodyKey = bodyOverrideKey(definition.id);
      if (!nextOverrides[bodyKey]) {
        nextOverrides[bodyKey] = normalizeEditableHtml(
          draftOverrides[bodyKey],
        );
      }
      const conKey = conclusionOverrideKey(definition.key);
      if (!nextOverrides[conKey]) {
        nextOverrides[conKey] = normalizeEditableText(
          draftOverrides[conKey],
        );
      }
      const recKey = recommendationOverrideKey(definition.key);
      if (!nextOverrides[recKey]) {
        nextOverrides[recKey] = normalizeEditableText(
          draftOverrides[recKey],
        );
      }
    });

    // Если есть researchId, сохраняем в БД
    if (props.researchId) {
      try {
        await window.protocolAPI.savePrintOverrides({
          researchId: props.researchId,
          overrides: nextOverrides,
        });
      } catch {
        // Если не удалось сохранить в БД, продолжаем с локальным сохранением
      }
    }

    setAppliedOverrides(nextOverrides);
    setIsEditMode(false);
    props.onSave?.();
  }, [draftOverrides, studyDefinitions, props.onSave, props.researchId]);

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
        ref={(node) => {
          printRootRef.current = node;
          if (isEditMode) {
            (editContentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          }
        }}
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
