import React, { type ReactNode } from "react";

import { RightPanelProvider } from "@contexts/RightPanelContext";
import { ResearchProvider } from "@contexts/ResearchContext";

import Header from "@layout/Header";
import Content from "@layout/Content";
import MainLayout from "@layout/MainLayout";

import ProfilePage from "@/components/profile/ProfilePage";
import Journal from "@/components/journal/Journal";
import Statistics from "@/components/statistics/Statistics";
import RegistryPanel from "@/components/registry/RegistryPanel";
import { useDesktopAppSelection, useSectionRefs } from "@hooks";
import MedisonAutoImport from "@/components/registry/MedisonAutoImport";
import ConstructorPage from "@/constructor/components/ConstructorPage";
import { useCustomProtocolRegistry } from "@/constructor/hooks/useCustomProtocolRegistry";

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
  useCustomProtocolRegistry();

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
          <MedisonAutoImport />
          <RightPanelProvider>{mainLayout(<Journal />)}</RightPanelProvider>
        </ResearchProvider>
      )}
      {activeSection === "statistics" && (
        <RightPanelProvider>{mainLayout(<Statistics />)}</RightPanelProvider>
      )}
      {activeSection === "registry" && (
        <main className="min-h-screen bg-slate-50">
          <div className="flex flex-col gap-3 p-6 pt-24">
            <div className="flex justify-center">
              <div className="w-[70%] px-6 py-6 rounded-lg">
                <RegistryPanel />
              </div>
            </div>
          </div>
        </main>
      )}
      {activeSection === "constructor" && (
        <main className="min-h-screen bg-slate-50 pt-20">
          <ConstructorPage />
        </main>
      )}
      {activeSection !== "profile" && activeSection !== "journal" && activeSection !== "statistics" && activeSection !== "registry" && activeSection !== "constructor" && (
        <ResearchProvider>
          <MedisonAutoImport />
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
