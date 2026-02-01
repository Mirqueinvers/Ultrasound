// src/components/layout/RightSidePanel.tsx
import React from "react";

import { useRightPanel } from "@contexts/RightPanelContext";
import { normalRanges } from "@common";

const RightSidePanel: React.FC = () => {
  const { panelData, addText } = useRightPanel();

  return (
    <aside className="w-[15%] bg-white border border-slate-300 px-4 py-4 shadow-lg rounded-lg sticky top-[56px] z-10 max-h-[calc(100vh-56px)] overflow-y-auto">
      <div className="content">
        {panelData.mode === "none" ? (
          <>
            <h3 className="mt-0 text-slate-800 text-sm">Правая панель</h3>
            <p className="text-slate-500 text-xs mt-2">
              Выберите поле для просмотра подсказок
            </p>
          </>
        ) : (
          <>
            <h3 className="mt-0 text-slate-800 text-sm">{panelData.title}</h3>
            <div className="mt-4">
              {panelData.mode === "normal-values" && (
                <NormalValuesPanel
                  organ={panelData.organ!}
                  field={panelData.field}
                />
              )}
              {panelData.mode === "conclusion-samples" && (
                <ConclusionSamplesPanel
                  organ={panelData.organ!}
                  onAddText={addText}
                />
              )}
              {panelData.mode === "custom-text" && panelData.content}
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

interface NormalValuesPanelProps {
  organ: string;
  field?: string;
}

const NormalValuesPanel: React.FC<NormalValuesPanelProps> = ({
  organ,
  field,
}) => {
  const ranges = normalRanges[organ as keyof typeof normalRanges];

  if (!ranges) {
    return <p className="text-slate-500 text-xs">Нет данных</p>;
  }

  const fieldsToShow = field
    ? { [field]: ranges[field as keyof typeof ranges] }
    : ranges;

  return (
    <div className="space-y-3">
      {Object.entries(fieldsToShow).map(([key, range]) => (
        <div
          key={key}
          className="p-2 bg-blue-50 rounded border border-blue-200"
        >
          <div className="text-xs font-medium text-blue-800 capitalize">
            {key.replace(/([A-Z])/g, " $1").toLowerCase()}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {range.min === 0 ? `до ${range.max}` : `${range.min}-${range.max}`}{" "}
            {range.unit}
          </div>
        </div>
      ))}
    </div>
  );
};

interface ConclusionSample {
  title: string;
  value: string;
}

interface ConclusionSamplesPanelProps {
  organ: string;
  onAddText: (text: string) => void;
}

const ConclusionSamplesPanel: React.FC<ConclusionSamplesPanelProps> = ({
  organ,
}) => {
  const samples = getConclusionSamples(organ);

  if (samples.length === 0) {
    return <p className="text-slate-500 text-xs">Нет образцов</p>;
  }

  const handleSampleClick = (sample: ConclusionSample) => {
    const event = new CustomEvent("add-conclusion-text", {
      detail: { text: sample.value, organ, studyId: `study-${organ}` },
    });
    window.dispatchEvent(event);
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

function getConclusionSamples(organ: string): ConclusionSample[] {
  const samples: Record<string, ConclusionSample[]> = {
    obp: [
      {
        title: "Норма",
        value: "УЗИ-признаков патологии органов брюшной полости не выявлено."
      },
      {
        title: "Диффузные изменения поджелудочной железы.",
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
      },


    ],
    kidneys: [
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
      },
    ],
    breast: [
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
      },

    ],
    thyroid: [
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
      },

    ],
    scrotum: [
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
      },
    ],
    urinary_bladder: [
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
      },

    ],
    omt_female: [
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
      },
    ],
    omt_male: [
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
      },
    ],
  };

  return samples[organ] || [];
}

export default RightSidePanel;
