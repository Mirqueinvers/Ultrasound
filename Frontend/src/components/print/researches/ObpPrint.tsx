// /components/print/researches/ObpPrint.tsx
import React from "react";

import { useResearch } from "@contexts";
import HepatPrint from "@/components/print/organs/HepatPrint";
import GallbladderPrint from "@/components/print/organs/GallbladderPrint";
import PancreasPrint from "@/components/print/organs/PancreasPrint";
import SpleenPrint from "@/components/print/organs/SpleenPrint";

export const ObpPrint: React.FC = () => {
  const { studiesData } = useResearch();

  const obpData = studiesData["ОБП"];
  const liverData = obpData?.liver;
  const gallbladderData = obpData?.gallbladder;
  const pancreasData = obpData?.pancreas;
  const spleenData = obpData?.spleen;

  const hasObpData =
    liverData ||
    gallbladderData ||
   pancreasData ||
    spleenData ||
    obpData?.freeFluid;

  if (!hasObpData) {
    return null;
  }

  const freeFluid = (obpData?.freeFluid as string | undefined) ?? "";
  const freeFluidDetails =
    (obpData?.freeFluidDetails as string | undefined) ?? "";

  let freeFluidLine: string;

  if (freeFluid === "определяется" && freeFluidDetails.trim().length > 0) {
    freeFluidLine = freeFluidDetails.trim();
  } else if (freeFluid === "определяется") {
    freeFluidLine = "Определяется свободная жидкость в брюшной полости.";
  } else {
    freeFluidLine = "Свободная жидкость в брюшной полости не определяется.";
  }

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование органов брюшной полости
      </p>

      {liverData && <HepatPrint value={liverData} />}

      {gallbladderData && <GallbladderPrint value={gallbladderData} />}

      {pancreasData && <PancreasPrint value={pancreasData} />}

      {spleenData && <SpleenPrint value={spleenData} />}

      {freeFluid !== "" && (
        <div className="mt-3">
          <span
            className="text-sm text-slate-900 whitespace-pre-wrap"
            style={{ fontFamily: '"Times New Roman", Times, serif' }}
          >
            {freeFluidLine}
          </span>
        </div>
      )}
    </>
  );
};

export default ObpPrint;
