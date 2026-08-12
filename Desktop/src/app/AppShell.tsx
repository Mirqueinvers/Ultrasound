import React from "react";

import { DefaultValuesProvider } from "@contexts/DefaultValuesProvider";

import Header from "@layout/Header";
import Content from "@layout/Content";

import { APP_SECTIONS } from "@/domain/appSections";
import { useDesktopAppSelection, useSectionRefs } from "@hooks";
import { windowService } from "@services";

export function AppTitlebar() {
  const handleMinimize = () => {
    windowService.minimize();
  };

  const handleMaximize = () => {
    windowService.maximize();
  };

  const handleClose = () => {
    windowService.close();
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
    handleSelectStudiesAndNavigate,
    handleClearResearch,
    handleNavigateToProfile,
    handleDirectoryItemSelect,
  } = useDesktopAppSelection();
  const sectionRefs = useSectionRefs();

  const handleNavigateToSettings = React.useCallback(() => {
    setActiveSection(APP_SECTIONS.SETTINGS);
  }, [setActiveSection]);

  return (
    <DefaultValuesProvider>
      <AppTitlebar />
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToSettings={handleNavigateToSettings}
      />
      <Content
        activeSection={activeSection}
        selectedStudy={selectedStudy}
        onStudySelect={handleStudySelect}
        isMultiSelectMode={isMultiSelectMode}
        selectedStudies={selectedStudies}
        onToggleStudy={handleToggleStudy}
        selectedDirectoryItem={selectedDirectoryItem}
        onDirectoryItemSelect={handleDirectoryItemSelect}
        sectionRefs={sectionRefs}
        isDraftActive={isDraftActive}
        mobileSaveRequestAt={mobileSaveRequestAt}
        mobilePrintRequestAt={mobilePrintRequestAt}
        mobileClearRequestAt={mobileClearRequestAt}
        onClearResearch={handleClearResearch}
        onSelectStudies={handleSelectStudiesAndNavigate}
      />
    </DefaultValuesProvider>
  );
};

export default AppShell;
