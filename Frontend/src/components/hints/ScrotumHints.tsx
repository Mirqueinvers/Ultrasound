// src/components/hints/ScrotumHints.tsx
import React from "react";

interface ConclusionSample {
  title: string;
  value: string;
}

interface ScrotumHintsProps {
  onAddText: (text: string) => void;
}

const ScrotumHints: React.FC<ScrotumHintsProps> = ({ onAddText }) => {
  const samples: ConclusionSample[] = [
    {
      title: "Норма",
      value: "УЗ-признаков патологии органов мошонки не выявлено."
    },
    {
      title: "Варикоцеле",
      value: "Эхографические признаки варикоцеле."
    },
    {
      title: "Гидроцеле",
      value: "Эхографические признаки гидроцеле."
    }
  ];

  const handleSampleClick = (sample: ConclusionSample) => {
    onAddText(sample.value);
  };

  return (
    <div className="space-y-2">
      {samples.map((sample, index) => (
        <button
          key={index}
          onClick={() => handleSampleClick(sample)}
          className="w-full text-left p-2 text-xs bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors"
          title={sample.value}
        >
          {sample.title}
        </button>
      ))}
    </div>
  );
};

export default ScrotumHints;