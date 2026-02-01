// src/components/hints/ThyroidHints.tsx
import React from "react";

interface ConclusionSample {
  title: string;
  value: string;
}

interface ThyroidHintsProps {
  onAddText: (text: string) => void;
}

const ThyroidHints: React.FC<ThyroidHintsProps> = ({ onAddText }) => {
  const samples: ConclusionSample[] = [
    {
      title: "Норма",
      value: "УЗ-признаков патологии щитовидной железы не выявлено."
    },
    {
      title: "Диффузные изменения щитовидной железы",
      value: "Эхографические признаки диффузных изменений щитовидной железы."
    },
    {
      title: "Узлы правой доли",
      value: "Эхографические признаки узловых измненеий правой доли щитовидной желез."
    },
    {
      title: "Узлы левой доли",
      value: "Эхографические признаки узловых измненеий левой доли щитовидной желез."
    },
    {
      title: "Резекция правой доли",
      value: "Эхографические признаки резекции правой доли щитовидной желез."
    },
    {
      title: "Резекция левой доли",
      value: "Эхографические признаки резекции левой доли щитовидной желез."
    },
    {
      title: "Гемитиреоидэктомия правой доли",
      value: "Эхографические признаки правосторонней немитиреоидэктомии."
    },
    {
      title: "Гемитиреоидэктомия левой доли",
      value: "Эхографические признаки левосторонней гемитиреоидэктомии."
    },
    {
      title: "Субтотальная тиреоидэктомия",
      value: "Эхографические признаки субтотальной тиреоидэктомии."
    },
    {
      title: "Тотальная тиреоидэктомия",
      value: "Эхографические признаки тотальной тиреоидэктомии."
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

export default ThyroidHints;