import React from "react";

import MedisonAutoImport from "@/components/registry/MedisonAutoImport";

import { ResearchProvider } from "@contexts/ResearchProvider";
import SectionLayout, {
  type SectionLayoutNavProps,
} from "@layout/SectionLayout";

import ResearchWorkspace from "./ResearchWorkspace";

type ResearchSectionProps = SectionLayoutNavProps & {
  selectedStudies: string[];
  isDraftActive: boolean;
  mobileSaveRequestAt: string | null;
  mobilePrintRequestAt: string | null;
  mobileClearRequestAt: string | null;
  onClearResearch: () => void;
};

const ResearchSection: React.FC<ResearchSectionProps> = ({
  selectedStudies,
  isDraftActive,
  mobileSaveRequestAt,
  mobilePrintRequestAt,
  mobileClearRequestAt,
  onClearResearch,
  ...layoutProps
}) => {
  return (
    <ResearchProvider>
      <MedisonAutoImport />
      <SectionLayout {...layoutProps} selectedStudies={selectedStudies}>
        <ResearchWorkspace
          selectedStudies={selectedStudies}
          isDraftActive={isDraftActive}
          mobileSaveRequestAt={mobileSaveRequestAt}
          mobilePrintRequestAt={mobilePrintRequestAt}
          mobileClearRequestAt={mobileClearRequestAt}
          onClearResearch={onClearResearch}
          sectionRefs={layoutProps.sectionRefs}
        />
      </SectionLayout>
    </ResearchProvider>
  );
};

export default ResearchSection;
