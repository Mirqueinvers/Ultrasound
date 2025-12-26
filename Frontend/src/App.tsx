// Frontend/src/App.tsx
import { useState } from 'react';
import { RightPanelProvider } from './contexts/RightPanelContext';
import Content from './layout/Content';
import MainLayout from './layout/MainLayout';

function App() {
  const [activeSection, setActiveSection] = useState<string>('');
  const [selectedStudy, setSelectedStudy] = useState<string>('');

  return (
    <RightPanelProvider>
      <MainLayout
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        selectedStudy={selectedStudy}
        onStudySelect={setSelectedStudy}
      >
        <Content
          selectedStudy={selectedStudy}
          activeSection={activeSection}
        />
      </MainLayout>
    </RightPanelProvider>
  );
}

export default App;
