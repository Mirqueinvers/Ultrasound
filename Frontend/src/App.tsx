import { useState } from "react";

import { RightPanelProvider } from "@contexts/RightPanelContext";
import { ResearchProvider } from "@contexts/ResearchContext";
import { AuthProvider, useAuth } from "@contexts/AuthContext";

import Content from "@layout/Content";
import MainLayout from "@layout/MainLayout";

import AuthForm from "@/components/auth/AuthForm";
import ProfilePage from "@/components/profile/ProfilePage";
import Journal from "@/components/journal/Journal";
import Statistics from "@/components/statistics/Statistics";

function AppTitlebar() {
  const handleMinimize = () => {
    window.windowAPI?.minimize();
  };

  const handleMaximize = () => {
    window.windowAPI?.maximize();
  };

  const handleClose = () => {
    window.windowAPI?.close();
  };

  return (
    <div className="app-titlebar">
      {/* слева ничего не рисуем — чистая полоска */}
      <div className="app-titlebar-left" />

      <div className="app-titlebar-buttons">
        <button
          className="app-titlebar-button"
          type="button"
          onClick={handleMinimize}
        >
          &#8211;
        </button>
        <button
          className="app-titlebar-button"
          type="button"
          onClick={handleMaximize}
        >
          &#9633;
        </button>
        <button
          className="app-titlebar-button close"
          type="button"
          onClick={handleClose}
        >
          &#10005;
        </button>
      </div>
    </div>
  );
}

function AppContent() {
  const { isAuthenticated, isLoading, login, register } = useAuth();

  const [activeSection, setActiveSection] = useState<string>("uzi-protocols");
  const [selectedStudy, setSelectedStudy] = useState<string>("");
  const [selectedStudies, setSelectedStudies] = useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(false);
  const [selectedDirectoryItem, setSelectedDirectoryItem] = useState<string>("");

  const handleToggleStudy = (study: string) => {
    setSelectedStudies((prev) =>
      prev.includes(study) ? prev.filter((s) => s !== study) : [...prev, study]
    );
  };

  const handleRemoveStudy = (study: string) => {
    setSelectedStudies((prev) => prev.filter((s) => s !== study));
  };

  const handleStudySelect = (study: string) => {
    if (!isMultiSelectMode) {
      setSelectedStudy(study);
    }
  };

  const handleStartNewResearch = () => {
    setIsMultiSelectMode(true);
    setSelectedStudy("");
    setSelectedStudies([]);
  };

  const handleCancelNewResearch = () => {
    setIsMultiSelectMode(false);
    setSelectedStudies([]);
  };

  const handleNavigateToProfile = () => {
    setActiveSection("profile");
  };

  const handleDirectoryItemSelect = (item: string) => {
    setSelectedDirectoryItem(item);
  };

  if (isLoading) {
    return (
      <>
        <AppTitlebar />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          Загрузка...
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <AppTitlebar />
        <AuthForm
          key={`auth-${Date.now()}`}
          onLogin={login}
          onRegister={register}
        />
      </>
    );
  }

  if (activeSection === "profile") {
    return (
      <>
        <AppTitlebar />
        <RightPanelProvider>
          <MainLayout
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            selectedStudy={selectedStudy}
            onStudySelect={handleStudySelect}
            isMultiSelectMode={isMultiSelectMode}
            selectedStudies={selectedStudies}
            onToggleStudy={handleToggleStudy}
            onNavigateToProfile={handleNavigateToProfile}
            selectedDirectoryItem={selectedDirectoryItem}
            onDirectoryItemSelect={handleDirectoryItemSelect}
          >
            <ProfilePage />
          </MainLayout>
        </RightPanelProvider>
      </>
    );
  }

  if (activeSection === "journal") {
    return (
      <>
        <AppTitlebar />
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
              onNavigateToProfile={handleNavigateToProfile}
              selectedDirectoryItem={selectedDirectoryItem}
              onDirectoryItemSelect={handleDirectoryItemSelect}
            >
              <Journal />
            </MainLayout>
          </RightPanelProvider>
        </ResearchProvider>
      </>
    );
  }

  if (activeSection === "statistics") {
    return (
      <>
        <AppTitlebar />
        <RightPanelProvider>
          <MainLayout
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            selectedStudy={selectedStudy}
            onStudySelect={handleStudySelect}
            isMultiSelectMode={isMultiSelectMode}
            selectedStudies={selectedStudies}
            onToggleStudy={handleToggleStudy}
            onNavigateToProfile={handleNavigateToProfile}
            selectedDirectoryItem={selectedDirectoryItem}
            onDirectoryItemSelect={handleDirectoryItemSelect}
          >
            <Statistics />
          </MainLayout>
        </RightPanelProvider>
      </>
    );
  }

  return (
    <>
      <AppTitlebar />
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
            onNavigateToProfile={handleNavigateToProfile}
            selectedDirectoryItem={selectedDirectoryItem}
            onDirectoryItemSelect={handleDirectoryItemSelect}
          >
            <Content
              selectedStudy={selectedStudy}
              activeSection={activeSection}
              selectedStudies={selectedStudies}
              onRemoveStudy={handleRemoveStudy}
              isMultiSelectMode={isMultiSelectMode}
              onStartNewResearch={handleStartNewResearch}
              onCancelNewResearch={handleCancelNewResearch}
              selectedDirectoryItem={selectedDirectoryItem}
            />
          </MainLayout>
        </RightPanelProvider>
      </ResearchProvider>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
