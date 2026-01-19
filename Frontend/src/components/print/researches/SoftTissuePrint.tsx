import React from "react";
import { useResearch } from "@contexts";
import type { SoftTissueProtocol } from "@types";

export const SoftTissuePrint: React.FC = () => {
  const { studiesData } = useResearch();

  const data = studiesData["Мягких тканей"] as SoftTissueProtocol | undefined;

  if (!data) return null;

  const { researchArea, description } = data;

  const hasMainContent =
    (researchArea && researchArea.trim()) ||
    (description && description.trim());

  if (!hasMainContent) return null;

  return (
    <>
      <p className="mt-4 mb-2 text-center text-base font-semibold">
        Ультразвуковое исследование мягких тканей
      </p>

      {researchArea?.trim() && (
        <p className="mt-1 text-sm">
          <strong>Область исследования:</strong> {researchArea.trim()}.
        </p>
      )}

      {description?.trim() && (
        <p className="mt-1 text-sm" style={{ whiteSpace: "pre-line" }}>
          <strong>Описание исследования:</strong> {description.trim()}
        </p>
      )}
    </>
  );
};

export default SoftTissuePrint;
