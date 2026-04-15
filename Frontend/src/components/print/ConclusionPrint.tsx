// src/components/print/ConclusionPrint.tsx
import React from "react";

export interface ConclusionPrintSection {
  key: string;
  conclusion?: string;
  recommendations?: string;
}

export interface ConclusionPrintData {
  conclusion: string;
  recommendations: string;
  sections?: ConclusionPrintSection[];
}

export interface ConclusionPrintProps {
  value?: ConclusionPrintData;
}

const normalizeVisibleText = (value?: string) =>
  value ? value.replace(/\r\n/g, "\n").replace(/\n+/g, " ").trim() : "";

const normalizeDataText = (value?: string) =>
  value ? value.replace(/\r\n/g, "\n").trim() : "";

export const ConclusionPrint: React.FC<ConclusionPrintProps> = ({ value }) => {
  const conclusion = normalizeVisibleText(value?.conclusion);
  const recommendations = normalizeVisibleText(value?.recommendations);
  const sections = (value?.sections ?? [])
    .map((section) => ({
      key: section.key.trim(),
      conclusion: normalizeDataText(section.conclusion),
      recommendations: normalizeDataText(section.recommendations),
    }))
    .filter((section) => section.key && (section.conclusion || section.recommendations));

  return (
    <div className="mt-4">
      {conclusion && (
        <div className="mt-2">
          <p className="text-sm text-slate-900">
            <span className="text-xxs font-semibold text-black">
              {"\u0417\u0430\u043a\u043b\u044e\u0447\u0435\u043d\u0438\u0435:"}
            </span>{" "}
            {conclusion}
          </p>
        </div>
      )}

      {recommendations && (
        <div className="mt-2">
          <p className="text-sm text-slate-900">
            <span className="text-xxs font-semibold text-black">
              {"\u0420\u0435\u043a\u043e\u043c\u0435\u043d\u0434\u0430\u0446\u0438\u0438:"}
            </span>{" "}
            {recommendations}
          </p>
        </div>
      )}

      {sections.length > 0 && (
        <div hidden aria-hidden="true">
          {sections.map((section) => (
            <div
              key={section.key}
              data-uzi-conclusion-key={section.key}
              data-uzi-conclusion={section.conclusion}
              data-uzi-recommendations={section.recommendations}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ConclusionPrint;
