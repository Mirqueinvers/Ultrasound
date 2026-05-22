import type { PropsWithChildren, MutableRefObject } from "react";
import type { SectionKey } from "@/protocols";

import Header from "@layout/Header";
import LeftSidePanel from "@layout/LeftSidePanel";
import RightSidePanel from "@layout/RightSidePanel";

type MainLayoutProps = PropsWithChildren<{
  activeSection: string;
  setActiveSection: (value: string) => void;
  selectedStudy: string;
  onStudySelect: (value: string) => void;
  isMultiSelectMode?: boolean;
  selectedStudies?: string[];
  onToggleStudy?: (value: string) => void;
  onNavigateToProfile: () => void;
  selectedDirectoryItem: string;
  onDirectoryItemSelect: (value: string) => void;
  sectionRefs: MutableRefObject<
    Record<SectionKey, React.RefObject<HTMLDivElement | null>>
  >;
}>;

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  activeSection,
  setActiveSection,
  selectedStudy,
  onStudySelect,
  isMultiSelectMode = false,
  selectedStudies = [],
  onToggleStudy,
  onNavigateToProfile,
  selectedDirectoryItem = "",
  onDirectoryItemSelect,
  sectionRefs,
}) => {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex flex-col gap-3 p-6">
        <Header
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          onNavigateToProfile={onNavigateToProfile}
        />

        <div className="flex gap-3">
          <LeftSidePanel
            activeSection={activeSection}
            selectedStudy={selectedStudy}
            onStudySelect={onStudySelect}
            isMultiSelectMode={isMultiSelectMode}
            selectedStudies={selectedStudies}
            onToggleStudy={onToggleStudy}
            selectedDirectoryItem={selectedDirectoryItem}
            onDirectoryItemSelect={onDirectoryItemSelect}
          />

          <div className="w-[70%] px-6 py-6 rounded-lg">
            {children}
          </div>

          <RightSidePanel selectedStudies={selectedStudies} sectionRefs={sectionRefs} />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
