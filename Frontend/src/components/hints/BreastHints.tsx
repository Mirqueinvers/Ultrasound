// src/components/hints/BreastHints.tsx
import React from "react";

interface ConclusionSample {
  title: string;
  value: string;
}

interface BreastHintsProps {
  onAddText: (text: string) => void;
}

const BreastHints: React.FC<BreastHintsProps> = ({ onAddText }) => {
  const samples: ConclusionSample[] = [
    {
      title: "Норма",
      value: "УЗ-признаков патологии молочных желез не выявлено."
    },
    {
      title: "Фиброзно-кистозная мастопатия",
      value: "Эхографические признаки фиброзно-кистозной мастопатии."
    },
    {
      title: "Узлов правой молочной железы",
      value: "Эхографические признаки узловых изменений правой молочной железы."
    },
    {
      title: "Узлов левой молочной железы",
      value: "Эхографические признаки узловых изменений левой молочной железы."
    },
    {
      title: "Мастит",
      value: "Эхографические признаки мастита."
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

export default BreastHints;