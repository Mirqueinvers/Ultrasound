import type { MutableRefObject, PropsWithChildren } from "react";

import type { SectionKey } from "@/protocols";

import MainLayout from "@layout/MainLayout";
import { RightPanelProvider } from "@contexts/RightPanelProvider";

export interface SectionLayoutNavProps {
  activeSection: string;
  selectedStudy: string;
  onStudySelect: (value: string) => void;
  isMultiSelectMode?: boolean;
  selectedStudies?: string[];
  onToggleStudy?: (value: string) => void;
  selectedDirectoryItem: string;
  onDirectoryItemSelect: (value: string) => void;
  sectionRefs: MutableRefObject<
    Record<SectionKey, React.RefObject<HTMLDivElement | null>>
  >;
}

type SectionLayoutProps = PropsWithChildren<SectionLayoutNavProps>;

const SectionLayout: React.FC<SectionLayoutProps> = ({
  children,
  activeSection,
  selectedStudy,
  onStudySelect,
  isMultiSelectMode = false,
  selectedStudies = [],
  onToggleStudy,
  selectedDirectoryItem = "",
  onDirectoryItemSelect,
  sectionRefs,
}) => {
  return (
    <RightPanelProvider>
      <MainLayout
        activeSection={activeSection}
        selectedStudy={selectedStudy}
        onStudySelect={onStudySelect}
        isMultiSelectMode={isMultiSelectMode}
        selectedStudies={selectedStudies}
        onToggleStudy={onToggleStudy}
        selectedDirectoryItem={selectedDirectoryItem}
        onDirectoryItemSelect={onDirectoryItemSelect}
        sectionRefs={sectionRefs}
      >
        {children}
      </MainLayout>
    </RightPanelProvider>
  );
};

export default SectionLayout;