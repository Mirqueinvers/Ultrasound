import React from "react";
import { useResearch } from "@contexts";
import { useAuth } from "@/contexts/AuthContext";
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
import EditablePrintHtmlBlock from "@/components/print/EditablePrintHtmlBlock";

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

const joinVisibleSections = (sections: StudyConclusionSection[], field: "conclusion" | "recommendations") =>
  sections
    .map((section) => normalizeEditableText(section[field]))
    .filter(Boolean)
    .join("\n");

const bodyOverrideKey = (id: StudyDefinition["id"]) => `block:${id}`;
const conclusionOverrideKey = (key: string) => `conclusion:${key}`;
const recommendationOverrideKey = (key: string) => `recommendation:${key}`;

const PrintableProtocol = React.forwardRef<HTMLDivElement>((_props, ref) => {
  const { studiesData } = useResearch();
  const { user } = useAuth();

  const [sourceBlockHtml, setSourceBlockHtml] = React.useState<Record<string, string>>({});
  const [appliedOverrides, setAppliedOverrides] = React.useState<PrintOverrideMap>({});
  const [draftOverrides, setDraftOverrides] = React.useState<PrintOverrideMap>({});
  const [isEditMode, setIsEditMode] = React.useState(false);

  const obpData = studiesData["ОБП"];
  const kidneysData = studiesData["Почки"];
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
  const lymphNodesData = studiesData["Лимфатические узлы"];

  const studyDefinitions = React.useMemo<StudyDefinition[]>(
    () =>
      [
        {
          id: "obp",
          key: "obp",
          label: "ОБП",
          studyData: obpData,
          conclusion: obpData?.conclusion || "",
          recommendations: obpData?.recommendations || "",
          element: <ObpPrint />,
        },
        {
          id: "kidneys",
          key: "kidneys",
          label: "Почки",
          studyData: kidneysData,
          conclusion: kidneysData?.conclusion || "",
          recommendations: kidneysData?.recommendations || "",
          element: <KidneysPrint />,
        },
        {
          id: "bladder",
          key: "bladder",
          label: "Мочевой пузырь",
          studyData: bladderStudyData,
          conclusion: bladderStudyData?.conclusion || "",
          recommendations: bladderStudyData?.recommendations || "",
          element: <UrinaryBladderStudyPrint />,
        },
        {
          id: "omtFemale",
          key: "omt-female",
          label: "ОМТ (Ж)",
          studyData: omtFemaleData,
          conclusion: omtFemaleData?.conclusion || "",
          recommendations: omtFemaleData?.recommendations || "",
          element: <OmtFemalePrint />,
        },
        {
          id: "omtMale",
          key: "omt-male",
          label: "ОМТ (М)",
          studyData: omtMaleData,
          conclusion: omtMaleData?.conclusion || "",
          recommendations: omtMaleData?.recommendations || "",
          element: <OmtMalePrint />,
        },
        {
          id: "thyroid",
          key: "thyroid",
          label: "Щитовидная железа",
          studyData: thyroidData,
          conclusion: thyroidData?.conclusion || "",
          recommendations: thyroidData?.recommendations || "",
          element: <ThyroidResearchPrint />,
        },
        {
          id: "pleural",
          key: "pleural",
          label: "Плевральные полости",
          studyData: pleuralData,
          conclusion: pleuralData?.conclusion || "",
          recommendations: pleuralData?.recommendations || "",
          element: <PleuralResearchPrint />,
        },
        {
          id: "salivaryGlands",
          key: "salivary-glands",
          label: "Слюнные железы",
          studyData: salivaryData,
          conclusion: salivaryData?.conclusion || "",
          recommendations: salivaryData?.recommendations || "",
          element: <SalivaryGlandsResearchPrint />,
        },
        {
          id: "brachioCephalicArteries",
          key: "brachio-cephalic-arteries",
          label: "БЦА",
          studyData: brachioData,
          conclusion: brachioData?.conclusion || "",
          recommendations: brachioData?.recommendations || "",
          element: <BrachioCephalicArteriesResearchPrint />,
        },
        {
          id: "lowerExtremityVeins",
          key: "lower-extremity-veins",
          label: "УВНК",
          studyData: lowerExtremityVeinsData,
          conclusion: lowerExtremityVeinsData?.conclusion || "",
          recommendations: lowerExtremityVeinsData?.recommendations || "",
          element: <LowerExtremityVeinsResearchPrint />,
        },
        {
          id: "lymphNodes",
          key: "lymph-nodes",
          label: "Лимфатические узлы",
          studyData: lymphNodesData,
          conclusion: lymphNodesData?.conclusion || "",
          recommendations: lymphNodesData?.recommendations || "",
          element: <LymphNodesResearchPrint />,
        },
        {
          id: "breast",
          key: "breast",
          label: "Молочные железы",
          studyData: breastData,
          conclusion: breastData?.conclusion || "",
          recommendations: breastData?.recommendations || "",
          element: <BreastResearchPrint />,
        },
        {
          id: "scrotum",
          key: "scrotum",
          label: "Органы мошонки",
          studyData: scrotumData,
          conclusion: scrotumData?.conclusion || "",
          recommendations: scrotumData?.recommendations || "",
          element: <ScrotumResearchPrint />,
        },
        {
          id: "childDispensary",
          key: "child-dispensary",
          label: "Детская диспансеризация",
          studyData: childDispensaryData,
          conclusion: childDispensaryData?.conclusion || "",
          recommendations: childDispensaryData?.recommendations || "",
          element: <ChildDispensaryPrint />,
        },
        {
          id: "softTissue",
          key: "soft-tissue",
          label: "Мягких тканей",
          studyData: softTissueData,
          conclusion: softTissueData?.conclusion || "",
          recommendations: softTissueData?.recommendations || "",
          element: <SoftTissuePrint />,
        },
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

  const conclusion = React.useMemo(
    () => joinVisibleSections(appliedConclusionSections, "conclusion"),
    [appliedConclusionSections],
  );

  const recommendations = React.useMemo(
    () => joinVisibleSections(appliedConclusionSections, "recommendations"),
    [appliedConclusionSections],
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

  React.useLayoutEffect(() => {
    if (Object.keys(sourceBlockHtml).length > 0 || !sourceContainerRef.current) {
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
      if (!blockId) {
        return;
      }
      nextHtml[blockId] = element.innerHTML.trim();
    });
    setSourceBlockHtml(nextHtml);
  }, [sourceBlockHtml]);

  React.useEffect(() => {
    if (Object.keys(sourceBlockHtml).length === 0) {
      return;
    }

    setDraftOverrides(buildDraftOverrides(appliedOverrides));
  }, [appliedOverrides, buildDraftOverrides, sourceBlockHtml]);

  const displayBlocks = React.useMemo<ResearchBlock[]>(() => {
    const bodyBlocks = studyDefinitions.reduce<ResearchBlock[]>((acc, definition) => {
      const overrideKey = bodyOverrideKey(definition.id);
      const editedValue = previewOverrides[overrideKey];
      const hasOverride = Object.prototype.hasOwnProperty.call(previewOverrides, overrideKey);

      if (hasOverride && hasVisibleHtmlContent(editedValue)) {
        acc.push({
          id: definition.id,
          element: <EditablePrintHtmlBlock value={editedValue ?? ""} />,
        });
        return acc;
      }

      acc.push({ id: definition.id, element: definition.element });
      return acc;
    }, []);

    return [
      { id: "header", element: <ResearchPrintHeader /> },
      ...bodyBlocks,
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
  }, [appliedConclusionSections, conclusion, doctorName, previewOverrides, recommendations, studyDefinitions]);

  const sourceContainerRef = React.useRef<HTMLDivElement | null>(null);
  const measureContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = React.useState<ResearchBlock[][] | null>(null);

  React.useLayoutEffect(() => {
    if (!measureContainerRef.current) {
      return;
    }

    const children = Array.from(measureContainerRef.current.children) as HTMLElement[];
    const heightLimit = 1120;

    const newPages: ResearchBlock[][] = [];
    let currentPage: ResearchBlock[] = [];
    let currentHeight = 0;

    children.forEach((child, index) => {
      const block = displayBlocks[index];
      if (!block) {
        return;
      }
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

  const handleDraftChange = React.useCallback((key: string, value: string) => {
    setDraftOverrides((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleStartEditing = React.useCallback(() => {
    setDraftOverrides(buildDraftOverrides(appliedOverrides));
    setIsEditMode(true);
  }, [appliedOverrides, buildDraftOverrides]);

  const handleCancelEditing = React.useCallback(() => {
    setDraftOverrides(buildDraftOverrides(appliedOverrides));
    setIsEditMode(false);
  }, [appliedOverrides, buildDraftOverrides]);

  const handleSaveOverrides = React.useCallback(() => {
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

    setAppliedOverrides(nextOverrides);
    setIsEditMode(false);
  }, [draftOverrides, studyDefinitions]);

  const handleResetOverrides = React.useCallback(() => {
    setAppliedOverrides({});
    setDraftOverrides(buildDraftOverrides({}));
    setIsEditMode(false);
  }, [buildDraftOverrides]);

  if (!pages) {
    return (
      <div ref={ref} id="print-root">
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
    );
  }

  const sourceNodes = (
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
  );

  const measureNodes = (
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
      <div hidden aria-hidden="true">
        {studyDefinitions.map((definition) => (
          <div key={definition.id} data-source-block-id={bodyOverrideKey(definition.id)}>
            {definition.element}
          </div>
        ))}
      </div>
      {displayBlocks.map((block) => (
        <div key={block.id}>{block.element}</div>
      ))}
    </div>
  );

  return (
    <div className="space-y-4">
      {sourceNodes}
      <div
        data-print-editor
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Редактирование печатной версии</h3>
            <p className="mt-1 text-xs text-slate-500">
              Можно поправить уже собранный текст по каждому исследованию, не меняя исходную форму
              протоколирования.
            </p>
          </div>

          {!isEditMode ? (
            <button
              type="button"
              onClick={handleStartEditing}
              disabled={studyDefinitions.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="i-ph-pencil-simple-line-duotone text-base" />
              <span>Редактировать текст</span>
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleResetOverrides}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <span className="i-ph-arrow-counter-clockwise-duotone text-base" />
                <span>Сбросить правки</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEditing}
                className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 ring-1 ring-slate-200 transition hover:bg-slate-50"
              >
                <span className="i-ph-x-circle-duotone text-base" />
                <span>Отмена</span>
              </button>
              <button
                type="button"
                onClick={handleSaveOverrides}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-emerald-500"
              >
                <span className="i-ph-floppy-disk-back-duotone text-base" />
                <span>Сохранить правки</span>
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
                <section key={definition.id} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
                  <h4 className="text-sm font-semibold text-slate-900">{definition.label}</h4>

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
                        onChange={(event) => handleDraftChange(conclusionKey, event.target.value)}
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

      {measureNodes}
      <div ref={ref} id="print-root">
        <div>
          {pages.map((pageBlocks, pageIndex) => (
            <div key={pageIndex} className="print-page">
              <div className="print-page-inner">
                {pageBlocks.filter(Boolean).map((block) => (
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
    </div>
  );
});

PrintableProtocol.displayName = "PrintableProtocol";

export default PrintableProtocol;
