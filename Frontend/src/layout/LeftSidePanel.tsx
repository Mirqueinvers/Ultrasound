import React, { useState, useMemo } from 'react';

interface LeftSidePanelProps {
  activeSection: string;
  selectedStudy: string;
  onStudySelect: (study: string) => void;
  isMultiSelectMode?: boolean;
  selectedStudies?: string[];
  onToggleStudy?: (study: string) => void;
  selectedDirectoryItem?: string;
  onDirectoryItemSelect?: (item: string) => void;
}

const LeftSidePanel: React.FC<LeftSidePanelProps> = ({ 
  activeSection, 
  selectedStudy, 
  onStudySelect,
  isMultiSelectMode = false,
  selectedStudies = [],
  onToggleStudy,
  selectedDirectoryItem = "",
  onDirectoryItemSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const studiesList = [
    'ОБП',
    'Почки',
    'ОМТ (Ж)',
    'ОМТ (М)',
    'Щитовидная железа',
    'Плевральные полости',
    'Слюнные железы',
    'БЦА',
    'УВНК',
    'Молочные железы',
    'Лимфоузлы',
    'Органы мошонки',
    'Детская диспансеризация',
    'Мягких тканей',
    'Мочевой пузырь',
  ];

  const directoryItems = [
    'TI-RADS',
    'BI-RADS',
    'O-RADS',
    'Размеры щитовидной железы',
    'Нормы ОБП',
    'Нормы почек',
    'Размеры молочных желез',
  ];

  const handleStudyClick = (study: string) => {
    if (isMultiSelectMode && onToggleStudy) {
      onToggleStudy(study);
    } else {
      onStudySelect(study);
    }
  };

  const isStudySelected = (study: string) => {
    if (activeSection === 'directory') {
      return selectedDirectoryItem === study;
    }
    if (isMultiSelectMode) {
      return selectedStudies.includes(study);
    }
    return selectedStudy === study;
  };

  const handleItemClick = (item: string) => {
    if (activeSection === 'directory' && onDirectoryItemSelect) {
      onDirectoryItemSelect(item);
    } else {
      handleStudyClick(item);
    }
  };

  // Фильтрация исследований по поисковому запросу
  const filteredStudies = useMemo(() => {
    if (!searchQuery.trim()) return studiesList;
    return studiesList.filter(study =>
      study.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, studiesList]);

  // Фильтрация элементов справочника по поисковому запросу
  const filteredDirectoryItems = useMemo(() => {
    if (!searchQuery.trim()) return directoryItems;
    return directoryItems.filter(item =>
      item.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, directoryItems]);

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <aside className="w-[15%] min-h-[calc(100vh-4rem)] bg-white border border-slate-200 shadow-xl rounded-2xl overflow-hidden">
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 px-5 py-4 border-b border-slate-200">
        {activeSection === 'uzi-protocols' ? (
          <div>
            <h3 className="text-lg font-bold text-slate-800 m-0">УЗИ исследования</h3>
            <p className="text-xs text-slate-500 m-0 mt-1">Выберите тип протокола</p>
          </div>
        ) : activeSection === 'directory' ? (
          <div>
            <h3 className="text-lg font-bold text-slate-800 m-0">Справочник</h3>
            <p className="text-xs text-slate-500 m-0 mt-1">Выберите раздел</p>
          </div>
        ) : (
          <h3 className="text-lg font-bold text-slate-800 m-0">Левая панель</h3>
        )}
        
        {/* Поле поиска */}
        {(activeSection === 'uzi-protocols' || activeSection === 'directory') && (
          <div className="mt-3 relative">
            <div className="relative">
              <input
                type="text"
                placeholder={activeSection === 'uzi-protocols' ? 'Поиск исследований...' : 'Поиск в справочнике...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 pl-9 pr-8 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white/80 backdrop-blur-sm"
              />
              {/* Иконка поиска */}
              <div className="absolute left-2.5 top-1/2 -translate-y-1/2">
                <svg 
                  className="w-4 h-4 text-slate-400" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                  />
                </svg>
              </div>
              {/* Кнопка очистки */}
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            
            {/* Индикатор результатов поиска */}
            {searchQuery && (
              <div className="mt-1 text-xs text-slate-500">
                {activeSection === 'uzi-protocols' 
                  ? `Найдено: ${filteredStudies.length} из ${studiesList.length}`
                  : `Найдено: ${filteredDirectoryItems.length} из ${directoryItems.length}`
                }
              </div>
            )}
          </div>
        )}
      </div>

      {activeSection === 'uzi-protocols' && (
        <nav className="p-3">
          <div className="flex flex-col gap-1.5">
            {filteredStudies.length > 0 ? (
              filteredStudies.map((study, index) => {
              const selected = isStudySelected(study);
              
              return (
                <button
                  key={index}
                  onClick={() => handleStudyClick(study)}
                  className={`
                    group relative flex items-center justify-between px-3.5 py-3 rounded-xl 
                    text-left transition-all duration-200 text-sm font-medium
                    ${selected
                      ? 'bg-sky-50 text-sky-700 shadow-md shadow-sky-100/50 scale-[1.02]'
                      : 'text-slate-700 hover:bg-slate-50 hover:scale-[1.01]'
                    }
                  `}
                >
                  {/* Левый акцент */}
                  {selected && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[95%] rounded-l-full"
                      style={{
                        background: "linear-gradient(to bottom, rgb(56 189 248), rgb(2 132 199))",
                      }}
                    />
                  )}

                  {/* Название */}
                  <span className="flex-1 leading-tight">
                    {study}
                  </span>

                  {/* Индикатор выбора в мультирежиме */}
                  {isMultiSelectMode && selectedStudies.includes(study) && (
                    <div 
                      className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm"
                      style={{ backgroundColor: 'rgb(14 165 233)' }}
                    >
                      ✓
                    </div>
                  )}

                  {/* Hover эффект свечения */}
                  {!selected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-slate-100/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              );
            })
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">Ничего не найдено</p>
                <p className="text-xs text-slate-400 mt-1">Попробуйте изменить запрос</p>
              </div>
            )}
          </div>
        </nav>
      )}

      {activeSection === 'directory' && (
        <nav className="p-3">
          <div className="flex flex-col gap-1.5">
            {filteredDirectoryItems.length > 0 ? (
              filteredDirectoryItems.map((item, index) => {
              const selected = isStudySelected(item);
              
              return (
                <button
                  key={index}
                  onClick={() => handleItemClick(item)}
                  className={`
                    group relative flex items-center justify-between px-3.5 py-3 rounded-xl 
                    text-left transition-all duration-200 text-sm font-medium
                    ${selected
                      ? 'bg-sky-50 text-sky-700 shadow-md shadow-sky-100/50 scale-[1.02]'
                      : 'text-slate-700 hover:bg-slate-50 hover:scale-[1.01]'
                    }
                  `}
                >
                  {/* Левый акцент */}
                  {selected && (
                    <div
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-[95%] rounded-l-full"
                      style={{
                        background: "linear-gradient(to bottom, rgb(56 189 248), rgb(2 132 199))",
                      }}
                    />
                  )}

                  {/* Название */}
                  <span className="flex-1 leading-tight">
                    {item}
                  </span>

                  {/* Hover эффект свечения */}
                  {!selected && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-slate-100/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                </button>
              );
            })
            ) : (
              <div className="text-center py-8">
                <div className="text-slate-400 mb-2">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">Ничего не найдено</p>
                <p className="text-xs text-slate-400 mt-1">Попробуйте изменить запрос</p>
              </div>
            )}
          </div>
        </nav>
      )}
    </aside>
  );
};

export default LeftSidePanel;


