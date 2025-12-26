import React, { useState } from 'react';
import { RightPanelProvider } from './contexts/RightPanelContext';
import Header from './components/Header';
import LeftSidePanel from './components/LeftSidePanel';
import RightSidePanel from './components/RightSidePanel';
import Content from './components/Content';

function App() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [selectedStudy, setSelectedStudy] = useState<string>('');

  return (
    <RightPanelProvider>
      <div className="min-h-screen bg-slate-50">
        {/* Основной контейнер с gap */}
        <div className="flex flex-col gap-3 p-6">
          {/* Шапка с тенью */}
          <Header 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
          
          {/* Основной контейнер с тремя колонками и gap */}
          <div className="flex gap-3">
            {/* Левая панель - 15% */}
            <LeftSidePanel 
              activeSection={activeSection} 
              selectedStudy={selectedStudy}
              onStudySelect={setSelectedStudy}
            />
            
            {/* Основной контент - 70% */}
            <div className="w-[70%] bg-white border border-slate-300 px-6 py-6 shadow-lg rounded-lg">
              <Content 
                selectedStudy={selectedStudy}
                activeSection={activeSection}
              />
            </div>
            
            {/* Правая панель - 15% */}
            <RightSidePanel />
          </div>
        </div>
      </div>
    </RightPanelProvider>
  );
}

export default App;