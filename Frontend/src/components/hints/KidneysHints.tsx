// src/components/hints/KidneysHints.tsx
import React from "react";

interface ConclusionSample {
  title: string;
  value: string;
}

interface KidneysHintsProps {
  onAddText: (text: string) => void;
}

const KidneysHints: React.FC<KidneysHintsProps> = ({ onAddText }) => {
  const samples: ConclusionSample[] = [
    {
      title: "Норма",
      value: "УЗ-признаков патологии почек не выявлено."
    },
    {
      title: "МКБ",
      value: "Эхографические признаки моче-каменной болезни."
    },
    {
      title: "Нефролитиаз",
      value: "Эхографические признаки нефролитиаза."
    },
    {
      title: "Пиелонефрит",
      value: "Эхографические признаки пиелонефрита."
    },
    {
      title: "Киста(ы) правой почки",
      value: "Эхографические признаки кисты(т) правой почки."
    },
    {
      title: "Киста(ы) левой почки",
      value: "Эхографические признаки кисты(т) правой почки."
    },
    {
      title: "Гидронефроз",
      value: "Эхографические признаки гидронефроза."
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

export default KidneysHints;