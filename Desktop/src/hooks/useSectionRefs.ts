import React from "react";

import { getAllSectionKeys, type SectionKey } from "@/protocols";

export const useSectionRefs = () => {
  const sectionRefs = React.useRef<
    Record<SectionKey, React.RefObject<HTMLDivElement | null>>
  >(
    getAllSectionKeys().reduce(
      (accumulator, key) => {
        accumulator[key] = React.createRef<HTMLDivElement>();
        return accumulator;
      },
      {} as Record<SectionKey, React.RefObject<HTMLDivElement | null>>,
    ),
  );

  return sectionRefs;
};

