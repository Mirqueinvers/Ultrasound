import { useState } from "react";

import { RightPanelProvider } from "@contexts/RightPanelContext";
import { ResearchProvider } from "@contexts/ResearchContext";
import Content from "@layout/Content";
import MainLayout from "@layout/MainLayout";

function App() {
  const [activeSection, setActiveSection] = useState<string>('uzi-protocols');
  const [selectedStudy, setSelectedStudy] = useState<string>('');
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);

  const handleToggleStudy = (study: string) => {
    setSelectedStudies(prev => {
      if (prev.includes(study)) {
        return prev.filter(s => s !== study);
      } else {
        return [...prev, study];
      }
    });
  };

  const handleRemoveStudy = (study: string) => {
    setSelectedStudies(prev => prev.filter(s => s !== study));
  };

  const handleStudySelect = (study: string) => {
    if (!isMultiSelectMode) {
      setSelectedStudy(study);
    }
  };

  const handleStartNewResearch = () => {
    setIsMultiSelectMode(true);
    setSelectedStudy('');
    setSelectedStudies([]);
  };

  const handleCancelNewResearch = () => {
    setIsMultiSelectMode(false);
    setSelectedStudies([]);
  };

  return (
    <ResearchProvider>
      <RightPanelProvider>
        <MainLayout
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          selectedStudy={selectedStudy}
          onStudySelect={handleStudySelect}
          isMultiSelectMode={isMultiSelectMode}
          selectedStudies={selectedStudies}
          onToggleStudy={handleToggleStudy}
        >
          <Content
            selectedStudy={selectedStudy}
            activeSection={activeSection}
            selectedStudies={selectedStudies}
            onRemoveStudy={handleRemoveStudy}
            isMultiSelectMode={isMultiSelectMode}
            onStartNewResearch={handleStartNewResearch}
            onCancelNewResearch={handleCancelNewResearch}
          />
        </MainLayout>
      </RightPanelProvider>
    </ResearchProvider>
  );
}

export default App;
