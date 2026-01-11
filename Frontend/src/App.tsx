import { useState } from "react";

import { RightPanelProvider } from "@contexts/RightPanelContext";
import { ResearchProvider } from "@contexts/ResearchContext";
import { AuthProvider, useAuth } from "@contexts/AuthContext";
import Content from "@layout/Content";
import MainLayout from "@layout/MainLayout";
import AuthForm from "@/components/auth/AuthForm";

// Внутренний компонент приложения
function AppContent() {
  const { isAuthenticated, isLoading, login, register } = useAuth();
  
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

  // Показываем загрузку при проверке сессии
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Загрузка...
      </div>
    );
  }

  // Если не авторизован - показываем форму входа
  if (!isAuthenticated) {
    return (
      <AuthForm 
        key={`auth-${Date.now()}`} // Уникальный key при каждом рендере
        onLogin={login} 
        onRegister={register} 
      />
    );
  }

  // Если авторизован - показываем основное приложение
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

// Основной компонент App с провайдером
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
