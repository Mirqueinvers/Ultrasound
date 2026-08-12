import React from "react";

import Journal from "@/components/journal/Journal";
import MedisonAutoImport from "@/components/registry/MedisonAutoImport";

import { ResearchProvider } from "@contexts/ResearchProvider";
import SectionLayout, {
  type SectionLayoutNavProps,
} from "@layout/SectionLayout";

type JournalSectionProps = SectionLayoutNavProps;

const JournalSection: React.FC<JournalSectionProps> = (props) => {
  return (
    <ResearchProvider>
      <MedisonAutoImport />
      <SectionLayout {...props}>
        <Journal />
      </SectionLayout>
    </ResearchProvider>
  );
};

export default JournalSection;