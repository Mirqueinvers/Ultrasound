import React, { type ReactNode } from "react";

import { RightPanelProvider } from "@contexts/RightPanelContext";
import { ResearchProvider } from "@contexts/ResearchContext";

import Content from "@layout/Content";
import MainLayout from "@layout/MainLayout";

import ProfilePage from "@/components/profile/ProfilePage";
import Journal from "@/components/journal/Journal";
import Statistics from "@/components/statistics/Statistics";
import { useDesktopAppSelection } from "@hooks";

export function AppTitlebar() {
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

const AppShell: React.FC = () => {
  const {
    activeSection,
    setActiveSection,
    selectedStudy,
    selectedStudies,
    isMultiSelectMode,
    selectedDirectoryItem,
    isDraftActive,
    mobileSaveRequestAt,
    mobilePrintRequestAt,
    mobileClearRequestAt,
    handleToggleStudy,
    handleStudySelect,
    handleClearResearch,
    handleNavigateToProfile,
    handleDirectoryItemSelect,
  } = useDesktopAppSelection();

  const mainLayout = (children: ReactNode) => (
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
      {children}
    </MainLayout>
  );

  if (activeSection === "profile") {
    return (
      <>
        <AppTitlebar />
        <RightPanelProvider>{mainLayout(<ProfilePage />)}</RightPanelProvider>
      </>
    );
  }

  if (activeSection === "journal") {
    return (
      <>
        <AppTitlebar />
        <ResearchProvider>
          <RightPanelProvider>{mainLayout(<Journal />)}</RightPanelProvider>
        </ResearchProvider>
      </>
    );
  }

  if (activeSection === "statistics") {
    return (
      <>
        <AppTitlebar />
        <RightPanelProvider>{mainLayout(<Statistics />)}</RightPanelProvider>
      </>
    );
  }

  return (
    <>
      <AppTitlebar />
      <ResearchProvider>
        <RightPanelProvider>
          {mainLayout(
            <Content
              activeSection={activeSection}
              selectedStudies={selectedStudies}
              isDraftActive={isDraftActive}
              mobileSaveRequestAt={mobileSaveRequestAt}
              mobilePrintRequestAt={mobilePrintRequestAt}
              mobileClearRequestAt={mobileClearRequestAt}
              onClearResearch={handleClearResearch}
              selectedDirectoryItem={selectedDirectoryItem}
            />
          )}
        </RightPanelProvider>
      </ResearchProvider>
    </>
  );
};

export default AppShell;
