// /components/print/researches/KidneysPrint.tsx
import React from "react";

import { useResearch } from "@contexts";
import RightKidneyPrint from "@/components/print/organs/Kidney/RightKidneyPrint";
import LeftKidneyPrint from "@/components/print/organs/Kidney/LeftKidneyPrint";
// import BladderPrint from "@/components/print/organs/BladderPrint";

export const KidneysPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const kidneysData = studiesData["Почки"];
  const rightKidneyData = kidneysData?.rightKidney;
  const leftKidneyData = kidneysData?.leftKidney;
  const bladderData = kidneysData?.bladder;

  const hasKidneysData =
    rightKidneyData ||
    leftKidneyData ||
    bladderData;

  if (!hasKidneysData) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование почек
      </p>

      {rightKidneyData && <RightKidneyPrint value={rightKidneyData} />}

      {leftKidneyData && <LeftKidneyPrint value={leftKidneyData} />}

      {bladderData && <BladderPrint value={bladderData} />}
    </>
  );
};

export default KidneysPrint;
