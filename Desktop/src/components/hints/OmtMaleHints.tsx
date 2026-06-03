// src/components/hints/OmtMaleHints.tsx
import React from "react";

interface ConclusionSample {
  title: string;
  value: string;
}

interface OmtMaleHintsProps {
  onAddText: (text: string) => void;
}

const OmtMaleHints: React.FC<OmtMaleHintsProps> = ({ onAddText }) => {
  const samples: ConclusionSample[] = [
    {
      title: "Норма",
      value: "УЗ-признаков патологии органов малого таза не выявлено."
    },
    {
      title: "Аденома простаты",
      value: "Эхографические признаки аденомы предстательной железы."
    },
    {
      title: "Хронический простатит",
      value: "Эхографические признаки хронического простатита."
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

export default OmtMaleHints;