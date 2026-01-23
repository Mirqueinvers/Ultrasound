// Frontend/src/components/print/PrintableSavedProtocol.tsx
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useResearch } from "@contexts";
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

type BlockId =
  | "header"
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
  | "conclusion";

interface ResearchBlock {
  id: BlockId;
  element: React.ReactNode;
}

interface SavedProtocol {
  researchId: number;
  studies: { [studyType: string]: any };
}

declare global {
  interface Window {
    protocolAPI: {
      getByResearchId: (id: number) => Promise<SavedProtocol | null>;
    };
    researchAPI: {
      getById: (id: number) => Promise<any>;
    };
    patientAPI: {
      getById: (id: number) => Promise<any>;
    };
  }
}

type PrintableSavedProtocolProps = {
  researchId: number;
};

const PrintableSavedProtocol = React.forwardRef<
  HTMLDivElement,
  PrintableSavedProtocolProps
>(({ researchId }, ref) => {
  const { user } = useAuth();
  const {
    studiesData,
    setStudyData,
    clearStudiesData,
    setPatientFullName,
    setPatientDateOfBirth,
    setResearchDate,
  } = useResearch();

  const [loading, setLoading] = React.useState(true);
  const measureContainerRef = React.useRef<HTMLDivElement | null>(null);
  const [pages, setPages] = React.useState<ResearchBlock[][] | null>(null);

  // 1. Загружаем сохранённые блоки протокола и кладём их в контекст
  React.useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      clearStudiesData();

      const protocol = await window.protocolAPI.getByResearchId(researchId);
      if (cancelled) return;

      if (protocol) {
        Object.entries(protocol.studies).forEach(([studyType, data]) => {
          // studyType уже: "ОБП", "Почки", "Мочевой пузырь", ...
          setStudyData(studyType, data);
        });
      }

      if (!cancelled) {
        setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
    // зависимость только от researchId, чтобы не ловить цикл
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [researchId]);

  // 2. Загружаем мета‑данные: пациент и дата исследования
  React.useEffect(() => {
    let cancelled = false;

    const loadMeta = async () => {
      const research = await window.researchAPI.getById(researchId);
      if (cancelled || !research) return;

      const patient = await window.patientAPI.getById(research.patient_id);
      if (cancelled || !patient) return;

      const fullName = `${patient.last_name} ${patient.first_name}${
        patient.middle_name ? " " + patient.middle_name : ""
      }`;

      setPatientFullName(fullName);
      setPatientDateOfBirth(patient.date_of_birth);
      // research_date может быть с временем, обрежем до даты
      const dateStr =
        typeof research.research_date === "string"
          ? research.research_date.slice(0, 10)
          : "";
      setResearchDate(dateStr);
    };

    loadMeta();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [researchId]);

  const obpData = studiesData["ОБП"];
  const kidneysData = studiesData["Почки"];
  const bladderStudyData = studiesData["Мочевой пузырь"];
  const omtFemaleData = studiesData["ОМТ (Ж)"];
  const omtMaleData = studiesData["ОМТ (М)"];
  const thyroidData = studiesData["Щитовидная железа"];
  const breastData = studiesData["Молочные железы"];
  const scrotumData = studiesData["Органы мошонки"];
  const childDispensaryData = studiesData["Детская диспансеризация"];
  const softTissueData = studiesData["Мягких тканей"];

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

  const blocks = React.useMemo<ResearchBlock[]>(
    () => [
      { id: "header", element: <ResearchPrintHeader /> },
      { id: "obp", element: <ObpPrint /> },
      { id: "kidneys", element: <KidneysPrint /> },
      { id: "bladder", element: <UrinaryBladderStudyPrint /> },
      { id: "omtFemale", element: <OmtFemalePrint /> },
      { id: "omtMale", element: <OmtMalePrint /> },
      { id: "thyroid", element: <ThyroidResearchPrint /> },
      { id: "breast", element: <BreastResearchPrint /> },
      { id: "scrotum", element: <ScrotumResearchPrint /> },
      { id: "childDispensary", element: <ChildDispensaryPrint /> },
      { id: "softTissue", element: <SoftTissuePrint /> },
      {
        id: "conclusion",
        element: (
          <div className="print-conclusion">
            <ConclusionPrint value={{ conclusion, recommendations }} />
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
      breastData,
      scrotumData,
      childDispensaryData,
      softTissueData,
    ],
  );

  React.useLayoutEffect(() => {
    if (!measureContainerRef.current) return;

    const children = Array.from(
      measureContainerRef.current.children,
    ) as HTMLElement[];

    const heightLimit = 1120;

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

  if (loading && !pages) {
    return (
      <div ref={ref} id="print-root" className="p-4 text-sm text-slate-500">
        Загрузка сохранённого протокола исследования...
      </div>
    );
  }

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

PrintableSavedProtocol.displayName = "PrintableSavedProtocol";

export default PrintableSavedProtocol;
