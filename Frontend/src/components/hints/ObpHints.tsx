// src/components/hints/ObpHints.tsx
import React from "react";

interface ConclusionSample {
  title: string;
  value: string;
}

interface ObpHintsProps {
  onAddText: (text: string) => void;
}

const ObpHints: React.FC<ObpHintsProps> = ({ onAddText }) => {
  const samples: ConclusionSample[] = [
    {
      title: "Норма",
      value: "УЗИ-признаков патологии органов брюшной полости не выявлено."
    },
    {
      title: "Диффузные изменения поджелудочной железы",
      value: "Эхографические признаки диффузных изменений поджелудочной железы."
    },
    {
      title: "Хр. панкреатит",
      value: "Эхографические признаки хронического панкреатита."
    },
    {
      title: "О. панкреатит",
      value: "Эхографические признаки острого панкреатита."
    },
    {
      title: "Хр. холецистит",
      value: "Эхографические признаки хронического холецистита."
    },
    {
      title: "О. холецистит",
      value: "Эхографические признаки острого холецистита."
    },
    {
      title: "Калькулезный холецистит",
      value: "Эхографические признаки калькулезного холецистита."
    },
    {
      title: "Полип желчного пузыря",
      value: "Эхографические признаки полипа(ов) желчного пузыря."
    },
    {
      title: "Стеатоз",
      value: "Эхографические признаки стеатоза."
    },
    {
      title: "Гепатомегалия",
      value: "Эхографические признаки гепатомегалии."
    },
    {
      title: "Цирроз",
      value: "Эхографические признаки цирроза печени."
    },
    {
      title: "Спленомегалия",
      value: "Эхографические признаки спленомегалии."
    },
    {
      title: "Диффузные изменения селезенки",
      value: "Эхографические признаки диффузных изменений селезенки."
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

export default ObpHints;