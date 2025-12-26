import React from 'react';
import { useRightPanel } from '../contexts/RightPanelContext';
import { normalRanges } from './common/NormalRange';

const RightSidePanel: React.FC = () => {
  const { panelData, addText } = useRightPanel();

  return (
    <aside className="w-[15%] bg-white border border-slate-300 px-4 py-4 shadow-lg rounded-lg sticky top-6 z-10 max-h-screen overflow-y-auto">
      <div className="content">
        {panelData.mode === 'none' ? (
          <>
            <h3 className="mt-0 text-slate-800 text-sm">Правая панель</h3>
            <p className="text-slate-500 text-xs mt-2">Выберите поле для просмотра подсказок</p>
          </>
        ) : (
          <>
            <h3 className="mt-0 text-slate-800 text-sm">{panelData.title}</h3>
            <div className="mt-4">
              {panelData.mode === 'normal-values' && (
                <NormalValuesPanel organ={panelData.organ!} field={panelData.field} />
              )}
              {panelData.mode === 'conclusion-samples' && (
                <ConclusionSamplesPanel organ={panelData.organ!} onAddText={addText} />
              )}
              {panelData.mode === 'custom-text' && panelData.content}
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


const NormalValuesPanel: React.FC<NormalValuesPanelProps> = ({ organ, field }) => {
  const ranges = normalRanges[organ as keyof typeof normalRanges];
  
  if (!ranges) {
    return <p className="text-slate-500 text-xs">Нет данных</p>;
  }

  const fieldsToShow = field ? { [field]: ranges[field as keyof typeof ranges] } : ranges;

  return (
    <div className="space-y-3">
      {Object.entries(fieldsToShow).map(([key, range]) => (
        <div key={key} className="p-2 bg-blue-50 rounded border border-blue-200">
          <div className="text-xs font-medium text-blue-800 capitalize">
            {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
          </div>
          <div className="text-xs text-blue-700 mt-1">
            {range.min === 0 ? `до ${range.max}` : `${range.min}-${range.max}`} {range.unit}
          </div>
        </div>
      ))}
    </div>
  );
};

interface ConclusionSamplesPanelProps {
  organ: string;
  onAddText: (text: string) => void;
}

const ConclusionSamplesPanel: React.FC<ConclusionSamplesPanelProps> = ({ organ }) => {
  const samples = getConclusionSamples(organ);

  if (samples.length === 0) {
    return <p className="text-slate-500 text-xs">Нет образцов</p>;
  }

  const handleSampleClick = (sample: string) => {
    // Передаем орган вместе с текстом
    const event = new CustomEvent('add-conclusion-text', {
      detail: { text: sample, organ }
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
        >
          {sample}
        </button>
      ))}
    </div>
  );
};

function getConclusionSamples(organ: string): string[] {
  const samples: Record<string, string[]> = {
    liver: [
      'Стеатоз.',
      'Гепатомегалия.',
      'Диффузные изменения печени.',
      'Киста.',
      'Объемное образование.',
    ],
    gallbladder: [
      'Хронический холецистит',
      'Калькулезный холецистит',
      'Полип желчного пузыря',
      'Холестероз желчного пузыря',
    ],
    pancreas: [
      'Хронический панкреатит',
      'Диффузные изменения поджелудочной железы',
      'Киста поджелудочной железы',
      'Увеличение поджелудочной железы',
    ],
    spleen: [
      'Спленомегалия.',
      'Диффузные изменения селезенки.',
      'Дополнительная долька селезенки.',
      'Киста селезенки.',
      'Объемное образование селезенки.',
      'Кальцинаты в селезенке.',
    ],
    kidneys: [
      'Нефролитиаз',
      'Пиелонефрит',
      'Киста почки',
      'Гидронефроз',
      'Нефросклероз',
    ],
  };

  return samples[organ] || [];
}

export default RightSidePanel;