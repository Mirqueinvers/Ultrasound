import React, { type ReactNode } from "react";

import { RightPanelProvider } from "@contexts/RightPanelContext";
import { ResearchProvider } from "@contexts/ResearchContext";

import Header from "@layout/Header";
import Content from "@layout/Content";
import MainLayout from "@layout/MainLayout";

import ProfilePage from "@/components/profile/ProfilePage";
import Journal from "@/components/journal/Journal";
import Statistics from "@/components/statistics/Statistics";
import { useDesktopAppSelection, useSectionRefs } from "@hooks";

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
  const sectionRefs = useSectionRefs();

  const mainLayout = (children: ReactNode) => (
    <MainLayout
      activeSection={activeSection}
      selectedStudy={selectedStudy}
      onStudySelect={handleStudySelect}
      isMultiSelectMode={isMultiSelectMode}
      selectedStudies={selectedStudies}
      onToggleStudy={handleToggleStudy}
      selectedDirectoryItem={selectedDirectoryItem}
      onDirectoryItemSelect={handleDirectoryItemSelect}
      sectionRefs={sectionRefs}
    >
      {children}
    </MainLayout>
  );

  return (
    <>
      <AppTitlebar />
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onNavigateToProfile={handleNavigateToProfile}
      />
      {activeSection === "profile" && (
        <RightPanelProvider>{mainLayout(<ProfilePage />)}</RightPanelProvider>
      )}
      {activeSection === "journal" && (
        <ResearchProvider>
          <RightPanelProvider>{mainLayout(<Journal />)}</RightPanelProvider>
        </ResearchProvider>
      )}
      {activeSection === "statistics" && (
        <RightPanelProvider>{mainLayout(<Statistics />)}</RightPanelProvider>
      )}
      {activeSection !== "profile" && activeSection !== "journal" && activeSection !== "statistics" && (
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
                sectionRefs={sectionRefs}
              />
            )}
          </RightPanelProvider>
        </ResearchProvider>
      )}
    </>
  );
};

export default AppShell;
