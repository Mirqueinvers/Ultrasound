import React from "react";
import { useResearch } from "@contexts";
import HepatPrint from "@/components/print/organs/HepatPrint";
import GallbladderPrint from "@/components/print/organs/GallbladderPrint";
import PancreasPrint from "@/components/print/organs/PancreasPrint";
import SpleenPrint from "@/components/print/organs/SpleenPrint";
import KidneysPrint from "@/components/print/researches/KidneysPrint";
import type { ChildDispensaryProtocol } from "@types";

export const ChildDispensaryPrint: React.FC = () => {
  const { studiesData } = useResearch();
  const data = studiesData["Детская диспансеризация"] as
    | ChildDispensaryProtocol
    | undefined;

  if (!data) return null;

  const {
    liverStatus,
    liver,
    gallbladderStatus,
    gallbladder,
    pancreasStatus,
    pancreas,
    spleenStatus,
    spleen,
    kidneysStatus,
    rightKidney,
    leftKidney,
  } = data;

  const hasAnyContent =
    liverStatus ||
    gallbladderStatus ||
    pancreasStatus ||
    spleenStatus ||
    kidneysStatus;

  if (!hasAnyContent) return null;

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование органов брюшной полости и почек
        <br />
        (детская диспансеризация)
      </p>


      {/* Печень */}
      {liverStatus === "без патологии" && (
        <p className="mt-1 text-sm">
          <strong>Печень:</strong> без патологии.
        </p>
      )}
      {liverStatus === "патология" && liver && (
        <div className="mt-2">
          <HepatPrint value={liver} />
        </div>
      )}

      {/* Желчный пузырь */}
      {gallbladderStatus === "без патологии" && (
        <p className="mt-1 text-sm">
          <strong>Желчный пузырь:</strong> без патологии.
        </p>
      )}
      {gallbladderStatus === "патология" && gallbladder && (
        <div className="mt-4">
          <GallbladderPrint value={gallbladder} />
        </div>
      )}

      {/* Поджелудочная железа */}
      {pancreasStatus === "без патологии" && (
        <p className="mt-1 text-sm">
          <strong>Поджелудочная железа:</strong> без патологии.
        </p>
      )}
      {pancreasStatus === "патология" && pancreas && (
        <div className="mt-4">
          <PancreasPrint value={pancreas} />
        </div>
      )}

      {/* Селезенка */}
      {spleenStatus === "без патологии" && (
        <p className="mt-1 text-sm">
          <strong>Селезенка:</strong> без патологии.
        </p>
      )}
      {spleenStatus === "патология" && spleen && (
        <div className="mt-4">
          <SpleenPrint value={spleen} />
        </div>
      )}

      {/* Почки */}
      {kidneysStatus === "без патологии" && (
        <p className="mt-1 text-sm">
          <strong>Почки:</strong> без патологии.
        </p>
      )}
      {kidneysStatus === "патология" && (rightKidney || leftKidney) && (
        <div className="mt-4">
          <KidneysPrint />
        </div>
      )}
    </>
  );
};

export default ChildDispensaryPrint;
