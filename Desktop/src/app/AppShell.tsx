import React, { type ReactNode } from "react";

import { RightPanelProvider } from "@contexts/RightPanelProvider";
import { ResearchProvider } from "@contexts/ResearchProvider";
import { DefaultValuesProvider } from "@contexts/DefaultValuesProvider";

import Header from "@layout/Header";
import Content from "@layout/Content";
import MainLayout from "@layout/MainLayout";

import ProfilePage from "@/components/profile/ProfilePage";
import SettingsPage from "@/components/settings/SettingsPage";
import Journal from "@/components/journal/Journal";
import Statistics from "@/components/statistics/Statistics";
import RegistryPanel, { type PatientSelectData } from "@/components/registry/RegistryPanel";
import { useResearch } from "@contexts/useResearch";
import { useDesktopAppSelection, useSectionRefs } from "@hooks";
import MedisonAutoImport from "@/components/registry/MedisonAutoImport";
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

interface RegistryPanelWrapperProps {
  onSelectStudies: (studies: string[]) => void;
}

const RegistryPanelWrapper: React.FC<RegistryPanelWrapperProps> = ({
  onSelectStudies,
}) => {
  const { setPatientFullName, setPatientDateOfBirth } = useResearch();

  const handlePatientSelect = React.useCallback(
    (data: PatientSelectData) => {
      setPatientFullName(data.fullName);
      setPatientDateOfBirth(data.dateOfBirth);
      onSelectStudies(data.studies);
    },
    [setPatientFullName, setPatientDateOfBirth, onSelectStudies],
  );

  return <RegistryPanel onPatientSelect={handlePatientSelect} />;
};

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
    setActiveSection("settings");
  }, [setActiveSection]);

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
      <DefaultValuesProvider>
      <AppTitlebar />
      <Header
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        onNavigateToProfile={handleNavigateToProfile}
        onNavigateToSettings={handleNavigateToSettings}
      />
      {activeSection === "profile" && (
        <RightPanelProvider>{mainLayout(<ProfilePage />)}</RightPanelProvider>
      )}
      {activeSection === "settings" && (
        <RightPanelProvider>
          <SettingsPage />
        </RightPanelProvider>
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
                <ResearchProvider>
                  <RegistryPanelWrapper
                    onSelectStudies={handleSelectStudiesAndNavigate}
                  />
                </ResearchProvider>
              </div>
            </div>
          </div>
        </main>
      )}
      {activeSection !== "profile" && activeSection !== "journal" && activeSection !== "statistics" && activeSection !== "registry" && activeSection !== "settings" && (
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
      </DefaultValuesProvider>
    </>
  );
};

export default AppShell;