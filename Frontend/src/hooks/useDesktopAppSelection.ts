import React from "react";

import {
  createSyncTimestamp,
  type MobileSyncWireMessage,
} from "@/sync/mobileSync";

export const useDesktopAppSelection = () => {
  const [activeSection, setActiveSection] = React.useState<string>("uzi-protocols");
  const [selectedStudy, setSelectedStudy] = React.useState<string>("");
  const [selectedStudies, setSelectedStudies] = React.useState<string[]>([]);
  const [isMultiSelectMode, setIsMultiSelectMode] = React.useState<boolean>(true);
  const [selectedDirectoryItem, setSelectedDirectoryItem] = React.useState<string>("");
  const [isDraftActive, setIsDraftActive] = React.useState<boolean>(false);
  const [mobileSaveRequestAt, setMobileSaveRequestAt] = React.useState<string | null>(null);
  const [mobilePrintRequestAt, setMobilePrintRequestAt] = React.useState<string | null>(null);
  const [mobileClearRequestAt, setMobileClearRequestAt] = React.useState<string | null>(null);

  const publishSelectionSync = React.useCallback(
    (selection: {
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
    },
    [],
  );

  React.useEffect(() => {
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
          setMobilePrintRequestAt(null);
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

        if (syncMessage.command === "draft:print") {
          setMobilePrintRequestAt(syncMessage.updatedAt);
          return;
        }

        if (syncMessage.command === "draft:clear") {
          setMobileClearRequestAt(syncMessage.updatedAt);
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

  React.useEffect(() => {
    if (activeSection !== "uzi-protocols") {
      setMobileSaveRequestAt(null);
      setMobilePrintRequestAt(null);
      setMobileClearRequestAt(null);
    }
  }, [activeSection]);

  const handleToggleStudy = React.useCallback(
    (study: string) => {
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
    },
    [
      activeSection,
      isMultiSelectMode,
      publishSelectionSync,
      selectedDirectoryItem,
      selectedStudy,
      selectedStudies,
    ],
  );

  const handleRemoveStudy = React.useCallback(
    (study: string) => {
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
    },
    [
      activeSection,
      isMultiSelectMode,
      publishSelectionSync,
      selectedDirectoryItem,
      selectedStudy,
      selectedStudies,
    ],
  );

  const handleStudySelect = React.useCallback(
    (study: string) => {
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
    },
    [
      activeSection,
      isMultiSelectMode,
      publishSelectionSync,
      selectedDirectoryItem,
      selectedStudies,
    ],
  );

  const handleClearResearch = React.useCallback(() => {
    setIsMultiSelectMode(true);
    setSelectedStudy("");
    setSelectedStudies([]);
    setIsDraftActive(true);
    setMobileSaveRequestAt(null);
    setMobilePrintRequestAt(null);
    publishSelectionSync({
      activeSection,
      selectedStudy: "",
      selectedStudies: [],
      isMultiSelectMode: false,
      selectedDirectoryItem,
    });
  }, [activeSection, publishSelectionSync, selectedDirectoryItem]);

  const handleNavigateToProfile = React.useCallback(() => {
    setActiveSection("profile");
    setMobileSaveRequestAt(null);
    setMobilePrintRequestAt(null);
    setMobileClearRequestAt(null);
    publishSelectionSync({
      activeSection: "profile",
      selectedStudy,
      selectedStudies,
      isMultiSelectMode,
      selectedDirectoryItem,
    });
  }, [
    isMultiSelectMode,
    publishSelectionSync,
    selectedDirectoryItem,
    selectedStudies,
    selectedStudy,
  ]);

  const handleDirectoryItemSelect = React.useCallback(
    (item: string) => {
      setSelectedDirectoryItem(item);
      publishSelectionSync({
        activeSection,
        selectedStudy,
        selectedStudies,
        isMultiSelectMode,
        selectedDirectoryItem: item,
      });
    },
    [
      activeSection,
      isMultiSelectMode,
      publishSelectionSync,
      selectedStudies,
      selectedStudy,
    ],
  );

  const handleSetActiveSection = React.useCallback(
    (section: string) => {
      setActiveSection(section);
      if (section === "uzi-protocols") {
        setIsMultiSelectMode(true);
      }
      if (section !== "uzi-protocols") {
        setMobileSaveRequestAt(null);
        setMobilePrintRequestAt(null);
        setMobileClearRequestAt(null);
      }
      publishSelectionSync({
        activeSection: section,
        selectedStudy,
        selectedStudies,
        isMultiSelectMode,
        selectedDirectoryItem,
      });
    },
    [
      isMultiSelectMode,
      publishSelectionSync,
      selectedDirectoryItem,
      selectedStudies,
      selectedStudy,
    ],
  );

  return {
    activeSection,
    setActiveSection: handleSetActiveSection,
    handleSetActiveSection,
    selectedStudy,
    selectedStudies,
    isMultiSelectMode,
    selectedDirectoryItem,
    isDraftActive,
    mobileSaveRequestAt,
    mobilePrintRequestAt,
    mobileClearRequestAt,
    handleToggleStudy,
    handleRemoveStudy,
    handleStudySelect,
    handleClearResearch,
    handleNavigateToProfile,
    handleDirectoryItemSelect,
  };
};
