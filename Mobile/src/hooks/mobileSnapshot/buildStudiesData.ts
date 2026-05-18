import { normalizeIncomingStudyData } from "../../sync/adapters";
import type { MobileStudiesDataMap } from "../../protocols/types";

export function buildStudiesData(snapshot: {
  studiesData: Record<string, unknown>;
}): MobileStudiesDataMap {
  const result: MobileStudiesDataMap = {};

  Object.entries(snapshot.studiesData).forEach(([studyType, value]) => {
    result[studyType] = normalizeIncomingStudyData(studyType, value);
  });

  return result;
}
