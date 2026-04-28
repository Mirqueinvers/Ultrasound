import { useState } from "react";
import { useEffect } from "react";

import { RightPanelProvider } from "@contexts/RightPanelContext";
import { ResearchProvider } from "@contexts/ResearchContext";
import { AuthProvider, useAuth } from "@contexts/AuthContext";
import {
  createSyncTimestamp,
  type MobileSyncWireMessage,
} from "@/sync/mobileSync";

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
  const [isMultiSelectMode, setIsMultiSelectMode] = useState<boolean>(true);
  const [selectedDirectoryItem, setSelectedDirectoryItem] = useState<string>("");
  const [isDraftActive, setIsDraftActive] = useState<boolean>(false);
  const [mobileSaveRequestAt, setMobileSaveRequestAt] = useState<string | null>(null);

  const publishSelectionSync = (selection: {
    activeSection: string;
    selectedStudy: string;
    selectedStudies: string[];
    isMultiSelectMode: boolean;
    selectedDirectoryItem: string;
  }) => {
    void window.mobileHostAPI?.publishSync({
      type: "sync:update",
      fragment: "selection",
      data: selection,
      origin: "desktop",
      updatedAt: createSyncTimestamp(),
    });
  };

  useEffect(() => {
    if (!window.mobileHostAPI) {
      return undefined;
    }

    return window.mobileHostAPI.onSyncMessage((message) => {
      const syncMessage = message as MobileSyncWireMessage | undefined;
      if (!syncMessage || typeof syncMessage !== "object" || !("type" in syncMessage)) {
        return;
      }

      if (syncMessage.type === "sync:snapshot") {
        const { selection } = syncMessage.state;
        setActiveSection(selection.activeSection);
        setSelectedStudy(selection.selectedStudy);
        setSelectedStudies([...selection.selectedStudies]);
        setIsMultiSelectMode(
          selection.activeSection === "uzi-protocols" ||
            selection.isMultiSelectMode ||
            selection.selectedStudies.length > 0,
        );
        setSelectedDirectoryItem(selection.selectedDirectoryItem);
        setIsDraftActive(Boolean(syncMessage.state.session.isDraftActive));
        if (!syncMessage.state.session.isDraftActive) {
          setMobileSaveRequestAt(null);
        }
        return;
      }

      if (syncMessage.type === "sync:command") {
        if (syncMessage.command === "draft:save") {
          setMobileSaveRequestAt(syncMessage.updatedAt);
          return;
        }

        if (syncMessage.command === "draft:saved") {
          setMobileSaveRequestAt(null);
          return;
        }
        return;
      }

      if (syncMessage.type === "sync:update") {
        if (syncMessage.fragment === "selection") {
          setActiveSection((current) => syncMessage.data.activeSection ?? current);
          setSelectedStudy((current) => syncMessage.data.selectedStudy ?? current);
          if (Object.prototype.hasOwnProperty.call(syncMessage.data, "selectedStudies")) {
            setSelectedStudies([...(syncMessage.data.selectedStudies ?? [])]);
          }
          if (typeof syncMessage.data.isMultiSelectMode === "boolean") {
            setIsMultiSelectMode(
              syncMessage.data.activeSection === "uzi-protocols" ||
                syncMessage.data.isMultiSelectMode ||
                (syncMessage.data.selectedStudies?.length ?? 0) > 0,
            );
          }
          setSelectedDirectoryItem((current) => syncMessage.data.selectedDirectoryItem ?? current);
        }
      }
    });
  }, []);

  const handleToggleStudy = (study: string) => {
    const next = selectedStudies.includes(study)
      ? selectedStudies.filter((s) => s !== study)
      : [...selectedStudies, study];

    setIsMultiSelectMode(true);
    setSelectedStudies(next);
    publishSelectionSync({
      activeSection,
      selectedStudy,
      selectedStudies: next,
      isMultiSelectMode,
      selectedDirectoryItem,
    });
  };

  const handleRemoveStudy = (study: string) => {
    const next = selectedStudies.filter((s) => s !== study);

    setIsMultiSelectMode(true);
    setSelectedStudies(next);
    publishSelectionSync({
      activeSection,
      selectedStudy,
      selectedStudies: next,
      isMultiSelectMode,
      selectedDirectoryItem,
    });
  };

  const handleStudySelect = (study: string) => {
    if (!isMultiSelectMode) {
      setSelectedStudy(study);
      publishSelectionSync({
        activeSection,
        selectedStudy: study,
        selectedStudies,
        isMultiSelectMode,
        selectedDirectoryItem,
      });
    }
  };

  const handleClearResearch = () => {
    setIsMultiSelectMode(true);
    setSelectedStudy("");
    setSelectedStudies([]);
    setIsDraftActive(true);
    setMobileSaveRequestAt(null);
    publishSelectionSync({
      activeSection,
      selectedStudy: "",
      selectedStudies: [],
      isMultiSelectMode: false,
      selectedDirectoryItem,
    });
  };

  const handleNavigateToProfile = () => {
    setActiveSection("profile");
    publishSelectionSync({
      activeSection: "profile",
      selectedStudy,
      selectedStudies,
      isMultiSelectMode,
      selectedDirectoryItem,
    });
  };

  const handleDirectoryItemSelect = (item: string) => {
    setSelectedDirectoryItem(item);
    publishSelectionSync({
      activeSection,
      selectedStudy,
      selectedStudies,
      isMultiSelectMode,
      selectedDirectoryItem: item,
    });
  };

  const handleSetActiveSection = (section: string) => {
    setActiveSection(section);
    if (section === "uzi-protocols") {
      setIsMultiSelectMode(true);
    }
    publishSelectionSync({
      activeSection: section,
      selectedStudy,
      selectedStudies,
      isMultiSelectMode,
      selectedDirectoryItem,
    });
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
            setActiveSection={handleSetActiveSection}
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
              setActiveSection={handleSetActiveSection}
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
            setActiveSection={handleSetActiveSection}
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
            setActiveSection={handleSetActiveSection}
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
                isDraftActive={isDraftActive}
                mobileSaveRequestAt={mobileSaveRequestAt}
                onClearResearch={handleClearResearch}
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
