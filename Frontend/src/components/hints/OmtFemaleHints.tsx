// src/components/hints/OmtFemaleHints.tsx
import React from "react";

interface ConclusionSample {
  title: string;
  value: string;
}

interface OmtFemaleHintsProps {
  onAddText: (text: string) => void;
}

const OmtFemaleHints: React.FC<OmtFemaleHintsProps> = ({ onAddText }) => {
  const samples: ConclusionSample[] = [
    {
      title: "Норма",
      value: "УЗ-признаков патологии органов малого таза не выявлено."
    },
    {
      title: "Миома матки",
      value: "Эхографические признаки миомы матки."
    },
    {
      title: "Киста правого яичника",
      value: "Эхографические признаки кисты правого яичника."
    },
    {
      title: "Киста левого яичника",
      value: "Эхографические признаки кисты левого яичника."
    },
    {
      title: "Эндометриоз",
      value: "Эхографические признаки эндометриоз."
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

export default OmtFemaleHints;