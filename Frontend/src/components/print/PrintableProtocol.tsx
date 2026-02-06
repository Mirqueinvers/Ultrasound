// Frontend/src/components/print/PrintableProtocol.tsx
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

type BlockId =
  | "header"
  | "obp"
  | "thyroid"
  | "pleural"
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

const PrintableProtocol = React.forwardRef<HTMLDivElement>((_props, ref) => {
  const { studiesData } = useResearch();
  const { user } = useAuth();

  const obpData = studiesData["ОБП"];
  const kidneysData = studiesData["Почки"];
  const bladderStudyData = studiesData["Мочевой пузырь"];
  const omtFemaleData = studiesData["ОМТ (Ж)"];
  const omtMaleData = studiesData["ОМТ (М)"];
  const thyroidData = studiesData["Щитовидная железа"];
  const pleuralData = studiesData["Плевральные полости"];
  const breastData = studiesData["Молочные железы"];
  const scrotumData = studiesData["Органы мошонки"];
  const childDispensaryData = studiesData["Детская диспансеризация"];
  const softTissueData = studiesData["Мягких тканей"];
  const lymphNodesData = studiesData["Лимфатические узлы"];

  const conclusion =
    (obpData?.conclusion || "") +
    (obpData?.conclusion && kidneysData?.conclusion ? "\n" : "") +
    (kidneysData?.conclusion || "") +
    ((obpData?.conclusion || kidneysData?.conclusion) &&
    bladderStudyData?.conclusion
      ? "\n"
      : "") +
    (bladderStudyData?.conclusion || "") +
    (((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion) &&
      omtFemaleData?.conclusion)
      ? "\n"
      : "") +
    (omtFemaleData?.conclusion || "") +
    (((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion ||
      omtFemaleData?.conclusion) &&
      omtMaleData?.conclusion)
      ? "\n"
      : "") +
    (omtMaleData?.conclusion || "") +
    ((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion ||
      omtFemaleData?.conclusion ||
      omtMaleData?.conclusion) &&
      thyroidData?.conclusion
      ? "\n"
      : "") +
    (thyroidData?.conclusion || "") +
    ((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion ||
      omtFemaleData?.conclusion ||
      omtMaleData?.conclusion ||
      thyroidData?.conclusion) &&
      pleuralData?.conclusion
      ? "\n"
      : "") +
    (pleuralData?.conclusion || "") +
    ((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion ||
      omtFemaleData?.conclusion ||
      omtMaleData?.conclusion ||
      thyroidData?.conclusion ||
      pleuralData?.conclusion) &&
      lymphNodesData?.conclusion
      ? "\n"
      : "") +
    (lymphNodesData?.conclusion || "") +
    (((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion ||
      omtFemaleData?.conclusion ||
      omtMaleData?.conclusion ||
      thyroidData?.conclusion) &&
      breastData?.conclusion)
      ? "\n"
      : "") +
    (breastData?.conclusion || "") +
    (((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion ||
      omtFemaleData?.conclusion ||
      omtMaleData?.conclusion ||
      thyroidData?.conclusion ||
      breastData?.conclusion) &&
      scrotumData?.conclusion)
      ? "\n"
      : "") +
    (scrotumData?.conclusion || "") +
    (((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion ||
      omtFemaleData?.conclusion ||
      omtMaleData?.conclusion ||
      thyroidData?.conclusion ||
      breastData?.conclusion ||
      scrotumData?.conclusion) &&
      childDispensaryData?.conclusion)
      ? "\n"
      : "") +
    (childDispensaryData?.conclusion || "") +
    (((obpData?.conclusion ||
      kidneysData?.conclusion ||
      bladderStudyData?.conclusion ||
      omtFemaleData?.conclusion ||
      omtMaleData?.conclusion ||
      thyroidData?.conclusion ||
      breastData?.conclusion ||
      scrotumData?.conclusion ||
      childDispensaryData?.conclusion) &&
      softTissueData?.conclusion)
      ? "\n"
      : "") +
    (softTissueData?.conclusion || "");

  const recommendations =
    (obpData?.recommendations || "") +
    (obpData?.recommendations && kidneysData?.recommendations ? "\n" : "") +
    (kidneysData?.recommendations || "") +
    ((obpData?.recommendations || kidneysData?.recommendations) &&
    bladderStudyData?.recommendations
      ? "\n"
      : "") +
    (bladderStudyData?.recommendations || "") +
    (((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations) &&
      omtFemaleData?.recommendations)
      ? "\n"
      : "") +
    (omtFemaleData?.recommendations || "") +
    (((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations ||
      omtFemaleData?.recommendations) &&
      omtMaleData?.recommendations)
      ? "\n"
      : "") +
    (omtMaleData?.recommendations || "") +
    ((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations ||
      omtFemaleData?.recommendations ||
      omtMaleData?.recommendations) &&
      thyroidData?.recommendations
      ? "\n"
      : "") +
    (thyroidData?.recommendations || "") +
    ((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations ||
      omtFemaleData?.recommendations ||
      omtMaleData?.recommendations ||
      thyroidData?.recommendations) &&
      pleuralData?.recommendations
      ? "\n"
      : "") +
    (pleuralData?.recommendations || "") +
    ((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations ||
      omtFemaleData?.recommendations ||
      omtMaleData?.recommendations ||
      thyroidData?.recommendations ||
      pleuralData?.recommendations) &&
      lymphNodesData?.recommendations
      ? "\n"
      : "") +
    (lymphNodesData?.recommendations || "") +
    (((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations ||
      omtFemaleData?.recommendations ||
      omtMaleData?.recommendations ||
      thyroidData?.recommendations) &&
      breastData?.recommendations)
      ? "\n"
      : "") +
    (breastData?.recommendations || "") +
    (((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations ||
      omtFemaleData?.recommendations ||
      omtMaleData?.recommendations ||
      thyroidData?.recommendations ||
      breastData?.recommendations) &&
      scrotumData?.recommendations)
      ? "\n"
      : "") +
    (scrotumData?.recommendations || "") +
    (((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations ||
      omtFemaleData?.recommendations ||
      omtMaleData?.recommendations ||
      thyroidData?.recommendations ||
      breastData?.recommendations ||
      scrotumData?.recommendations) &&
      childDispensaryData?.recommendations)
      ? "\n"
      : "") +
    (childDispensaryData?.recommendations || "") +
    (((obpData?.recommendations ||
      kidneysData?.recommendations ||
      bladderStudyData?.recommendations ||
      omtFemaleData?.recommendations ||
      omtMaleData?.recommendations ||
      thyroidData?.recommendations ||
      breastData?.recommendations ||
      scrotumData?.recommendations ||
      childDispensaryData?.recommendations) &&
      softTissueData?.recommendations)
      ? "\n"
      : "") +
    (softTissueData?.recommendations || "");

  const doctorName = user?.name || "";

  // 1. Описываем блоки в нужном порядке
  const blocks = React.useMemo<ResearchBlock[]>(
    () => [
      { id: "header", element: <ResearchPrintHeader /> },
      { id: "obp", element: <ObpPrint /> },
      { id: "kidneys", element: <KidneysPrint /> },
      { id: "bladder", element: <UrinaryBladderStudyPrint /> },
      { id: "omtFemale", element: <OmtFemalePrint /> },
      { id: "omtMale", element: <OmtMalePrint /> },
      { id: "thyroid", element: <ThyroidResearchPrint /> },
      { id: "pleural", element: <PleuralResearchPrint /> },
      { id: "lymphNodes", element: <LymphNodesResearchPrint /> },
      { id: "breast", element: <BreastResearchPrint /> },
      { id: "scrotum", element: <ScrotumResearchPrint /> },
      { id: "childDispensary", element: <ChildDispensaryPrint /> },
      { id: "softTissue", element: <SoftTissuePrint /> },
      {
        id: "conclusion",
        element: (
          <div className="print-conclusion">
            <ConclusionPrint
              value={{ conclusion, recommendations }}
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

    ],
    [
      conclusion,
      recommendations,
      doctorName,
      obpData,
      kidneysData,
      bladderStudyData,
      omtFemaleData,
      omtMaleData,
      thyroidData,
      pleuralData,
      breastData,
      scrotumData,
      childDispensaryData,
      softTissueData,
      lymphNodesData,
    ]
  );

  const measureContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = React.useState<ResearchBlock[][] | null>(null);

  // 2. Один раз измеряем высоту блоков и разбиваем на страницы
  React.useLayoutEffect(() => {
    if (!measureContainerRef.current) return;

    const children = Array.from(
      measureContainerRef.current.children
    ) as HTMLElement[];

    const heightLimit = 1120; // или твоё актуальное значение

    const newPages: ResearchBlock[][] = [];
    let currentPage: ResearchBlock[] = [];
    let currentHeight = 0;

    children.forEach((child, index) => {
      const block = blocks[index];
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
  }, [blocks]);

  // 3. Пока страницы не посчитаны – рендерим скрытый контейнер для измерения
  if (!pages) {
    return (
      <div ref={ref} id="print-root">
        <div
          ref={measureContainerRef}
          style={{
            visibility: "hidden",
            position: "absolute",
            top: 0,
            left: 0,
            width: "210mm",
            zIndex: -1,
          }}
        >
          {blocks.map((b) => (
            <div key={b.id}>{b.element}</div>
          ))}
        </div>
      </div>
    );
  }

  // 4. Рендерим страницы
  return (
    <div ref={ref} id="print-root">
      {pages.map((pageBlocks, pageIndex) => (
        <div key={pageIndex} className="print-page">
          <div className="print-page-inner">
            {pageBlocks.map((b) => (
              <div
                key={b.id}
                className="no-break"
                style={{ marginTop: b.id === "header" ? 0 : "10mm" }}
              >
                {b.element}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

PrintableProtocol.displayName = "PrintableProtocol";

export default PrintableProtocol;
