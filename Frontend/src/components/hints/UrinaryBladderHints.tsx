// src/components/hints/UrinaryBladderHints.tsx
import React from "react";

interface ConclusionSample {
  title: string;
  value: string;
}

interface UrinaryBladderHintsProps {
  onAddText: (text: string) => void;
}

const UrinaryBladderHints: React.FC<UrinaryBladderHintsProps> = ({ onAddText }) => {
  const samples: ConclusionSample[] = [
    {
      title: "Норма",
      value: "УЗ-признаков патологии мочевого пузыря не выявлено."
    },
    {
      title: "Конкременты",
      value: "Эхографические признаки конкрементов мочевого пузыря."
    },
    {
      title: "Дивертикул",
      value: "Эхографические признаки дивертикула мочевого пузыря."
    },
    {
      title: "Цистит",
      value: "Эхографические признаки цистита."
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

export default UrinaryBladderHints;