// /components/print/researches/UrinaryBladderStudyPrint.tsx
import React from "react";

import { useResearch } from "@contexts";
import UrinaryBladderPrint from "@/components/print/organs/UrinaryBladderPrint";

export const UrinaryBladderStudyPrint: React.FC = () => {
  const { studiesData } = useResearch();

  // ключ исследования как у тебя в селекте/контенте
  const bladderStudyData = studiesData["Мочевой пузырь"];
  const bladderData = bladderStudyData?.urinaryBladder ?? bladderStudyData;

  const hasBladderData = !!bladderData;

  if (!hasBladderData) {
    return null;
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование мочевого пузыря
      </p>

      <UrinaryBladderPrint value={bladderData} />
    </>
  );
};

export default UrinaryBladderStudyPrint;
