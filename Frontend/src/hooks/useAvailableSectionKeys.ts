import { useMemo } from "react";

import { getAvailableSectionKeys, type SectionKey } from "@/protocols";

export const useAvailableSectionKeys = (
  selectedStudies: string[],
): SectionKey[] => {
  return useMemo(
    () => getAvailableSectionKeys(selectedStudies),
    [selectedStudies],
  );
};

