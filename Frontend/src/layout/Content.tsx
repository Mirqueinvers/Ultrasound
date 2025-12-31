import React from "react";

import Obp from "@components/researches/Obp";
import Kidney from "@components/researches/Kidney";
import OmtFemale from "@components/researches/OmtFemale";
import OmtMale from "@components/researches/OmtMale";
import Scrotum from "@components/researches/Scrotum";
import Thyroid from "@components/researches/Thyroid";
import Breast from "@components/researches/Breast";
import ChildDispensary from "@components/researches/ChildDispensary";
import SoftTissue from "@components/researches/SoftTissue";
import ResearchHeader from "@components/common/ResearchHeader";

interface ContentProps {
  selectedStudy: string;
  activeSection: string;
  selectedStudies: string[];
  onRemoveStudy: (study: string) => void;
  isMultiSelectMode: boolean;
  onStartNewResearch: () => void;
  onCancelNewResearch: () => void;
}

const Content: React.FC<ContentProps> = ({ 
  selectedStudy, 
  activeSection,
  selectedStudies,
  isMultiSelectMode,
  onStartNewResearch,
  onCancelNewResearch
}) => {
  // Показываем исследование только если выбрана секция "УЗИ протоколы"
  if (activeSection !== 'uzi-protocols') {
    return (
      <div className="content">
        <h2 className="text-slate-800 mt-0">Основной контент</h2>
        <p className="text-slate-600">Выберите "УЗИ протоколы" в меню для просмотра исследований</p>
      </div>
    );
  }

  // Режим создания нового исследования
  if (isMultiSelectMode) {
    return (
      <div className="content">
        <div className="mt-6">
          <ResearchHeader />
          
          {/* Выбранные исследования */}
          {selectedStudies.length > 0 && (
            <div className="mt-6 space-y-6">
              {selectedStudies.map((study, index) => (
                <div key={index} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                  {renderStudyComponent(study)}
                </div>
              ))}
            </div>
          )}

          {/* Подсказка если нет выбранных исследований */}
          {selectedStudies.length === 0 && (
            <div className="mt-6 p-6 border-2 border-dashed border-slate-300 rounded-lg text-center bg-slate-50">
              <p className="text-slate-500">Выберите исследования из левого меню</p>
            </div>
          )}

          {/* Кнопки управления */}
          <div className="mt-6 flex gap-3">
            <button
              onClick={onCancelNewResearch}
              className="px-4 py-2 bg-slate-200 text-slate-700 rounded hover:bg-slate-300 transition-colors"
            >
              Отменить
            </button>
            {selectedStudies.length > 0 && (
              <button
                onClick={() => {
                  // Здесь будет логика сохранения
                  console.log('Сохранение исследований:', selectedStudies);
                }}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
              >
                Сохранить исследование
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Если исследование не выбрано, показываем кнопку для начала нового исследования
  if (!selectedStudy) {
    return (
      <div className="content">
        <div className="mt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <button
              onClick={onStartNewResearch}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-md hover:shadow-lg"
            >
              Начать новое исследование
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Отображаем выбранное исследование (старый режим)
  return (
    <div className="content">
      {renderStudyComponent(selectedStudy)}
    </div>
  );
};

// Вспомогательная функция для рендера компонента исследования
function renderStudyComponent(study: string) {
  switch (study) {
    case 'ОБП':
      return <Obp />;
    case 'Почки':
      return <Kidney />;
    case 'ОМТ (Ж)':
      return <OmtFemale />;
    case 'ОМТ (М)':
      return <OmtMale />;
    case 'Органы мoshonки':
      return <Scrotum />;
    case 'Щитовидная железа':
      return <Thyroid />;
    case 'Молочные железы':
      return <Breast />;
    case 'Детская диспансеризация':
      return <ChildDispensary />;
    case 'Мягких тканей':
      return <SoftTissue />;

    default:
      return (
        <div className="mt-6 p-8 border-2 border-dashed border-slate-300 rounded-lg text-center">
          <h3 className="text-slate-600 mb-2">🚧 В разработке</h3>
          <p className="text-slate-500">Компонент для "{study}" будет добавлен в следующей версии</p>
        </div>
      );
  }
}

export default Content;
