import React from "react";

import JournalSection from "@/features/journal/JournalSection";
import StatisticsSection from "@/features/statistics/StatisticsSection";
import ProfileSection from "@/features/profile/ProfileSection";
import SettingsSection from "@/features/settings/SettingsSection";
import RegistrySection from "@/features/registry/RegistrySection";
import SearchSection from "@/features/search/SearchSection";
import DirectorySection from "@/features/directory/DirectorySection";
import ResearchSection from "@/features/research/ResearchSection";

import { APP_SECTIONS, type AppSectionId } from "@/domain/appSections";

import type { SectionKey } from "@/protocols";

interface ContentProps {
  activeSection: string;
  selectedStudy: string;
  onStudySelect: (value: string) => void;
  isMultiSelectMode: boolean;
  selectedStudies: string[];
  onToggleStudy: (value: string) => void;
  selectedDirectoryItem: string;
  onDirectoryItemSelect: (value: string) => void;
  sectionRefs: React.MutableRefObject<
    Record<SectionKey, React.RefObject<HTMLDivElement | null>>
  >;
  isDraftActive: boolean;
  mobileSaveRequestAt: string | null;
  mobilePrintRequestAt: string | null;
  mobileClearRequestAt: string | null;
  onClearResearch: () => void;
  onSelectStudies: (studies: string[]) => void;
}

const Content: React.FC<ContentProps> = ({
  activeSection,
  selectedStudy,
  onStudySelect,
  isMultiSelectMode,
  selectedStudies,
  onToggleStudy,
  selectedDirectoryItem,
  onDirectoryItemSelect,
  sectionRefs,
  isDraftActive,
  mobileSaveRequestAt,
  mobilePrintRequestAt,
  mobileClearRequestAt,
  onClearResearch,
  onSelectStudies,
}) => {
  const section = activeSection as AppSectionId;
  const layoutProps = {
    activeSection,
    selectedStudy,
    onStudySelect,
    isMultiSelectMode,
    selectedStudies,
    onToggleStudy,
    selectedDirectoryItem,
    onDirectoryItemSelect,
    sectionRefs,
  };

  switch (section) {
    case APP_SECTIONS.JOURNAL:
      return <JournalSection {...layoutProps} />;

    case APP_SECTIONS.STATISTICS:
      return <StatisticsSection {...layoutProps} />;

    case APP_SECTIONS.PROFILE:
      return <ProfileSection {...layoutProps} />;

    case APP_SECTIONS.SEARCH:
      return <SearchSection {...layoutProps} />;

    case APP_SECTIONS.DIRECTORY:
      return <DirectorySection {...layoutProps} />;

    case APP_SECTIONS.REGISTRY:
      return <RegistrySection onSelectStudies={onSelectStudies} />;

    case APP_SECTIONS.SETTINGS:
      return <SettingsSection />;

    case APP_SECTIONS.UZI_PROTOCOLS:
    default:
      return (
        <ResearchSection
          {...layoutProps}
          selectedStudies={selectedStudies}
          isDraftActive={isDraftActive}
          mobileSaveRequestAt={mobileSaveRequestAt}
          mobilePrintRequestAt={mobilePrintRequestAt}
          mobileClearRequestAt={mobileClearRequestAt}
          onClearResearch={onClearResearch}
        />
      );
  }
};

export default Content;
