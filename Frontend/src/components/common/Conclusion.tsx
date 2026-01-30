// src/components/common/Conclusion.tsx
import React, { useState, useEffect } from "react";

export interface ConclusionData {
  conclusion: string;
  recommendations: string;
}

export interface ConclusionProps {
  value?: ConclusionData;
  onChange?: (value: ConclusionData) => void;
  onConclusionFocus?: () => void;
  onConclusionBlur?: () => void;
}

export const Conclusion: React.FC<ConclusionProps> = ({
  value,
  onChange,
  onConclusionFocus,
  onConclusionBlur,
}) => {
  const [conclusion, setConclusion] = useState(value?.conclusion ?? "");
  const [recommendations, setRecommendations] = useState(
    value?.recommendations ?? ""
  );

  useEffect(() => {
    if (value) {
      setConclusion(value.conclusion ?? "");
      setRecommendations(value.recommendations ?? "");
    }
  }, [value?.conclusion, value?.recommendations]);

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
    <div className="bg-white border border-slate-200 rounded-2xl shadow-lg overflow-hidden">
      <div className="bg-sky-700 px-6 py-3">
        <h3 className="m-0 text-white text-lg font-semibold">
          Заключение и рекомендации
        </h3>
      </div>

      <div className="px-6 py-5 space-y-5">
        <div>
          <label className="block text-xxs font-semibold text-slate-600 mb-2">
            Заключение
          </label>
          <textarea
            value={conclusion}
            onChange={handleConclusionChange}
            onFocus={onConclusionFocus}
            onBlur={onConclusionBlur}
            rows={5}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
          />
        </div>

        <div>
          <label className="block text-xxs font-semibold text-slate-600 mb-2">
            Рекомендации
          </label>
          <textarea
            value={recommendations}
            onChange={handleRecommendationsChange}
            rows={5}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm text-slate-900 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 resize-none"
          />
        </div>
      </div>
    </div>
  );
};

export default Conclusion;
