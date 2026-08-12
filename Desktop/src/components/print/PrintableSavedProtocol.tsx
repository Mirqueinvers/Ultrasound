import React from "react";
import { useAuth } from "@/contexts/useAuth";
import { useResearch } from "@contexts";
import { usePrintableOverrides } from "@/hooks";
import ResearchPrintHeader from "@components/print/ResearchPrintHeader";
import ObpPrint from "@/components/print/researches/ObpPrint";
import KidneysPrint from "@/components/print/researches/KidneysPrint";
import UrinaryBladderStudyPrint from "@/components/print/researches/UrinaryBladderStudyPrint";
import ConclusionPrint, {
  type ConclusionPrintSection,
} from "@/components/print/ConclusionPrint";
import OmtFemalePrint from "@/components/print/researches/OmtFemalePrint";
import OmtMalePrint from "@/components/print/researches/OmtMalePrint";
import ThyroidResearchPrint from "@/components/print/researches/ThyroidPrint";
import BreastResearchPrint from "@/components/print/researches/BreastPrint";
import ScrotumResearchPrint from "@/components/print/researches/ScrotumPrint";
import ChildDispensaryPrint from "@/components/print/researches/ChildDispensaryPrint";
import SoftTissuePrint from "@/components/print/researches/SoftTissuePrint";
import LymphNodesResearchPrint from "@/components/print/researches/LymphNodesPrint";
import SalivaryGlandsResearchPrint from "@/components/print/researches/SalivaryGlandsPrint";
import BrachioCephalicArteriesResearchPrint from "@/components/print/researches/BrachioCephalicArteriesPrint";
import type {
  ObpProtocol,
  KidneyStudyProtocol,
  UrinaryBladderStudyProtocol,
  OmtFemaleProtocol,
  OmtMaleProtocol,
  ThyroidStudyProtocol,
  BreastStudyProtocol,
  ScrotumProtocol,
  ChildDispensaryProtocol,
  SoftTissueProtocol,
  SalivaryGlandsStudyProtocol,
  BrachioCephalicArteriesStudyProtocol,
  LymphNodesStudyProtocol,
} from "@types";
import type { DesktopStudiesDataMap } from "@/researches/types";
import { patientService, protocolService, researchService } from "@services";
import { STUDY_KEYS } from "@/domain/studyKeys";
import {
  normalizeEditableText,
  hasVisibleHtmlContent,
  bodyOverrideKey,
  conclusionOverrideKey,
  recommendationOverrideKey,
  type PrintOverrideMap,
} from "@/utils/printHelpers";


type StudyBlockId =
  | "obp"
  | "thyroid"
  | "breast"
  | "scrotum"
  | "omtFemale"
  | "omtMale"
  | "kidneys"
  | "bladder"
  | "childDispensary"
  | "softTissue"
  | "salivaryGlands"
  | "brachioCephalicArteries"
  | "lymphNodes";

type BlockId = "header" | StudyBlockId | "conclusion";

interface ResearchBlock {
  id: BlockId;
  element: React.ReactNode;
}

interface StudyEditorSection extends ConclusionPrintSection {
  id: StudyBlockId;
  label: string;
}

interface StudyBlockDefinition extends StudyEditorSection {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- данные исследования на печати динамические (любой протокол)
  studyData: any;
  element: React.ReactNode;
}

type PrintableSavedProtocolProps = {
  researchId: number;
  onReady?: (researchId: number) => void;
  editMode?: boolean;
  onSave?: () => void;
};

export interface PrintableSavedProtocolHandle {
  saveOverrides: () => void;
  getPrintRoot: () => HTMLElement | null;
}

const PrintableSavedProtocol = React.forwardRef<
  PrintableSavedProtocolHandle,
  PrintableSavedProtocolProps
>(({ researchId, onReady, editMode: externalEditMode, onSave }, ref) => {
  const { user } = useAuth();
  const {
    studiesData,
    setStudyData,
    setPatientFullName,
    setPatientDateOfBirth,
    setResearchDate,
    setOrganization,
  } = useResearch();




  const [loading, setLoading] = React.useState(true);
  const [protocolDoctorName, setProtocolDoctorName] = React.useState<string>("");
  const [persistedOverrides, setPersistedOverrides] = React.useState<PrintOverrideMap>({});
  const [sourceBlockHtml, setSourceBlockHtml] = React.useState<Record<string, string>>({});
  const [localStudiesData, setLocalStudiesData] = React.useState<DesktopStudiesDataMap>({});
  const [localPatientFullName, setLocalPatientFullName] = React.useState("");
  const [localPatientDateOfBirth, setLocalPatientDateOfBirth] = React.useState("");
  const [localResearchDate, setLocalResearchDate] = React.useState("");
  const [localOrganization, setLocalOrganization] = React.useState("");
  const sourceContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setSourceBlockHtml({});
      setPersistedOverrides({});

      const protocol = await protocolService.getByResearchId(researchId);
      if (cancelled) {
        return;
      }

      if (protocol) {
        // Локальные данные — для studyDefinitions (синхронно, без гонки состояний)
        setLocalStudiesData(protocol.studies);

        // Данные в контекст — для дочерних компонентов (ResearchPrintHeader, ObpPrint и т.д.)
        Object.entries(protocol.studies).forEach(([studyType, data]) => {
          setStudyData(studyType, data);
        });
        setPersistedOverrides(protocol.printOverrides || {});
      }

      if (!cancelled) {
        setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [researchId, setStudyData]);

  React.useEffect(() => {
    let cancelled = false;

    const loadMeta = async () => {
      const research = await researchService.getById(researchId);
      if (cancelled || !research) return;

      const patient = await patientService.getById(research.patient_id);
      if (cancelled || !patient) return;

      const fullName = `${patient.last_name} ${patient.first_name}${
        patient.middle_name ? ` ${patient.middle_name}` : ""
      }`;

      setPatientFullName(fullName);
      setPatientDateOfBirth(patient.date_of_birth);
      setResearchDate(
        typeof research.research_date === "string"
          ? research.research_date.slice(0, 10)
          : "",
      );
      setProtocolDoctorName(research.doctor_name || "");
      setOrganization(research.organization || "");

      // Сохраняем локально, чтобы при экспорте нескольких протоколов
      // каждый PrintableSavedProtocol имел свои данные шапки
      setLocalPatientFullName(fullName);
      setLocalPatientDateOfBirth(patient.date_of_birth);
      setLocalResearchDate(
        typeof research.research_date === "string"
          ? research.research_date.slice(0, 10)
          : "",
      );
      setLocalOrganization(research.organization || "");
    };

    void loadMeta();

    return () => {
      cancelled = true;
    };
  }, [researchId, setOrganization, setPatientDateOfBirth, setPatientFullName, setResearchDate]);

  // Используем локальные данные (устанавливаются синхронно через setState)
  // как основной источник, а studiesData из контекста — как fallback
  const effectiveStudiesData = Object.keys(localStudiesData).length > 0
    ? localStudiesData
    : studiesData;


  const obpData = effectiveStudiesData[STUDY_KEYS.OBP];
  const kidneysData = effectiveStudiesData[STUDY_KEYS.KIDNEYS];
  const bladderStudyData = effectiveStudiesData[STUDY_KEYS.URINARY_BLADDER];
  const omtFemaleData = effectiveStudiesData[STUDY_KEYS.OMT_FEMALE];
  const omtMaleData = effectiveStudiesData[STUDY_KEYS.OMT_MALE];
  const thyroidData = effectiveStudiesData[STUDY_KEYS.THYROID];
  const breastData = effectiveStudiesData[STUDY_KEYS.BREAST];
  const scrotumData = effectiveStudiesData[STUDY_KEYS.SCROTUM];
  const childDispensaryData = effectiveStudiesData[STUDY_KEYS.CHILD_DISPENSARY];
  const softTissueData = effectiveStudiesData[STUDY_KEYS.SOFT_TISSUE];
  const salivaryData = effectiveStudiesData[STUDY_KEYS.SALIVARY_GLANDS];
  const brachioCephalicArteriesData = effectiveStudiesData[STUDY_KEYS.BCA];
  const lymphNodesData =
    // legacy-алиасы: совместимость со старыми сохранёнными протоколами
    effectiveStudiesData[STUDY_KEYS.LYMPH_NODES_ALT] ||
    effectiveStudiesData[STUDY_KEYS.LYMPH_NODES] ||
    effectiveStudiesData["lymphNodes"];


  const obpProtocol = obpData as ObpProtocol | undefined;
  const kidneysProtocol = kidneysData as KidneyStudyProtocol | undefined;
  const bladderStudyProtocol = bladderStudyData as UrinaryBladderStudyProtocol | undefined;
  const omtFemaleProtocol = omtFemaleData as OmtFemaleProtocol | undefined;
  const omtMaleProtocol = omtMaleData as OmtMaleProtocol | undefined;
  const thyroidProtocol = thyroidData as ThyroidStudyProtocol | undefined;
  const breastProtocol = breastData as BreastStudyProtocol | undefined;
  const scrotumProtocol = scrotumData as ScrotumProtocol | undefined;
  const childDispensaryProtocol = childDispensaryData as ChildDispensaryProtocol | undefined;
  const softTissueProtocol = softTissueData as SoftTissueProtocol | undefined;
  const salivaryProtocol = salivaryData as SalivaryGlandsStudyProtocol | undefined;
  const brachioCephalicArteriesProtocol =
    brachioCephalicArteriesData as BrachioCephalicArteriesStudyProtocol | undefined;
  const lymphNodesProtocol = lymphNodesData as LymphNodesStudyProtocol | undefined;

  const studyDefinitions = React.useMemo(
    () => {
      const defs = ([



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
          studyData: brachioCephalicArteriesProtocol,
          conclusion: brachioCephalicArteriesProtocol?.conclusion || "",
          recommendations: brachioCephalicArteriesProtocol?.recommendations || "",
          element: <BrachioCephalicArteriesResearchPrint />,
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
          label: "Мягкие ткани",
          studyData: softTissueProtocol,
          conclusion: softTissueProtocol?.conclusion || "",
          recommendations: softTissueProtocol?.recommendations || "",
          element: <SoftTissuePrint />,
        },
      ] as StudyBlockDefinition[]).filter((definition) => Boolean(definition.studyData));
      return defs;


    },
    [
      bladderStudyProtocol,
      brachioCephalicArteriesProtocol,
      breastProtocol,
      childDispensaryProtocol,
      kidneysProtocol,
      lymphNodesProtocol,
      obpProtocol,
      omtFemaleProtocol,
      omtMaleProtocol,
      salivaryProtocol,
      scrotumProtocol,
      softTissueProtocol,
      thyroidProtocol,
      localStudiesData,
      studiesData,
    ],

  );


  const appliedConclusionSections = React.useMemo<StudyEditorSection[]>(
    () =>
      studyDefinitions.map((definition) => ({
        id: definition.id,
        key: definition.key,
        label: definition.label,
        conclusion:
          persistedOverrides[conclusionOverrideKey(definition.key)] ??
          definition.conclusion ??
          "",
        recommendations:
          persistedOverrides[recommendationOverrideKey(definition.key)] ??
          definition.recommendations ??
          "",
      })),
    [persistedOverrides, studyDefinitions],
  );

  const doctorName = protocolDoctorName || user?.name || "";

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

  const {
    setDraftOverrides,
    isEditMode,
    setIsEditMode,
    handleStartEditing,
    handleSaveOverrides,
    printRootRef,
  } = usePrintableOverrides({
    sourceOverrides: persistedOverrides,
    setSourceOverrides: setPersistedOverrides,
    buildDraftOverrides,
    studyDefinitions,
    researchId,
    onSave,
    requireSaveSuccess: true,
  });

  // Храним актуальную версию handleStartEditing в ref, чтобы не добавлять
  // нестабильную функцию в зависимости эффекта (иначе ломается мемоизация).
  const handleStartEditingRef = React.useRef(handleStartEditing);

  React.useEffect(() => {
    handleStartEditingRef.current = handleStartEditing;
  });

  React.useLayoutEffect(() => {
    if (!sourceContainerRef.current || loading) {
      return;
    }

    const nextTexts: Record<string, string> = {};
    const elements = sourceContainerRef.current.querySelectorAll<HTMLElement>(
      "[data-source-block-id]",
    );

    elements.forEach((element) => {
      const blockId = element.dataset.sourceBlockId;
      if (!blockId) return;
      nextTexts[blockId] = element.innerHTML.trim();
    });

    setSourceBlockHtml(nextTexts);
  }, [loading, studyDefinitions]);

  React.useEffect(() => {
    if (loading) {
      return;
    }

    setDraftOverrides(buildDraftOverrides(persistedOverrides));
  }, [buildDraftOverrides, loading, persistedOverrides]);

  const studyPages = React.useMemo<ResearchBlock[][]>(() => {
    const obpDef = studyDefinitions.find((d) => d.id === "obp");
    const kidneysDef = studyDefinitions.find((d) => d.id === "kidneys");
    const otherDefs = studyDefinitions.filter((d) => d.id !== "obp" && d.id !== "kidneys");

    const pages: ResearchBlock[][] = [];

    const buildBodyElement = (definition: StudyBlockDefinition) => {
      const overrideKey = bodyOverrideKey(definition.id);
      const hasOverride = Object.prototype.hasOwnProperty.call(persistedOverrides, overrideKey);
      if (hasOverride) {
        const editedValue = persistedOverrides[overrideKey] ?? "";
        if (hasVisibleHtmlContent(editedValue)) {
          return <div dangerouslySetInnerHTML={{ __html: editedValue }} />;
        }
      }
      return definition.element;
    };

    const buildConclusionElement = (sections: StudyEditorSection[]) => {
      return (
        <div className="print-conclusion">
          <ConclusionPrint
            value={{
              conclusion: sections.map((s) => s.conclusion).filter(Boolean).join("\n"),
              recommendations: sections.map((s) => s.recommendations).filter(Boolean).join("\n"),
              sections,
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
      );
    };

    // Если есть и ОБП, и Почки — объединяем в одну страницу
    if (obpDef && kidneysDef) {
      const obpSection = appliedConclusionSections.find((s) => s.key === obpDef.key);
      const kidneysSection = appliedConclusionSections.find((s) => s.key === kidneysDef.key);
      const combinedSections = [obpSection, kidneysSection].filter(Boolean) as StudyEditorSection[];

      pages.push([
        { id: "header" as BlockId, element: <ResearchPrintHeader patientFullName={localPatientFullName} patientDateOfBirth={localPatientDateOfBirth} researchDate={localResearchDate} organization={localOrganization} /> },
        { id: "obp" as BlockId, element: buildBodyElement(obpDef) },
        { id: "kidneys" as BlockId, element: buildBodyElement(kidneysDef) },
        { id: "conclusion" as BlockId, element: buildConclusionElement(combinedSections) },
      ]);
    } else {
      // Если есть только одно из них — отдельная страница
      [obpDef, kidneysDef].filter(Boolean).forEach((def) => {
        const section = appliedConclusionSections.find((s) => s.key === def!.key);
        pages.push([
          { id: "header" as BlockId, element: <ResearchPrintHeader patientFullName={localPatientFullName} patientDateOfBirth={localPatientDateOfBirth} researchDate={localResearchDate} organization={localOrganization} /> },
          { id: def!.id, element: buildBodyElement(def!) },
          { id: "conclusion" as BlockId, element: buildConclusionElement(section ? [section] : []) },
        ]);
      });
    }

    // Остальные исследования — каждое на отдельной странице
    otherDefs.forEach((definition) => {
      const section = appliedConclusionSections.find((s) => s.key === definition.key);
      pages.push([
        { id: "header" as BlockId, element: <ResearchPrintHeader patientFullName={localPatientFullName} patientDateOfBirth={localPatientDateOfBirth} researchDate={localResearchDate} organization={localOrganization} /> },
        { id: definition.id, element: buildBodyElement(definition) },
        { id: "conclusion" as BlockId, element: buildConclusionElement(section ? [section] : []) },
      ]);
    });

    return pages;
  }, [appliedConclusionSections, doctorName, localPatientFullName, localPatientDateOfBirth, localResearchDate, localOrganization, persistedOverrides, studyDefinitions]);

  React.useEffect(() => {
    if (!loading && studyPages.length > 0) {
      onReady?.(researchId);
    }
  }, [loading, onReady, researchId, studyPages]);

  React.useEffect(() => {
    if (externalEditMode === true && !isEditMode) {
      handleStartEditingRef.current();
    } else if (externalEditMode === false && isEditMode) {
      setIsEditMode(false);
    }
  }, [externalEditMode, isEditMode]);

  // При входе в режим редактирования убираем contenteditable="false" с внутренних элементов,
  // чтобы корневой contentEditable мог наследоваться на все дочерние блоки
  React.useEffect(() => {
    const root = printRootRef.current;
    if (!root) return;

    if (isEditMode) {
      const nonEditableElements = root.querySelectorAll<HTMLElement>("[contenteditable=\"false\"]");
      nonEditableElements.forEach((el) => {
        el.removeAttribute("contenteditable");
      });
    }
  }, [isEditMode]);

  React.useImperativeHandle(ref, () => ({
    saveOverrides: handleSaveOverrides,
    getPrintRoot: () => printRootRef.current,
  }), [handleSaveOverrides]);

  if (loading) {
    return (
      <div>
        <div ref={printRootRef} id="print-root" className="p-4 text-sm text-slate-500">
          Загрузка сохранённого протокола исследования...
        </div>
      </div>
    );
  }

  return (
    <div>
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

PrintableSavedProtocol.displayName = "PrintableSavedProtocol";

export default PrintableSavedProtocol;
