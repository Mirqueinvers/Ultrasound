import React from 'react';

interface LeftSidePanelProps {
  activeSection: string;
  selectedStudy: string;
  onStudySelect: (study: string) => void;
  isMultiSelectMode?: boolean;
  selectedStudies?: string[];
  onToggleStudy?: (study: string) => void;
}

const LeftSidePanel: React.FC<LeftSidePanelProps> = ({ 
  activeSection, 
  selectedStudy, 
  onStudySelect,
  isMultiSelectMode = false,
  selectedStudies = [],
  onToggleStudy
}) => {
  const studiesList = [
    'ОБП',
    'Почки',
    'ОМТ (Ж)',
    'ОМТ (М)',
    'Щитовидная железа',
    'Молочные железы',
    'Лимфоузлы',
    'Органы мошонки',
    'Детская диспансеризация',
    'Мягких тканей',
    'БЦА',
    'УВНК',
  ];

  const handleStudyClick = (study: string) => {
    if (isMultiSelectMode && onToggleStudy) {
      onToggleStudy(study);
    } else {
      onStudySelect(study);
    }
  };

  const isStudySelected = (study: string) => {
    if (isMultiSelectMode) {
      return selectedStudies.includes(study);
    }
    return selectedStudy === study;
  };

  return (
    <aside className="w-[15%] min-h-[calc(100vh-4rem)] bg-white border border-slate-300 px-4 py-4 box-border sticky top-16 shadow-lg rounded-lg">
      <div className="content">
        {activeSection === 'uzi-protocols' ? (
          <>
            <h3 className="mt-0 text-slate-800 mb-4">УЗИ исследования</h3>
            <div className="border-t border-slate-300 mb-4"></div>
            <nav className="flex flex-col gap-2">
              {studiesList.map((study, index) => (
                <button
                  key={index}
                  onClick={() => handleStudyClick(study)}
                  className={`text-left no-underline px-3 py-2 rounded transition-colors text-sm relative ${
                    isStudySelected(study)
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span className="flex items-center justify-between">
                    <span>{study}</span>
                    {isMultiSelectMode && selectedStudies.includes(study) && (
                      <span className="text-blue-600 font-bold">✓</span>
                    )}
                  </span>
                </button>
              ))}
            </nav>
          </>
        ) : (
          <h3 className="mt-0 text-slate-800 mb-4">Левая панель</h3>
        )}
      </div>
    </aside>
  );
};

export default LeftSidePanel;
