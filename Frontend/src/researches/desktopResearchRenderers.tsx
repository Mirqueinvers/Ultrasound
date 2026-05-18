import type { ComponentType, MutableRefObject, ReactNode, RefObject } from "react";

import { findDesktopResearchRegistryItem } from "./desktopResearchRegistry";
import type { SectionKey } from "@/protocols";
import type { DesktopStudiesDataMap, DesktopStudyData } from "./types";

export interface DesktopResearchRenderArgs {
  study: string;
  studiesData: DesktopStudiesDataMap;
  setStudyData: (study: string, data: DesktopStudyData) => void;
  sectionRefs: MutableRefObject<Record<SectionKey, RefObject<HTMLDivElement | null>>>;
}

export function renderDesktopResearch({
  study,
  studiesData,
  setStudyData,
  sectionRefs,
}: DesktopResearchRenderArgs): ReactNode {
  const item = findDesktopResearchRegistryItem(study);
  if (!item) {
    return null;
  }

  const Component = item.component as ComponentType<any>;
  const componentProps: Record<string, any> = {
    value: studiesData[item.studyKey],
    onChange: (updated: DesktopStudyData) => setStudyData(item.studyKey, updated),
  };

  if (item.supportsSectionRefs) {
    componentProps.sectionRefs = sectionRefs.current;
  }

  return <Component {...componentProps} />;
}
