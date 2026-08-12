import React from "react";

import Statistics from "@/components/statistics/Statistics";

import SectionLayout, {
  type SectionLayoutNavProps,
} from "@layout/SectionLayout";

type StatisticsSectionProps = SectionLayoutNavProps;

const StatisticsSection: React.FC<StatisticsSectionProps> = (props) => {
  return (
    <SectionLayout {...props}>
      <Statistics />
    </SectionLayout>
  );
};

export default StatisticsSection;