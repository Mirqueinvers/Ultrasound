import type { PropsWithChildren } from "react";

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
          />

          <div className="w-[70%] bg-white border border-slate-300 px-6 py-6 shadow-lg rounded-lg">
            {children}
          </div>

          <RightSidePanel />
        </div>
      </div>
    </div>
  );
};

export default MainLayout;
