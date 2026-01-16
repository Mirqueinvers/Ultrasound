// /components/print/ConclusionPrint.tsx
import React from "react";

export interface ConclusionPrintData {
  conclusion: string;
  recommendations: string;
}

export interface ConclusionPrintProps {
  value?: ConclusionPrintData;
}

export const ConclusionPrint: React.FC<ConclusionPrintProps> = ({ value }) => {
  const conclusion = value?.conclusion ?? "";
  const recommendations = value?.recommendations ?? "";

  return (
    <div className="mt-4">
      {conclusion && (
        <div className="mt-2">
          <p className="text-sm text-slate-900 whitespace-pre-wrap">
            <span className="text-xxs font-semibold text-black">
              Заключение:
            </span>{" "}
            {conclusion}
          </p>
        </div>
      )}

      {recommendations && (
        <div className="mt-2">
          <p className="text-sm text-slate-900 whitespace-pre-wrap">
            <span className="text-xxs font-semibold text-black">
              Рекомендации:
            </span>{" "}
            {recommendations}
          </p>
        </div>
      )}

      {!conclusion && !recommendations }
    </div>
  );
};

export default ConclusionPrint;
