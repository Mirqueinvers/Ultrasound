// /components/print/PrintTestSection.tsx
import React from "react";
import { useResearch } from "@contexts";
import { useAuth } from "@/contexts/useAuth";
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
} from "@types";
import { STUDY_KEYS } from "@/domain/studyKeys";

export const PrintTestSection: React.FC = () => {
  const { studiesData } = useResearch();
  const { user } = useAuth();

  const obpData = studiesData[STUDY_KEYS.OBP];
  const kidneysData = studiesData[STUDY_KEYS.KIDNEYS];
  const bladderStudyData = studiesData[STUDY_KEYS.URINARY_BLADDER];
  const omtFemaleData = studiesData[STUDY_KEYS.OMT_FEMALE];
  const omtMaleData = studiesData[STUDY_KEYS.OMT_MALE];
  const thyroidData = studiesData[STUDY_KEYS.THYROID];
  const breastData = studiesData[STUDY_KEYS.BREAST];
  const scrotumData = studiesData[STUDY_KEYS.SCROTUM];
  const childDispensaryData = studiesData[STUDY_KEYS.CHILD_DISPENSARY];
  const softTissueData = studiesData[STUDY_KEYS.SOFT_TISSUE];

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

  const conclusion =
    (obpProtocol?.conclusion || "") +
    (obpProtocol?.conclusion && kidneysProtocol?.conclusion ? "\n" : "") +
    (kidneysProtocol?.conclusion || "") +
    ((obpProtocol?.conclusion || kidneysProtocol?.conclusion) &&
    bladderStudyProtocol?.conclusion
      ? "\n"
      : "") +
    (bladderStudyProtocol?.conclusion || "") +
    (((obpProtocol?.conclusion ||
      kidneysProtocol?.conclusion ||
      bladderStudyProtocol?.conclusion) &&
      omtFemaleProtocol?.conclusion)
      ? "\n"
      : "") +
    (omtFemaleProtocol?.conclusion || "") +
    (((obpProtocol?.conclusion ||
      kidneysProtocol?.conclusion ||
      bladderStudyProtocol?.conclusion ||
      omtFemaleProtocol?.conclusion) &&
      omtMaleProtocol?.conclusion)
      ? "\n"
      : "") +
    (omtMaleProtocol?.conclusion || "") +
    ((obpProtocol?.conclusion ||
      kidneysProtocol?.conclusion ||
      bladderStudyProtocol?.conclusion ||
      omtFemaleProtocol?.conclusion ||
      omtMaleProtocol?.conclusion) &&
      thyroidProtocol?.conclusion
      ? "\n"
      : "") +
    (thyroidProtocol?.conclusion || "") +
    (((obpProtocol?.conclusion ||
      kidneysProtocol?.conclusion ||
      bladderStudyProtocol?.conclusion ||
      omtFemaleProtocol?.conclusion ||
      omtMaleProtocol?.conclusion ||
      thyroidProtocol?.conclusion) &&
      breastProtocol?.conclusion)
      ? "\n"
      : "") +
    (breastProtocol?.conclusion || "") +
    (((obpProtocol?.conclusion ||
      kidneysProtocol?.conclusion ||
      bladderStudyProtocol?.conclusion ||
      omtFemaleProtocol?.conclusion ||
      omtMaleProtocol?.conclusion ||
      thyroidProtocol?.conclusion ||
      breastProtocol?.conclusion) &&
      scrotumProtocol?.conclusion)
      ? "\n"
      : "") +
    (scrotumProtocol?.conclusion || "") +
    (((obpProtocol?.conclusion ||
      kidneysProtocol?.conclusion ||
      bladderStudyProtocol?.conclusion ||
      omtFemaleProtocol?.conclusion ||
      omtMaleProtocol?.conclusion ||
      thyroidProtocol?.conclusion ||
      breastProtocol?.conclusion ||
      scrotumProtocol?.conclusion) &&
      childDispensaryProtocol?.conclusion)
      ? "\n"
      : "") +
    (childDispensaryProtocol?.conclusion || "") +
    (((obpProtocol?.conclusion ||
      kidneysProtocol?.conclusion ||
      bladderStudyProtocol?.conclusion ||
      omtFemaleProtocol?.conclusion ||
      omtMaleProtocol?.conclusion ||
      thyroidProtocol?.conclusion ||
      breastProtocol?.conclusion ||
      scrotumProtocol?.conclusion ||
      childDispensaryProtocol?.conclusion) &&
      softTissueProtocol?.conclusion)
      ? "\n"
      : "") +
    (softTissueProtocol?.conclusion || "");

  const recommendations =
    (obpProtocol?.recommendations || "") +
    (obpProtocol?.recommendations && kidneysProtocol?.recommendations ? "\n" : "") +
    (kidneysProtocol?.recommendations || "") +
    ((obpProtocol?.recommendations || kidneysProtocol?.recommendations) &&
    bladderStudyProtocol?.recommendations
      ? "\n"
      : "") +
    (bladderStudyProtocol?.recommendations || "") +
    (((obpProtocol?.recommendations ||
      kidneysProtocol?.recommendations ||
      bladderStudyProtocol?.recommendations) &&
      omtFemaleProtocol?.recommendations)
      ? "\n"
      : "") +
    (omtFemaleProtocol?.recommendations || "") +
    (((obpProtocol?.recommendations ||
      kidneysProtocol?.recommendations ||
      bladderStudyProtocol?.recommendations ||
      omtFemaleProtocol?.recommendations) &&
      omtMaleProtocol?.recommendations)
      ? "\n"
      : "") +
    (omtMaleProtocol?.recommendations || "") +
    ((obpProtocol?.recommendations ||
      kidneysProtocol?.recommendations ||
      bladderStudyProtocol?.recommendations ||
      omtFemaleProtocol?.recommendations ||
      omtMaleProtocol?.recommendations) &&
      thyroidProtocol?.recommendations
      ? "\n"
      : "") +
    (thyroidProtocol?.recommendations || "") +
    (((obpProtocol?.recommendations ||
      kidneysProtocol?.recommendations ||
      bladderStudyProtocol?.recommendations ||
      omtFemaleProtocol?.recommendations ||
      omtMaleProtocol?.recommendations ||
      thyroidProtocol?.recommendations) &&
      breastProtocol?.recommendations)
      ? "\n"
      : "") +
    (breastProtocol?.recommendations || "") +
    (((obpProtocol?.recommendations ||
      kidneysProtocol?.recommendations ||
      bladderStudyProtocol?.recommendations ||
      omtFemaleProtocol?.recommendations ||
      omtMaleProtocol?.recommendations ||
      thyroidProtocol?.recommendations ||
      breastProtocol?.recommendations) &&
      scrotumProtocol?.recommendations)
      ? "\n"
      : "") +
    (scrotumProtocol?.recommendations || "") +
    (((obpProtocol?.recommendations ||
      kidneysProtocol?.recommendations ||
      bladderStudyProtocol?.recommendations ||
      omtFemaleProtocol?.recommendations ||
      omtMaleProtocol?.recommendations ||
      thyroidProtocol?.recommendations ||
      breastProtocol?.recommendations ||
      scrotumProtocol?.recommendations) &&
      childDispensaryProtocol?.recommendations)
      ? "\n"
      : "") +
    (childDispensaryProtocol?.recommendations || "") +
    (((obpProtocol?.recommendations ||
      kidneysProtocol?.recommendations ||
      bladderStudyProtocol?.recommendations ||
      omtFemaleProtocol?.recommendations ||
      omtMaleProtocol?.recommendations ||
      thyroidProtocol?.recommendations ||
      breastProtocol?.recommendations ||
      scrotumProtocol?.recommendations ||
      childDispensaryProtocol?.recommendations) &&
      softTissueProtocol?.recommendations)
      ? "\n"
      : "") +
    (softTissueProtocol?.recommendations || "");

  const doctorName = user?.name || "";

  return (
    <div className="flex justify-center py-6 bg-slate-100">
      <div
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
  );
};

export default PrintTestSection;
