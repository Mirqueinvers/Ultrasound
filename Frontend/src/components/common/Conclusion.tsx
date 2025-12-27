import React, { useState } from "react";

export interface ConclusionData {
  conclusion: string;
  recommendations: string;
}

export interface ConclusionProps {
  value?: ConclusionData;
  onChange?: (value: ConclusionData) => void;
}

export const Conclusion: React.FC<ConclusionProps> = ({
  value,
  onChange,
}) => {
  const [conclusion, setConclusion] = useState(value?.conclusion ?? "");
  const [recommendations, setRecommendations] = useState(
    value?.recommendations ?? ""
  );

  const handleConclusionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setConclusion(newValue);
    onChange?.({
      conclusion: newValue,
      recommendations,
    });
  };

  const handleRecommendationsChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>
  ) => {
    const newValue = e.target.value;
    setRecommendations(newValue);
    onChange?.({
      conclusion,
      recommendations: newValue,
    });
  };

  return (
    <div className="border border-slate-200 rounded-lg p-5 bg-slate-50">
        {/* Заключение */}
        <div>
            <h3 className="m-0 text-slate-800 text-lg font-semibold mb-2">
                Заключение
            </h3>
            <textarea
                value={conclusion}
                onChange={handleConclusionChange}
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
        </div>

        {/* Рекомендации */}
        <div>
            <h3 className="m-0 text-slate-800 text-lg font-semibold mb-2">
                Рекомендации
            </h3>
            <textarea
                value={recommendations}
                onChange={handleRecommendationsChange}
                rows={6}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
        </div>
    </div>
  );
};

export default Conclusion;
