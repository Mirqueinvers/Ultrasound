// src/components/common/Conclusion.tsx
import React, { useState, useEffect } from "react";
import { ResearchSectionCard } from "@/UI/ResearchSectionCard";

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
    <ResearchSectionCard title="Заключение и рекомендации">
      <div className="space-y-5">
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
    </ResearchSectionCard>
  );
};

export default Conclusion;
