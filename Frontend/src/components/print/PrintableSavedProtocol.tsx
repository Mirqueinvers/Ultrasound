import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useResearch } from "@contexts";
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
import EditablePrintHtmlBlock from "@/components/print/EditablePrintHtmlBlock";

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

type PrintOverrideMap = Record<string, string>;

interface ResearchBlock {
  id: BlockId;
  element: React.ReactNode;
}

interface StudyEditorSection extends ConclusionPrintSection {
  id: StudyBlockId;
  label: string;
}

interface StudyBlockDefinition extends StudyEditorSection {
  studyData: any;
  element: React.ReactNode;
}

type PrintableSavedProtocolProps = {
  researchId: number;
  onReady?: (researchId: number) => void;
};

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

const joinVisibleSections = (
  sections: ConclusionPrintSection[],
  field: "conclusion" | "recommendations",
) =>
  sections
    .map((section) => normalizeEditableText(section[field]))
    .filter(Boolean)
    .join("\n");

const bodyOverrideKey = (id: StudyBlockId) => `block:${id}`;
const conclusionOverrideKey = (key: string) => `conclusion:${key}`;
const recommendationOverrideKey = (key: string) => `recommendation:${key}`;

const PrintableSavedProtocol = React.forwardRef<
  HTMLDivElement,
  PrintableSavedProtocolProps
>(({ researchId, onReady }, ref) => {
  const { user } = useAuth();
  const {
    studiesData,
    setStudyData,
    clearStudiesData,
    setPatientFullName,
    setPatientDateOfBirth,
    setResearchDate,
    setOrganization,
  } = useResearch();

  const [loading, setLoading] = React.useState(true);
  const [pages, setPages] = React.useState<ResearchBlock[][] | null>(null);
  const [protocolDoctorName, setProtocolDoctorName] = React.useState<string>("");
  const [persistedOverrides, setPersistedOverrides] = React.useState<PrintOverrideMap>({});
  const [draftOverrides, setDraftOverrides] = React.useState<PrintOverrideMap>({});
  const [sourceBlockHtml, setSourceBlockHtml] = React.useState<Record<string, string>>({});
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [isSavingOverrides, setIsSavingOverrides] = React.useState(false);
  const [isResettingOverrides, setIsResettingOverrides] = React.useState(false);
  const measureContainerRef = React.useRef<HTMLDivElement | null>(null);
  const sourceContainerRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setPages(null);
      setSourceBlockHtml({});
      setPersistedOverrides({});
      setDraftOverrides({});
      setIsEditMode(false);
      clearStudiesData();

      const protocol = await window.protocolAPI.getByResearchId(researchId);
      if (cancelled) return;

      if (protocol) {
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
  }, [clearStudiesData, researchId, setStudyData]);

  React.useEffect(() => {
    let cancelled = false;

    const loadMeta = async () => {
      const research = await window.researchAPI.getById(researchId);
      if (cancelled || !research) return;

      const patient = await window.patientAPI.getById(research.patient_id);
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
    };

    void loadMeta();

    return () => {
      cancelled = true;
    };
  }, [researchId, setOrganization, setPatientDateOfBirth, setPatientFullName, setResearchDate]);

  const obpData = studiesData["\u041e\u0411\u041f"];
  const kidneysData = studiesData["\u041f\u043e\u0447\u043a\u0438"];
  const bladderStudyData = studiesData["\u041c\u043e\u0447\u0435\u0432\u043e\u0439 \u043f\u0443\u0437\u044b\u0440\u044c"];
  const omtFemaleData = studiesData["\u041e\u041c\u0422 (\u0416)"];
  const omtMaleData = studiesData["\u041e\u041c\u0422 (\u041c)"];
  const thyroidData = studiesData["\u0429\u0438\u0442\u043e\u0432\u0438\u0434\u043d\u0430\u044f \u0436\u0435\u043b\u0435\u0437\u0430"];
  const breastData = studiesData["\u041c\u043e\u043b\u043e\u0447\u043d\u044b\u0435 \u0436\u0435\u043b\u0435\u0437\u044b"];
  const scrotumData = studiesData["\u041e\u0440\u0433\u0430\u043d\u044b \u043c\u043e\u0448\u043e\u043d\u043a\u0438"];
  const childDispensaryData = studiesData["\u0414\u0435\u0442\u0441\u043a\u0430\u044f \u0434\u0438\u0441\u043f\u0430\u043d\u0441\u0435\u0440\u0438\u0437\u0430\u0446\u0438\u044f"];
  const softTissueData = studiesData["\u041c\u044f\u0433\u043a\u0438\u0445 \u0442\u043a\u0430\u043d\u0435\u0439"];
  const salivaryData = studiesData["\u0421\u043b\u044e\u043d\u043d\u044b\u0435 \u0436\u0435\u043b\u0435\u0437\u044b"];
  const brachioCephalicArteriesData = studiesData["\u0411\u0426\u0410"];
  const lymphNodesData =
    studiesData["\u041b\u0438\u043c\u0444\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u0443\u0437\u043b\u044b"] ||
    studiesData["\u041b\u0438\u043c\u0444\u043e\u0443\u0437\u043b\u044b"] ||
    studiesData["lymphNodes"];

  const studyDefinitions = React.useMemo(
    () => ([
      {
        id: "obp",
        key: "obp",
        label: "\u041e\u0411\u041f",
        studyData: obpData,
        conclusion: obpData?.conclusion || "",
        recommendations: obpData?.recommendations || "",
        element: <ObpPrint />,
      },
      {
        id: "kidneys",
        key: "kidneys",
        label: "\u041f\u043e\u0447\u043a\u0438",
        studyData: kidneysData,
        conclusion: kidneysData?.conclusion || "",
        recommendations: kidneysData?.recommendations || "",
        element: <KidneysPrint />,
      },
      {
        id: "bladder",
        key: "bladder",
        label: "\u041c\u043e\u0447\u0435\u0432\u043e\u0439 \u043f\u0443\u0437\u044b\u0440\u044c",
        studyData: bladderStudyData,
        conclusion: bladderStudyData?.conclusion || "",
        recommendations: bladderStudyData?.recommendations || "",
        element: <UrinaryBladderStudyPrint />,
      },
      {
        id: "omtFemale",
        key: "omt-female",
        label: "\u041e\u041c\u0422 (\u0416)",
        studyData: omtFemaleData,
        conclusion: omtFemaleData?.conclusion || "",
        recommendations: omtFemaleData?.recommendations || "",
        element: <OmtFemalePrint />,
      },
      {
        id: "omtMale",
        key: "omt-male",
        label: "\u041e\u041c\u0422 (\u041c)",
        studyData: omtMaleData,
        conclusion: omtMaleData?.conclusion || "",
        recommendations: omtMaleData?.recommendations || "",
        element: <OmtMalePrint />,
      },
      {
        id: "thyroid",
        key: "thyroid",
        label: "\u0429\u0438\u0442\u043e\u0432\u0438\u0434\u043d\u0430\u044f \u0436\u0435\u043b\u0435\u0437\u0430",
        studyData: thyroidData,
        conclusion: thyroidData?.conclusion || "",
        recommendations: thyroidData?.recommendations || "",
        element: <ThyroidResearchPrint />,
      },
      {
        id: "breast",
        key: "breast",
        label: "\u041c\u043e\u043b\u043e\u0447\u043d\u044b\u0435 \u0436\u0435\u043b\u0435\u0437\u044b",
        studyData: breastData,
        conclusion: breastData?.conclusion || "",
        recommendations: breastData?.recommendations || "",
        element: <BreastResearchPrint />,
      },
      {
        id: "scrotum",
        key: "scrotum",
        label: "\u041e\u0440\u0433\u0430\u043d\u044b \u043c\u043e\u0448\u043e\u043d\u043a\u0438",
        studyData: scrotumData,
        conclusion: scrotumData?.conclusion || "",
        recommendations: scrotumData?.recommendations || "",
        element: <ScrotumResearchPrint />,
      },
      {
        id: "salivaryGlands",
        key: "salivary-glands",
        label: "\u0421\u043b\u044e\u043d\u043d\u044b\u0435 \u0436\u0435\u043b\u0435\u0437\u044b",
        studyData: salivaryData,
        conclusion: salivaryData?.conclusion || "",
        recommendations: salivaryData?.recommendations || "",
        element: <SalivaryGlandsResearchPrint />,
      },
      {
        id: "brachioCephalicArteries",
        key: "brachio-cephalic-arteries",
        label: "\u0411\u0426\u0410",
        studyData: brachioCephalicArteriesData,
        conclusion: brachioCephalicArteriesData?.conclusion || "",
        recommendations: brachioCephalicArteriesData?.recommendations || "",
        element: <BrachioCephalicArteriesResearchPrint />,
      },
      {
        id: "lymphNodes",
        key: "lymph-nodes",
        label: "\u041b\u0438\u043c\u0444\u0430\u0442\u0438\u0447\u0435\u0441\u043a\u0438\u0435 \u0443\u0437\u043b\u044b",
        studyData: lymphNodesData,
        conclusion: lymphNodesData?.conclusion || "",
        recommendations: lymphNodesData?.recommendations || "",
        element: <LymphNodesResearchPrint />,
      },
      {
        id: "childDispensary",
        key: "child-dispensary",
        label: "\u0414\u0435\u0442\u0441\u043a\u0430\u044f \u0434\u0438\u0441\u043f\u0430\u043d\u0441\u0435\u0440\u0438\u0437\u0430\u0446\u0438\u044f",
        studyData: childDispensaryData,
        conclusion: childDispensaryData?.conclusion || "",
        recommendations: childDispensaryData?.recommendations || "",
        element: <ChildDispensaryPrint />,
      },
      {
        id: "softTissue",
        key: "soft-tissue",
        label: "\u041c\u044f\u0433\u043a\u0438\u0435 \u0442\u043a\u0430\u043d\u0438",
        studyData: softTissueData,
        conclusion: softTissueData?.conclusion || "",
        recommendations: softTissueData?.recommendations || "",
        element: <SoftTissuePrint />,
      },
    ] as StudyBlockDefinition[]).filter((definition) => Boolean(definition.studyData)),
    [
      bladderStudyData,
      brachioCephalicArteriesData,
      breastData,
      childDispensaryData,
      kidneysData,
      lymphNodesData,
      obpData,
      omtFemaleData,
      omtMaleData,
      salivaryData,
      scrotumData,
      softTissueData,
      thyroidData,
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

  const conclusion = React.useMemo(
    () => joinVisibleSections(appliedConclusionSections, "conclusion"),
    [appliedConclusionSections],
  );

  const recommendations = React.useMemo(
    () => joinVisibleSections(appliedConclusionSections, "recommendations"),
    [appliedConclusionSections],
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

  const displayBlocks = React.useMemo<ResearchBlock[]>(() => {
    const studyBlocks = studyDefinitions.reduce<ResearchBlock[]>((acc, definition) => {
      const overrideKey = bodyOverrideKey(definition.id);
      const hasOverride = Object.prototype.hasOwnProperty.call(
        persistedOverrides,
        overrideKey,
      );

      if (!hasOverride) {
        acc.push({ id: definition.id, element: definition.element });
        return acc;
      }

      const editedValue = persistedOverrides[overrideKey] ?? "";
      if (!hasVisibleHtmlContent(editedValue)) {
        return acc;
      }

      acc.push({
        id: definition.id,
        element: <EditablePrintHtmlBlock value={editedValue} />,
      });
      return acc;
    }, []);

    return [
      { id: "header", element: <ResearchPrintHeader /> },
      ...studyBlocks,
      {
        id: "conclusion",
        element: (
          <div className="print-conclusion">
            <ConclusionPrint
              value={{
                conclusion,
                recommendations,
                sections: appliedConclusionSections,
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
    ];
  }, [appliedConclusionSections, conclusion, doctorName, persistedOverrides, recommendations, studyDefinitions]);

  React.useLayoutEffect(() => {
    if (!measureContainerRef.current) return;

    const children = Array.from(measureContainerRef.current.children) as HTMLElement[];
    const heightLimit = 1120;

    const newPages: ResearchBlock[][] = [];
    let currentPage: ResearchBlock[] = [];
    let currentHeight = 0;

    children.forEach((child, index) => {
      const block = displayBlocks[index];
      const blockHeight = child.offsetHeight;

      if (currentHeight + blockHeight > heightLimit && currentPage.length > 0) {
        newPages.push(currentPage);
        currentPage = [block];
        currentHeight = blockHeight;
      } else {
        currentPage.push(block);
        currentHeight += blockHeight;
      }
    });

    if (currentPage.length > 0) {
      newPages.push(currentPage);
    }

    setPages(newPages);
  }, [displayBlocks]);

  React.useEffect(() => {
    if (pages && !loading) {
      onReady?.(researchId);
    }
  }, [loading, onReady, pages, researchId]);

  const handleDraftChange = React.useCallback((key: string, value: string) => {
    setDraftOverrides((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleStartEditing = React.useCallback(() => {
    setDraftOverrides(buildDraftOverrides(persistedOverrides));
    setIsEditMode(true);
  }, [buildDraftOverrides, persistedOverrides]);

  const handleCancelEditing = React.useCallback(() => {
    setDraftOverrides(buildDraftOverrides(persistedOverrides));
    setIsEditMode(false);
  }, [buildDraftOverrides, persistedOverrides]);

  const handleSaveOverrides = React.useCallback(async () => {
    const nextOverrides: PrintOverrideMap = {};

    studyDefinitions.forEach((definition) => {
      nextOverrides[bodyOverrideKey(definition.id)] = normalizeEditableHtml(
        draftOverrides[bodyOverrideKey(definition.id)],
      );
      nextOverrides[conclusionOverrideKey(definition.key)] = normalizeEditableText(
        draftOverrides[conclusionOverrideKey(definition.key)],
      );
      nextOverrides[recommendationOverrideKey(definition.key)] = normalizeEditableText(
        draftOverrides[recommendationOverrideKey(definition.key)],
      );
    });

    setIsSavingOverrides(true);
    try {
      const result = await window.protocolAPI.savePrintOverrides({
        researchId,
        overrides: nextOverrides,
      });

      if (!result.success) {
        window.alert(result.message || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043f\u0440\u0430\u0432\u043a\u0438 \u043f\u0435\u0447\u0430\u0442\u043d\u043e\u0439 \u0432\u0435\u0440\u0441\u0438\u0438.");
        return;
      }

      setPersistedOverrides(nextOverrides);
      setIsEditMode(false);
    } catch {
      window.alert("\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u043e\u0445\u0440\u0430\u043d\u0438\u0442\u044c \u043f\u0440\u0430\u0432\u043a\u0438 \u043f\u0435\u0447\u0430\u0442\u043d\u043e\u0439 \u0432\u0435\u0440\u0441\u0438\u0438.");
    } finally {
      setIsSavingOverrides(false);
    }
  }, [draftOverrides, researchId, studyDefinitions]);

  const handleResetOverrides = React.useCallback(async () => {
    setIsResettingOverrides(true);
    try {
      const result = await window.protocolAPI.savePrintOverrides({
        researchId,
        overrides: {},
      });

      if (!result.success) {
        window.alert(result.message || "\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u043f\u0440\u0430\u0432\u043a\u0438 \u043f\u0435\u0447\u0430\u0442\u043d\u043e\u0439 \u0432\u0435\u0440\u0441\u0438\u0438.");
        return;
      }

      setPersistedOverrides({});
      setDraftOverrides(buildDraftOverrides({}));
      setIsEditMode(false);
    } catch {
      window.alert("\u041d\u0435 \u0443\u0434\u0430\u043b\u043e\u0441\u044c \u0441\u0431\u0440\u043e\u0441\u0438\u0442\u044c \u043f\u0440\u0430\u0432\u043a\u0438 \u043f\u0435\u0447\u0430\u0442\u043d\u043e\u0439 \u0432\u0435\u0440\u0441\u0438\u0438.");
    } finally {
      setIsResettingOverrides(false);
    }
  }, [buildDraftOverrides, researchId]);

  if (loading && !pages) {
    return (
      <div>
        <div ref={ref} id="print-root" className="p-4 text-sm text-slate-500">
          Загрузка сохранённого протокола исследования...
        </div>
      </div>
    );
  }

  if (!pages) {
    return (
      <div>
        <div
          ref={sourceContainerRef}
          data-print-source
          style={{
            visibility: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            width: "210mm",
            zIndex: -2,
            pointerEvents: "none",
          }}
        >
          {studyDefinitions.map((definition) => (
            <div key={definition.id} data-source-block-id={bodyOverrideKey(definition.id)}>
              {definition.element}
            </div>
          ))}
        </div>

        <div ref={ref} id="print-root">
          <div
            ref={measureContainerRef}
            data-print-measure
            style={{
              visibility: "hidden",
              position: "absolute",
              top: 0,
              left: 0,
              width: "210mm",
              zIndex: -1,
              pointerEvents: "none",
            }}
          >
            {displayBlocks.map((block) => (
              <div key={block.id}>{block.element}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        data-print-editor
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Редактирование печатной версии
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Можно поправить уже собранный текст по каждому исследованию, не меняя исходную форму протоколирования.
            </p>
          </div>

          {!isEditMode ? (
            <button
              type="button"
              onClick={handleStartEditing}
              disabled={studyDefinitions.length === 0 || Object.keys(sourceBlockHtml).length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="i-ph-pencil-simple-line-duotone text-base" />
              <span>Редактировать текст</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void handleResetOverrides()}
                disabled={isSavingOverrides || isResettingOverrides}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="i-ph-arrow-counter-clockwise-duotone text-base" />
                <span>{isResettingOverrides ? "Сбрасываю..." : "Сбросить правки"}</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEditing}
                disabled={isSavingOverrides || isResettingOverrides}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="i-ph-x-circle-duotone text-base" />
                <span>Отмена</span>
              </button>
              <button
                type="button"
                onClick={() => void handleSaveOverrides()}
                disabled={isSavingOverrides || isResettingOverrides}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="i-ph-floppy-disk-back-duotone text-base" />
                <span>{isSavingOverrides ? "Сохраняю..." : "Сохранить правки"}</span>
              </button>
            </div>
          )}
        </div>

        {isEditMode && (
          <div className="mt-4 space-y-4 border-t border-slate-200 pt-4">
            {studyDefinitions.map((definition) => {
              const bodyKey = bodyOverrideKey(definition.id);
              const conclusionKey = conclusionOverrideKey(definition.key);
              const recommendationKey = recommendationOverrideKey(definition.key);

              return (
                <section
                  key={definition.id}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                >
                  <h4 className="text-sm font-semibold text-slate-900">
                    {definition.label}
                  </h4>

                  <label className="mt-3 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Текст исследования
                  </label>
                  <EditablePrintHtmlBlock
                    editable
                    value={draftOverrides[bodyKey] ?? ""}
                    onChange={(nextHtml) => handleDraftChange(bodyKey, nextHtml)}
                    minHeight="220px"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-900 shadow-sm outline-none transition focus-within:border-sky-400 focus-within:ring-2 focus-within:ring-sky-100"
                  />

                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                        Заключение
                      </label>
                      <textarea
                        value={draftOverrides[conclusionKey] ?? ""}
                        onChange={(event) =>
                          handleDraftChange(conclusionKey, event.target.value)
                        }
                        className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
                        Рекомендации
                      </label>
                      <textarea
                        value={draftOverrides[recommendationKey] ?? ""}
                        onChange={(event) =>
                          handleDraftChange(recommendationKey, event.target.value)
                        }
                        className="mt-2 min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100"
                      />
                    </div>
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>

      <div
        ref={sourceContainerRef}
        data-print-source
        style={{
          visibility: "hidden",
          position: "absolute",
          top: 0,
          left: 0,
          width: "210mm",
          zIndex: -2,
          pointerEvents: "none",
        }}
      >
        {studyDefinitions.map((definition) => (
          <div key={definition.id} data-source-block-id={bodyOverrideKey(definition.id)}>
            {definition.element}
          </div>
        ))}
      </div>

      <div ref={ref} id="print-root">
        <div
          ref={measureContainerRef}
          data-print-measure
          style={{
            visibility: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            width: "210mm",
            zIndex: -1,
            pointerEvents: "none",
          }}
        >
          {displayBlocks.map((block) => (
            <div key={block.id}>{block.element}</div>
          ))}
        </div>

        {pages.map((pageBlocks, pageIndex) => (
          <div key={pageIndex} className="print-page">
            <div className="print-page-inner">
              {pageBlocks.map((block) => (
                <div
                  key={block.id}
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
