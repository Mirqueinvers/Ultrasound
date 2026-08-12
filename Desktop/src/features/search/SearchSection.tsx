import React from "react";

import { SearchSection as SearchSectionView } from "@/components/search/SearchSection";

import SectionLayout, {
  type SectionLayoutNavProps,
} from "@layout/SectionLayout";

type SearchSectionProps = SectionLayoutNavProps;

const SearchSection: React.FC<SearchSectionProps> = (props) => {
  return (
    <SectionLayout {...props}>
      <SearchSectionView />
    </SectionLayout>
  );
};

export default SearchSection;
