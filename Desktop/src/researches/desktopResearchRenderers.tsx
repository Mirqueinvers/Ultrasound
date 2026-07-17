import type { ComponentType, MutableRefObject, ReactNode, RefObject } from "react";

import { findDesktopResearchRegistryItem } from "./desktopResearchRegistry";
import type { SectionKey } from "@/protocols";
import type { DesktopStudiesDataMap, DesktopStudyData } from "./types";
import { DynamicProtocolForm } from "@/constructor/components/DynamicProtocolForm";
import { getCustomSchemas } from "@/constructor/utils/protocolRegistry";

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
  // Сначала проверяем встроенные протоколы
  const item = findDesktopResearchRegistryItem(study);
  if (item) {
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

  // Проверяем кастомные протоколы
  const customSchemas = getCustomSchemas();
  const customSchema = customSchemas.find((s) => s.selectionLabel === study);
  if (customSchema) {
    return (
      <DynamicProtocolForm
        schema={customSchema}
        value={studiesData[customSchema.selectionLabel] as Record<string, any>}
        onChange={(updated) => setStudyData(customSchema.selectionLabel, updated)}
      />
    );
  }

  return null;
}
