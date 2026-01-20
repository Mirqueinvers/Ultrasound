// Frontend/src/components/print/PrintModal.tsx
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

interface PrintModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PrintModal: React.FC<PrintModalProps> = ({ isOpen, onClose }) => {
  const { studiesData } = useResearch();
  const { user } = useAuth();

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

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
<div
  className="fixed inset-0 z-50 flex justify-center bg-black/50 py-[90px] pb-[50px]"
  aria-modal="true"
  role="dialog"
>
  <div className="bg-white rounded-md shadow-lg w-[230mm] max-h-full flex flex-col">
        {/* Верхняя панель с кнопками */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200">
          <span className="text-sm text-slate-600">
            Печатная версия протокола
          </span>

          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1 text-sm rounded bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
            >
              Печать
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 text-sm rounded bg-slate-200 text-slate-800 hover:bg-slate-300 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>

        {/* Сам лист А4 */}
        <div className="overflow-auto p-4 bg-slate-100">
          <div
            id="print-area"
            className="mx-auto"
            style={{
              width: "210mm",
              minHeight: "297mm",
              backgroundColor: "#ffffff",
              padding: "20mm",
              boxShadow:
                "0 4px 10px rgba(0,0,0,0.15), 0 2px 4px rgba(0,0,0,0.1)",
              borderRadius: "4px",
              boxSizing: "border-box",
            }}
          >
            <ResearchPrintHeader />

            <ObpPrint />

            <div style={{ marginTop: "10mm" }}>
              <ThyroidResearchPrint />
            </div>

            <div style={{ marginTop: "10mm" }}>
              <BreastResearchPrint />
            </div>

            <div style={{ marginTop: "10mm" }}>
              <ScrotumResearchPrint />
            </div>

            <div style={{ marginTop: "10mm" }}>
              <OmtFemalePrint />
            </div>

            <div style={{ marginTop: "10mm" }}>
              <OmtMalePrint />
            </div>

            <div style={{ marginTop: "10mm" }}>
              <KidneysPrint />
            </div>

            <div style={{ marginTop: "10mm" }}>
              <UrinaryBladderStudyPrint />
            </div>

            <div style={{ marginTop: "10mm" }}>
              <ChildDispensaryPrint />
            </div>

            <div style={{ marginTop: "10mm" }}>
              <SoftTissuePrint />
            </div>

            <div>
              <ConclusionPrint
                value={{
                  conclusion,
                  recommendations,
                }}
              />
            </div>

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
        </div>
      </div>
    </div>
  );
};

export default PrintModal;
