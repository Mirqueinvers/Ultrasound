// src/components/hints/NormalValuesPanel.tsx
import React from "react";
import { normalRanges } from "@common";

interface NormalValuesPanelProps {
  organ: string;
  field?: string;
}

const NormalValuesPanel: React.FC<NormalValuesPanelProps> = ({
  organ,
  field,
}) => {
  const ranges = normalRanges[organ as keyof typeof normalRanges];

  if (!ranges) {
    return <p className="text-slate-500 text-xs">Нет данных</p>;
  }

  const fieldsToShow = field
    ? { [field]: ranges[field as keyof typeof ranges] }
    : ranges;

  return (
    <div className="space-y-3">
      {Object.entries(fieldsToShow).map(([key, range]) => (
        <div
          key={key}
          className="p-2 bg-blue-50 rounded border border-blue-200"
        >
          <div className="text-xs font-medium text-blue-800 capitalize">
            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {range.min === 0 ? `до ${range.max}` : `${range.min}-${range.max}`}{" "}
            {range.unit}
          </div>
        </div>
      ))}
    </div>
  );
};

export default NormalValuesPanel;