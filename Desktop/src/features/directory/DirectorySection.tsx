import React from "react";

import { Directory } from "@components/directory";

import SectionLayout, {
  type SectionLayoutNavProps,
} from "@layout/SectionLayout";

type DirectorySectionProps = SectionLayoutNavProps & {
  selectedDirectoryItem: string;
};

const DirectorySection: React.FC<DirectorySectionProps> = ({
  selectedDirectoryItem,
  ...layoutProps
}) => {
  return (
    <SectionLayout {...layoutProps} selectedDirectoryItem={selectedDirectoryItem}>
      <Directory selectedDirectoryItem={selectedDirectoryItem} />
    </SectionLayout>
  );
};

export default DirectorySection;
