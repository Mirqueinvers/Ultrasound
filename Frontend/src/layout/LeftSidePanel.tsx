import React from 'react';

interface LeftSidePanelProps {
  activeSection: string;
  selectedStudy: string;
  onStudySelect: (study: string) => void;
}

const LeftSidePanel: React.FC<LeftSidePanelProps> = ({ 
  activeSection, 
  selectedStudy, 
  onStudySelect 
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
                  onClick={() => onStudySelect(study)}
                  className={`text-left no-underline px-3 py-2 rounded transition-colors text-sm ${
                    selectedStudy === study 
                      ? 'bg-blue-100 text-blue-700 border-l-4 border-blue-500' 
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {study}
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